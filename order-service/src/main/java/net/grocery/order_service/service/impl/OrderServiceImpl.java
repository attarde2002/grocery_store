package net.grocery.order_service.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.grocery.order_service.client.PaymentServiceClient;
import net.grocery.order_service.client.ProductServiceClient;
import net.grocery.order_service.dto.OrderItemRequest;
import net.grocery.order_service.dto.OrderItemResponse;
import net.grocery.order_service.dto.OrderRequest;
import net.grocery.order_service.dto.OrderResponse;
import net.grocery.order_service.dto.external.InventoryResponseDto;
import net.grocery.order_service.dto.external.PaymentRequestDto;
import net.grocery.order_service.dto.external.PaymentResponseDto;
import net.grocery.order_service.dto.external.ProductResponseDto;
import net.grocery.order_service.dto.external.StockRequestDto;
import net.grocery.order_service.entity.Order;
import net.grocery.order_service.entity.OrderItem;
import net.grocery.order_service.enums.OrderStatus;
import net.grocery.order_service.exception.InsufficientStockException;
import net.grocery.order_service.repository.OrderItemRepository;
import net.grocery.order_service.repository.OrderRepository;
import net.grocery.order_service.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductServiceClient productServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request, Long userId) {
        log.info("===== PLACE ORDER START for User ID: {} =====", userId);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        List<OrderItem> orderItemsToSave = new ArrayList<>();

        // 1. Validate items, stock, calculate totals, and reserve stock
        for (OrderItemRequest item : request.getItems()) {
            ProductResponseDto product = productServiceClient.getProductById(item.getProductId());
            if (product == null) {
                throw new RuntimeException("Product Service returned NULL for ID: " + item.getProductId());
            }

            InventoryResponseDto inventory = productServiceClient.getInventory(item.getProductId());
            if (inventory == null) {
                throw new RuntimeException("Inventory Service returned NULL for ID: " + item.getProductId());
            }

            if (inventory.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            StockRequestDto stockRequest = StockRequestDto.builder()
                    .quantity(item.getQuantity())
                    .build();
            productServiceClient.removeStock(item.getProductId(), stockRequest);

            if (product.getPrice() == null) {
                throw new RuntimeException("Product price is NULL for ID: " + item.getProductId());
            }

            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            itemResponses.add(
                    OrderItemResponse.builder()
                            .productId(product.getId())
                            .quantity(item.getQuantity())
                            .price(product.getPrice())
                            .subTotal(subTotal)
                            .build()
            );

            // Prepare OrderItem entities to be attached to order
            orderItemsToSave.add(
                    OrderItem.builder()
                            .productId(product.getId())
                            .quantity(item.getQuantity())
                            .price(product.getPrice())
                            .build()
            );
        }

        // 2. Build and save base Order entity
        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .orderStatus(OrderStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 3. Save associated OrderItems
        for (OrderItem orderItem : orderItemsToSave) {
            orderItem.setOrder(savedOrder);
            orderItemRepository.save(orderItem);
        }

        // 4. Extract Payment Method dynamically from incoming request
        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod()
                : "COD";

        PaymentRequestDto paymentRequest = PaymentRequestDto.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .amount(savedOrder.getTotalAmount())
                .paymentMethod(paymentMethod) // Dynamic payment method passed from React
                .build();

        log.info("Calling Payment Service for Order ID: {} with Method: {}", savedOrder.getId(), paymentMethod);

        PaymentResponseDto paymentResponse;
        try {
            paymentResponse = paymentServiceClient.processPayment(paymentRequest);
            if (paymentResponse == null) {
                throw new RuntimeException("Payment Service returned NULL");
            }

            // Update status based on payment outcome
            if ("SUCCESS".equalsIgnoreCase(String.valueOf(paymentResponse.getPaymentStatus()))) {
                savedOrder.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(savedOrder);
            }

        } catch (Exception e) {
            log.error("Payment processing failed for Order ID: {}", savedOrder.getId(), e);

            // Compensation: restore stock and mark order as CANCELLED on failure
            for (OrderItemRequest item : request.getItems()) {
                StockRequestDto stockRequest = new StockRequestDto();
                stockRequest.setQuantity(item.getQuantity());
                productServiceClient.restoreStock(item.getProductId(), stockRequest);
            }

            savedOrder.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Payment failed. Order has been cancelled: " + e.getMessage());
        }

        log.info("===== PLACE ORDER SUCCESS (Order ID: {}) =====", savedOrder.getId());

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .totalAmount(savedOrder.getTotalAmount())
                .orderStatus(savedOrder.getOrderStatus())
                .paymentStatus(paymentResponse.getPaymentStatus())
                .transactionId(paymentResponse.getTransactionId())
                .createdAt(savedOrder.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        OrderStatus currentStatus = order.getOrderStatus();

        if (currentStatus == newStatus) {
            return mapToOrderResponse(order);
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of an already CANCELLED order");
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot change status of an already DELIVERED order");
        }

        switch (currentStatus) {
            case PENDING:
                if (newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELLED) {
                    throw new IllegalStateException("PENDING orders can only transition to CONFIRMED or CANCELLED");
                }
                break;

            case CONFIRMED:
                if (newStatus != OrderStatus.SHIPPED && newStatus != OrderStatus.CANCELLED) {
                    throw new IllegalStateException("CONFIRMED orders can only transition to SHIPPED or CANCELLED");
                }
                break;

            case SHIPPED:
                if (newStatus != OrderStatus.DELIVERED) {
                    throw new IllegalStateException("SHIPPED orders can only transition to DELIVERED");
                }
                break;

            default:
                break;
        }

        if (newStatus == OrderStatus.CANCELLED) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
            if (orderItems != null && !orderItems.isEmpty()) {
                for (OrderItem item : orderItems) {
                    StockRequestDto stockRequest = new StockRequestDto();
                    stockRequest.setQuantity(item.getQuantity());
                    productServiceClient.restoreStock(item.getProductId(), stockRequest);
                }
            }
        }

        order.setOrderStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        return mapToOrderResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled");
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        if (orderItems != null) {
            for (OrderItem item : orderItems) {
                StockRequestDto stockRequest = new StockRequestDto();
                stockRequest.setQuantity(item.getQuantity());
                productServiceClient.restoreStock(item.getProductId(), stockRequest);
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemResponse> itemResponses;

        if (orderItems != null && !orderItems.isEmpty()) {
            itemResponses = orderItems.stream()
                    .map(item -> {
                        BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                        BigDecimal subTotal = price.multiply(BigDecimal.valueOf(quantity));

                        return OrderItemResponse.builder()
                                .productId(item.getProductId())
                                .quantity(quantity)
                                .price(price)
                                .subTotal(subTotal)
                                .build();
                    })
                    .toList();
        } else {
            itemResponses = Collections.emptyList();
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}