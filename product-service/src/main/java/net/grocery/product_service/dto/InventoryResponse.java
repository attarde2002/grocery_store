package net.grocery.product_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long productId;

    private Integer quantity;

    private Integer reorderLevel;
}