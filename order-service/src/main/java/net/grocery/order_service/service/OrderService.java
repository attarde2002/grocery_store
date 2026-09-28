package net.grocery.order_service.service;

import net.grocery.order_service.dto.OrderRequest;
import net.grocery.order_service.dto.OrderResponse;
import net.grocery.order_service.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(
            OrderRequest request,
            Long userId);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long orderId);

    List<OrderResponse> getOrdersByUserId(Long userId);

    OrderResponse cancelOrder(Long orderId);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
}