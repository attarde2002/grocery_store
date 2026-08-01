package net.grocery.order_service.dto.external;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDto {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private String name;

    private String description;

    private String brand;

    private BigDecimal price;

    private String imageUrl;

    private Boolean isActive;
}
