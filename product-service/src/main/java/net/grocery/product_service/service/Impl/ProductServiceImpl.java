package net.grocery.product_service.service.Impl;

import net.grocery.product_service.dto.ProductRequest;
import net.grocery.product_service.dto.ProductResponse;
import net.grocery.product_service.entity.Category;
import net.grocery.product_service.entity.Inventory;
import net.grocery.product_service.entity.Product;
import net.grocery.product_service.exception.ResourceNotFoundException;
import net.grocery.product_service.repository.CategoryRepository;
import net.grocery.product_service.repository.InventoryRepository;
import net.grocery.product_service.repository.ProductRepository;
import net.grocery.product_service.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        Category category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"));

        Product product = new Product();

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        Product savedProduct =
                productRepository.save(product);

        Inventory inventory = new Inventory();

        inventory.setProduct(savedProduct);
        inventory.setQuantity(0);
        inventory.setReorderLevel(10);

        inventoryRepository.save(inventory);

        return mapToResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id : " + id));

        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id : " + id));

        Category category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"));

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id : " + id));

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {

        ProductResponse response =
                new ProductResponse();

        response.setId(product.getId());

        response.setCategoryId(
                product.getCategory().getId());

        response.setCategoryName(
                product.getCategory().getName());

        response.setName(product.getName());

        response.setDescription(
                product.getDescription());

        response.setBrand(
                product.getBrand());

        response.setPrice(
                product.getPrice());

        response.setImageUrl(
                product.getImageUrl());

        response.setIsActive(
                product.getIsActive());

        return response;
    }
}