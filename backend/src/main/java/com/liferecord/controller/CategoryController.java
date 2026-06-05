package com.liferecord.controller;

import com.liferecord.entity.Category;
import com.liferecord.service.CategoryService;
import com.liferecord.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/add")
    public Result<Category> addCategory(HttpServletRequest request, @RequestBody Map<String, String> params) {
        Long userId = (Long) request.getAttribute("userId");
        String name = params.get("name");
        if (name == null || name.trim().isEmpty()) {
            return Result.error("分类名称不能为空");
        }
        Category category = categoryService.addCategory(name.trim(), userId);
        return Result.success(category);
    }

    @GetMapping("/list")
    public Result<List<Category>> listCategories(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Category> list = categoryService.listCategories(userId);
        return Result.success(list);
    }

    @PutMapping("/update")
    public Result<Category> updateCategory(HttpServletRequest request, @RequestBody Map<String, String> params) {
        Long userId = (Long) request.getAttribute("userId");
        Long id = Long.parseLong(params.get("id"));
        String name = params.get("name");
        if (name == null || name.trim().isEmpty()) {
            return Result.error("分类名称不能为空");
        }
        try {
            Category category = categoryService.updateCategory(id, name.trim(), userId);
            return Result.success(category);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteCategory(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            categoryService.deleteCategory(id, userId);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}