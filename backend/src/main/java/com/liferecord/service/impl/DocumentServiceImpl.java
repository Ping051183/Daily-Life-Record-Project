package com.liferecord.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.liferecord.entity.Document;
import com.liferecord.mapper.DocumentMapper;
import com.liferecord.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentMapper documentMapper;

    @Override
    @CacheEvict(value = "documents", allEntries = true)
    public Document addDocument(Document document, Long userId) {
        document.setId(null);
        document.setUserId(userId);
        if (document.getStatus() == null) {
            document.setStatus(0);
        }
        documentMapper.insert(document);
        return document;
    }

    @Override
    public IPage<Document> listDocuments(Long userId, Long categoryId, Integer status, int page, int size) {
        Page<Document> pageParam = new Page<>(page, Math.min(size, 100));
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<Document>()
                .eq(Document::getUserId, userId);

        if (categoryId != null && categoryId > 0) {
            wrapper.eq(Document::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(Document::getStatus, status);
        }

        wrapper.orderByDesc(Document::getCreateTime);
        return documentMapper.selectPage(pageParam, wrapper);
    }

    @Override
    @Cacheable(value = "documents", key = "#id", unless = "#result == null")
    public Document getDocumentDetail(Long id, Long userId) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<Document>()
                .eq(Document::getId, id)
                .eq(Document::getUserId, userId);
        return documentMapper.selectOne(wrapper);
    }

    @Override
    @CacheEvict(value = "documents", key = "#document.id")
    public Document updateDocument(Document document, Long userId) {
        Document existing = documentMapper.selectById(document.getId());
        if (existing == null || !existing.getUserId().equals(userId)) {
            throw new RuntimeException("文档不存在或无权操作");
        }
        document.setUserId(userId);
        documentMapper.updateById(document);
        return documentMapper.selectById(document.getId());
    }

    @Override
    @CacheEvict(value = "documents", key = "#id")
    public void deleteDocument(Long id, Long userId) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<Document>()
                .eq(Document::getId, id)
                .eq(Document::getUserId, userId);
        documentMapper.delete(wrapper);
    }

    @Override
    @CacheEvict(value = "documents", allEntries = true)
    public void batchDelete(Long[] ids, Long userId) {
        for (Long id : ids) {
            deleteDocument(id, userId);
        }
    }

    @Override
    public IPage<Document> searchDocuments(Long userId, String keyword, int page, int size) {
        Page<Document> pageParam = new Page<>(page, Math.min(size, 100));
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<Document>()
                .eq(Document::getUserId, userId)
                .like(keyword != null && !keyword.isEmpty(), Document::getTitle, keyword)
                .or()
                .eq(Document::getUserId, userId)
                .like(keyword != null && !keyword.isEmpty(), Document::getContent, keyword)
                .orderByDesc(Document::getCreateTime);
        return documentMapper.selectPage(pageParam, wrapper);
    }
}
