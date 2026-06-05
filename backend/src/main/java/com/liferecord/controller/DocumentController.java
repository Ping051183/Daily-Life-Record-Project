package com.liferecord.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liferecord.entity.Document;
import com.liferecord.service.DocumentService;
import com.liferecord.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/document")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/add")
    public Result<Document> addDocument(HttpServletRequest request, @RequestBody Document document) {
        Long userId = (Long) request.getAttribute("userId");
        if (document.getTitle() == null || document.getTitle().trim().isEmpty()) {
            return Result.error("文档标题不能为空");
        }
        Document created = documentService.addDocument(document, userId);
        return Result.success(created);
    }

    @GetMapping("/list")
    public Result<IPage<Document>> listDocuments(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status) {
        Long userId = (Long) request.getAttribute("userId");
        IPage<Document> result = documentService.listDocuments(userId, categoryId, status, page, size);
        return Result.success(result);
    }

    @GetMapping("/detail/{id}")
    public Result<Document> getDocumentDetail(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        Document document = documentService.getDocumentDetail(id, userId);
        if (document == null) {
            return Result.error(404, "文档不存在");
        }
        return Result.success(document);
    }

    @PutMapping("/update")
    public Result<Document> updateDocument(HttpServletRequest request, @RequestBody Document document) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            Document updated = documentService.updateDocument(document, userId);
            return Result.success(updated);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteDocument(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        documentService.deleteDocument(id, userId);
        return Result.success();
    }

    @PostMapping("/batchDelete")
    public Result<Void> batchDelete(HttpServletRequest request, @RequestBody Map<String, Long[]> params) {
        Long userId = (Long) request.getAttribute("userId");
        Long[] ids = params.get("ids");
        if (ids == null || ids.length == 0) {
            return Result.error("请选择要删除的文档");
        }
        documentService.batchDelete(ids, userId);
        return Result.success();
    }

    @GetMapping("/search")
    public Result<IPage<Document>> searchDocuments(
            HttpServletRequest request,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        IPage<Document> result = documentService.searchDocuments(userId, keyword, page, size);
        return Result.success(result);
    }
}