package net.grocery.product_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockRequest {

    private Integer quantity;
}