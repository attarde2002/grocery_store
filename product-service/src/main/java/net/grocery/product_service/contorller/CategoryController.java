package net.grocery.product_service.contorller;

import jakarta.validation.Valid;
import net.grocery.product_service.dto.CategoryRequest;
import net.grocery.product_service.dto.CategoryResponse;
import net.grocery.product_service.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(
            CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public CategoryResponse createCategory(
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.createCategory(request);
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public CategoryResponse getCategoryById(
            @PathVariable Long id) {

        return categoryService.getCategoryById(id);
    }

    @PutMapping("/{id}")
    public CategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteCategory(
            @PathVariable Long id) {

        categoryService.deleteCategory(id);

        return "Category deleted successfully";
    }
}
