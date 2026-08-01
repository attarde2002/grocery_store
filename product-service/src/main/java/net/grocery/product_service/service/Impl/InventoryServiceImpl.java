package net.grocery.product_service.service.Impl;

import lombok.RequiredArgsConstructor;
import net.grocery.product_service.dto.InventoryResponse;
import net.grocery.product_service.dto.StockRequest;
import net.grocery.product_service.entity.Inventory;
import net.grocery.product_service.exception.ResourceNotFoundException;
import net.grocery.product_service.repository.InventoryRepository;
import net.grocery.product_service.service.InventoryService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl
        implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public InventoryResponse getInventory(
            Long productId) {

        Inventory inventory =
                inventoryRepository
                        .findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found"));

        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse addStock(
            Long productId,
            StockRequest request) {

        Inventory inventory =
                inventoryRepository
                        .findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found"));

        inventory.setQuantity(
                inventory.getQuantity()
                        + request.getQuantity());

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public InventoryResponse removeStock(
            Long productId,
            StockRequest request) {

        Inventory inventory =
                inventoryRepository
                        .findByProductId(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inventory not found"));

        if (inventory.getQuantity()
                < request.getQuantity()) {

            throw new RuntimeException(
                    "Insufficient Stock");
        }

        inventory.setQuantity(
                inventory.getQuantity()
                        - request.getQuantity());

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    private InventoryResponse mapToResponse(
            Inventory inventory) {

        return InventoryResponse.builder()
                .productId(
                        inventory.getProduct().getId())
                .quantity(
                        inventory.getQuantity())
                .reorderLevel(
                        inventory.getReorderLevel())
                .build();
    }
    @Override
    public void restoreStock(
            Long productId,
            Integer quantity) {

        Inventory inventory =
                inventoryRepository
                        .findByProductId(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory not found"));

        inventory.setQuantity(
                inventory.getQuantity() + quantity);

        inventoryRepository.save(inventory);
    }
}