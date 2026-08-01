package net.grocery.product_service.service;

import net.grocery.product_service.dto.InventoryResponse;
import net.grocery.product_service.dto.StockRequest;

public interface InventoryService {

    InventoryResponse getInventory(Long productId);

    InventoryResponse addStock(
            Long productId,
            StockRequest request);

    InventoryResponse removeStock(
            Long productId,
            StockRequest request);

    void restoreStock(
            Long productId,
            Integer quantity);
}