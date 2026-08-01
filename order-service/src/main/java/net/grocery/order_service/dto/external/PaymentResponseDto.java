package net.grocery.order_service.dto.external;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {

    private Long paymentId;

    private Long orderId;

    private Long userId;

    private BigDecimal amount;

    private String paymentStatus;

    private String transactionId;

    private LocalDateTime paymentDate;
}