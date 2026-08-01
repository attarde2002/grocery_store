package net.grocery.product_service.contorller;

import lombok.RequiredArgsConstructor;
import net.grocery.product_service.dto.InventoryResponse;
import net.grocery.product_service.dto.StockRequest;
import net.grocery.product_service.service.InventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public InventoryResponse getInventory(
            @PathVariable Long productId) {

        return inventoryService
                .getInventory(productId);
    }

    @PutMapping("/add-stock/{productId}")
    public InventoryResponse addStock(
            @PathVariable Long productId,
            @RequestBody StockRequest request) {

        return inventoryService
                .addStock(productId, request);
    }

    @PutMapping("/remove-stock/{productId}")
    public InventoryResponse removeStock(
            @PathVariable Long productId,
            @RequestBody StockRequest request) {

        return inventoryService
                .removeStock(productId, request);
    }

    @PutMapping("/restore-stock/{productId}")
    public String restoreStock(
            @PathVariable Long productId,
            @RequestBody StockRequest request) {

        inventoryService.restoreStock(
                productId,
                request.getQuantity());

        return "Stock restored successfully";
    }
}