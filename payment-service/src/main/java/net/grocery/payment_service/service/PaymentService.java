package net.grocery.payment_service.service;

import net.grocery.payment_service.dto.PaymentRequest;
import net.grocery.payment_service.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse processPayment(
            PaymentRequest request);

    PaymentResponse getPaymentById(
            Long paymentId);
}