package net.grocery.order_service.service.impl;

import lombok.RequiredArgsConstructor;
import net.grocery.order_service.client.PaymentServiceClient;
import net.grocery.order_service.client.ProductServiceClient;
import net.grocery.order_service.dto.OrderItemRequest;
import net.grocery.order_service.dto.OrderItemResponse;
import net.grocery.order_service.dto.OrderRequest;
import net.grocery.order_service.dto.OrderResponse;
import net.grocery.order_service.dto.external.InventoryResponseDto;
import net.grocery.order_service.dto.external.PaymentRequestDto;
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
import net.grocery.order_service.dto.external.PaymentResponseDto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl
        implements OrderService {

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final ProductServiceClient productServiceClient;

    private final PaymentServiceClient paymentServiceClient;

    @Override
    public OrderResponse placeOrder(
            OrderRequest request,
            Long userId) {

        System.out.println("===== PLACE ORDER START =====");
        System.out.println("USER ID = " + userId);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItemRequest item : request.getItems()) {

            System.out.println("Processing Product ID = "
                    + item.getProductId());

            ProductResponseDto product =
                    productServiceClient.getProductById(
                            item.getProductId());

            System.out.println("Product Response = "
                    + product);

            if (product == null) {
                throw new RuntimeException(
                        "Product Service returned NULL");
            }

            InventoryResponseDto inventory =
                    productServiceClient.getInventory(
                            item.getProductId());

            System.out.println("Inventory Response = "
                    + inventory);

            if (inventory == null) {
                throw new RuntimeException(
                        "Inventory Service returned NULL");
            }

            if (inventory.getQuantity()
                    < item.getQuantity()) {

                throw new InsufficientStockException(
                        "Insufficient stock for product : "
                                + product.getName());
            }

            StockRequestDto stockRequest =
                    StockRequestDto.builder()
                            .quantity(item.getQuantity())
                            .build();

            productServiceClient.removeStock(
                    item.getProductId(),
                    stockRequest);

            if (product.getPrice() == null) {
                throw new RuntimeException(
                        "Product price is NULL");
            }

            BigDecimal subTotal =
                    product.getPrice().multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()));

            totalAmount =
                    totalAmount.add(subTotal);

            itemResponses.add(
                    OrderItemResponse.builder()
                            .productId(product.getId())
                            .quantity(item.getQuantity())
                            .price(product.getPrice())
                            .subTotal(subTotal)
                            .build());
        }

        System.out.println("TOTAL AMOUNT = "
                + totalAmount);

        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .orderStatus(OrderStatus.CONFIRMED)
                .build();

        System.out.println("Saving Order...");

        Order savedOrder =
                orderRepository.save(order);

        System.out.println("Order Saved ID = "
                + savedOrder.getId());

        PaymentRequestDto paymentRequest =
                PaymentRequestDto.builder()
                        .orderId(savedOrder.getId())
                        .userId(savedOrder.getUserId())
                        .amount(savedOrder.getTotalAmount())
                        .paymentMethod("UPI")
                        .build();

        System.out.println("Calling Payment Service...");

        PaymentResponseDto paymentResponse =
                paymentServiceClient.processPayment(
                        paymentRequest);

        System.out.println("Payment Response = "
                + paymentResponse);

        if (paymentResponse == null) {
            throw new RuntimeException(
                    "Payment Service returned NULL");
        }

        for (OrderItemRequest item :
                request.getItems()) {

            ProductResponseDto product =
                    productServiceClient.getProductById(
                            item.getProductId());

            OrderItem orderItem =
                    OrderItem.builder()
                            .order(savedOrder)
                            .productId(product.getId())
                            .quantity(item.getQuantity())
                            .price(product.getPrice())
                            .build();

            orderItemRepository.save(orderItem);
        }

        System.out.println("===== PLACE ORDER SUCCESS =====");

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .totalAmount(savedOrder.getTotalAmount())
                .orderStatus(savedOrder.getOrderStatus())
                .paymentStatus(
                        paymentResponse.getPaymentStatus())
                .transactionId(
                        paymentResponse.getTransactionId())
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
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(()-> new RuntimeException("Order Not Found"));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(
            Order order) {

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(
                        order.getId());

        List<OrderItemResponse> itemResponses =
                orderItems.stream()
                        .map(item -> {

                            BigDecimal subTotal =
                                    item.getPrice().multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()));

                            return OrderItemResponse.builder()
                                    .productId(item.getProductId())
                                    .quantity(item.getQuantity())
                                    .price(item.getPrice())
                                    .subTotal(subTotal)
                                    .build();
                        })
                        .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    public OrderResponse cancelOrder(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if(order.getOrderStatus()
                == OrderStatus.CANCELLED) {

            throw new RuntimeException(
                    "Order already cancelled");
        }

        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderId(orderId);

        for(OrderItem item : orderItems) {

            StockRequestDto stockRequest =
                    new StockRequestDto();

            stockRequest.setQuantity(
                    item.getQuantity());

            productServiceClient.restoreStock(
                    item.getProductId(),
                    stockRequest);
        }

        order.setOrderStatus(
                OrderStatus.CANCELLED);

        Order savedOrder =
                orderRepository.save(order);

        return mapToOrderResponse(
                savedOrder);
    }
}
