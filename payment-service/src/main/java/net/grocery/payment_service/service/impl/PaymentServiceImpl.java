package net.grocery.payment_service.service.impl;

import lombok.RequiredArgsConstructor;
import net.grocery.payment_service.dto.PaymentRequest;
import net.grocery.payment_service.dto.PaymentResponse;
import net.grocery.payment_service.entity.Payment;
import net.grocery.payment_service.enums.PaymentStatus;
import net.grocery.payment_service.repository.PaymentRepository;
import net.grocery.payment_service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        // 1. Prevent duplicate rows for the same Order ID
        return paymentRepository.findByOrderId(request.getOrderId())
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    Payment payment = new Payment();

                    payment.setOrderId(request.getOrderId());
                    payment.setUserId(request.getUserId());
                    payment.setAmount(request.getAmount());
                    payment.setPaymentMethod(request.getPaymentMethod());
                    payment.setTransactionId(UUID.randomUUID().toString());

                    String methodStr = request.getPaymentMethod() != null ? String.valueOf(request.getPaymentMethod()) : "";

                    if ("COD".equalsIgnoreCase(methodStr)) {
                        payment.setPaymentStatus(PaymentStatus.PENDING);
                    } else {
                        payment.setPaymentStatus(PaymentStatus.SUCCESS);
                    }

                    payment.setCreatedAt(LocalDateTime.now());
                    Payment savedPayment = paymentRepository.save(payment);
                    return mapToResponse(savedPayment);
                });
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Order ID: " + orderId));

        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(Long orderId, String status) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for Order ID: " + orderId));

        PaymentStatus targetStatus;
        try {
            targetStatus = PaymentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment status: " + status);
        }

        // Lock terminal states: SUCCESS, FAILED, and REFUNDED block further status changes
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS ||
                payment.getPaymentStatus() == PaymentStatus.FAILED ||
                payment.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new IllegalArgumentException("Cannot modify payment status once it is marked as " + payment.getPaymentStatus());
        }

        payment.setPaymentStatus(targetStatus);
        Payment savedPayment = paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    private PaymentResponse mapToResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setUserId(payment.getUserId());
        response.setAmount(payment.getAmount());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getCreatedAt());

        return response;
    }
}