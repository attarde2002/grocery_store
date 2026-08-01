package net.grocery.order_service.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long productId;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal subTotal;
}