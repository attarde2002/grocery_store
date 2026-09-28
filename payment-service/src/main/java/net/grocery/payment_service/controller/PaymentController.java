package net.grocery.payment_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.grocery.payment_service.dto.PaymentRequest;
import net.grocery.payment_service.dto.PaymentResponse;
import net.grocery.payment_service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public PaymentResponse processPayment(
            @Valid @RequestBody PaymentRequest request) {

        return paymentService.processPayment(
                request);
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPaymentById(
            @PathVariable Long paymentId) {

        return paymentService.getPaymentById(
                paymentId);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(@PathVariable Long orderId) {
        return paymentService.getPaymentByOrderId(orderId);
    }

    // PUT /api/payments/{orderId}/status?status=SUCCESS
    @PutMapping("/{orderId}/status")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        PaymentResponse response = paymentService.updatePaymentStatus(orderId, status);
        return ResponseEntity.ok(response);
    }
    // Add to PaymentController.java

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
}