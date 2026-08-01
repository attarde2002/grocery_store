package net.grocery.order_service.dto;

import lombok.*;
import net.grocery.order_service.dto.OrderItemResponse;
import net.grocery.order_service.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long orderId;

    private Long userId;

    private BigDecimal totalAmount;

    private OrderStatus orderStatus;

    private String paymentStatus;

    private String transactionId;

    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}