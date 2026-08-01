package net.grocery.order_service.client;

import net.grocery.order_service.dto.external.PaymentRequestDto;
import net.grocery.order_service.dto.external.PaymentResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentServiceClient {

    @PostMapping("/api/payments")
    PaymentResponseDto processPayment(
            @RequestBody PaymentRequestDto request);
}