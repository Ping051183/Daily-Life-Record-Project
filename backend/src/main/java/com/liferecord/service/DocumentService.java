package com.liferecord.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liferecord.entity.Document;

public interface DocumentService {
    Document addDocument(Document document, Long userId);
    IPage<Document> listDocuments(Long userId, Long categoryId, Integer status, int page, int size);
    Document getDocumentDetail(Long id, Long userId);
    Document updateDocument(Document document, Long userId);
    void deleteDocument(Long id, Long userId);
    void batchDelete(Long[] ids, Long userId);
    IPage<Document> searchDocuments(Long userId, String keyword, int page, int size);
}
