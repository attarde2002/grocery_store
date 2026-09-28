package net.grocery.payment_service.service;

import net.grocery.payment_service.dto.PaymentRequest;
import net.grocery.payment_service.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse processPayment(
            PaymentRequest request);

    PaymentResponse getPaymentById(
            Long paymentId);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse updatePaymentStatus(Long orderId, String status);

    List<PaymentResponse> getAllPayments();
}