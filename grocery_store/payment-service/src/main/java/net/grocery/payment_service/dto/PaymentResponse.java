package net.grocery.payment_service.dto;

import lombok.*;
import net.grocery.payment_service.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long orderId;

    private Long userId;

    private BigDecimal amount;

    private PaymentStatus paymentStatus;

    private String transactionId;

    private LocalDateTime paymentDate;
}