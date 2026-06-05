package com.liferecord.service;

import com.liferecord.entity.Category;
import java.util.List;

public interface CategoryService {
    Category addCategory(String name, Long userId);
    List<Category> listCategories(Long userId);
    Category updateCategory(Long id, String name, Long userId);
    void deleteCategory(Long id, Long userId);
}
