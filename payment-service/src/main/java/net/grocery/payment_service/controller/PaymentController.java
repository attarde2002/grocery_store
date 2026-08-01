package net.grocery.payment_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.grocery.payment_service.dto.PaymentRequest;
import net.grocery.payment_service.dto.PaymentResponse;
import net.grocery.payment_service.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Autowired
    private  PaymentService paymentService;

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

    @GetMapping("/test")
    public String test() {

        return "Payment Service Working";
    }
}