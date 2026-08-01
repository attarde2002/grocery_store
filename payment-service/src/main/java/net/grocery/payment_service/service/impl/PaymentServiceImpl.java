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

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl
        implements PaymentService {
    @Autowired
    private  PaymentRepository paymentRepository;

    @Override
    public PaymentResponse processPayment(
            PaymentRequest request) {

        Payment payment = new Payment();

        payment.setOrderId(
                request.getOrderId());

        payment.setUserId(
                request.getUserId());

        payment.setAmount(
                request.getAmount());

        payment.setPaymentMethod(
                request.getPaymentMethod());

        payment.setTransactionId(
                UUID.randomUUID().toString());

        payment.setPaymentStatus(
                PaymentStatus.SUCCESS);

        payment.setCreatedAt(
                LocalDateTime.now());

        payment = paymentRepository.save(payment);

        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentById(
            Long paymentId) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"));

        return mapToResponse(payment);
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