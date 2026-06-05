package com.liferecord.service.impl;

import com.liferecord.entity.Category;
import com.liferecord.mapper.CategoryMapper;
import com.liferecord.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public Category addCategory(String name, Long userId) {
        Category category = new Category();
        category.setName(name);
        category.setUserId(userId);
        categoryMapper.insert(category);
        return category;
    }

    @Override
    @Cacheable(value = "categories", key = "#userId", unless = "#result == null or #result.isEmpty()")
    public List<Category> listCategories(Long userId) {
        return categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                        .eq(Category::getUserId, userId)
                        .or()
                        .eq(Category::getUserId, 0L)
                        .orderByAsc(Category::getCreateTime));
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, String name, Long userId) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        category.setName(name);
        categoryMapper.updateById(category);
        return category;
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id, Long userId) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        categoryMapper.deleteById(id);
    }
}
