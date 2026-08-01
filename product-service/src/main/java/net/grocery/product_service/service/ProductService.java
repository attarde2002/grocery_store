package net.grocery.product_service.service;

import net.grocery.product_service.dto.ProductRequest;
import net.grocery.product_service.dto.ProductResponse;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id,
                                  ProductRequest request);

    void deleteProduct(Long id);
}
