package net.grocery.order_service.dto.external;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponseDto {

    private Long productId;

    private String productName;

    private Integer quantity;

    private Integer reorderLevel;

    private Boolean lowStock;
}