package net.grocery.product_service.contorller;

import jakarta.validation.Valid;
import net.grocery.product_service.dto.ProductRequest;
import net.grocery.product_service.dto.ProductResponse;
import net.grocery.product_service.service.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
    @RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService) {

        this.productService = productService;
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ProductResponse createProduct(
            @Valid @RequestBody ProductRequest request) {
        System.out.println("CREATE PRODUCT API HIT");
        return productService.createProduct(request);
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {

        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return productService.updateProduct(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return "Product deleted successfully";
    }

    @GetMapping("/debug")
    public String debug(Authentication authentication) {

        System.out.println("Authentication = " + authentication);
        System.out.println("Authorities = " + authentication.getAuthorities());

        return authentication.getAuthorities().toString();
    }
}

