package net.grocery.order_service.dto.external;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {

    private Long orderId;

    private Long userId;

    private BigDecimal amount;

    private String paymentMethod;
}