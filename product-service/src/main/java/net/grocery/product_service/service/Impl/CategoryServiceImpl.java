package net.grocery.product_service.service.Impl;

import net.grocery.product_service.dto.CategoryRequest;
import net.grocery.product_service.dto.CategoryResponse;
import net.grocery.product_service.entity.Category;
import net.grocery.product_service.exception.ResourceNotFoundException;
import net.grocery.product_service.repository.CategoryRepository;
import net.grocery.product_service.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(
            CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponse createCategory(
            CategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved =
                categoryRepository.save(category);

        return mapToResponse(saved);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"));

        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"));

        category.setName(request.getName());
        category.setDescription(
                request.getDescription());

        Category updated =
                categoryRepository.save(category);

        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"));

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(
            Category category) {

        CategoryResponse response =
                new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(
                category.getDescription());
        response.setIsActive(
                category.getIsActive());

        return response;
    }
}