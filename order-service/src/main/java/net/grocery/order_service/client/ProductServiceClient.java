package net.grocery.order_service.client;

import net.grocery.order_service.dto.external.InventoryResponseDto;
import net.grocery.order_service.dto.external.ProductResponseDto;
import net.grocery.order_service.dto.external.StockRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    ProductResponseDto getProductById(
            @PathVariable Long id);

    @GetMapping("/api/inventory/{productId}")
    InventoryResponseDto getInventory(
            @PathVariable Long productId);

    @PutMapping("/api/inventory/remove-stock/{productId}")
    InventoryResponseDto removeStock(
            @PathVariable Long productId,
            @RequestBody StockRequestDto request);

    // NEW METHOD
    @PutMapping("/api/inventory/restore-stock/{productId}")
    String restoreStock(
            @PathVariable Long productId,
            @RequestBody StockRequestDto request);
}