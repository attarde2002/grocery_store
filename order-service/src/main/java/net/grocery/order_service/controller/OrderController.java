package net.grocery.order_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.grocery.order_service.dto.OrderRequest;
import net.grocery.order_service.dto.OrderResponse;
import net.grocery.order_service.service.JwtService;
import net.grocery.order_service.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtService jwtService;

    @PostMapping
    public OrderResponse placeOrder(
            @RequestHeader("Authorization")
            String authHeader,

            @Valid @RequestBody
            OrderRequest request) {

        String token =
                authHeader.substring(7);

        Long userId =
                jwtService.extractUserId(
                        token);

        return orderService.placeOrder(
                request,
                userId);
    }
    @GetMapping
    public List<OrderResponse> getAllOrders() {

        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(
            @PathVariable Long id) {

        return orderService.getOrderById(id);
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponse> getOrdersByUserId(
            @PathVariable Long userId) {

        return orderService.getOrdersByUserId(userId);
    }
    @PutMapping("/{id}/cancel")
    public OrderResponse cancelOrder(
            @PathVariable Long id) {

        return orderService.cancelOrder(id);
    }
}