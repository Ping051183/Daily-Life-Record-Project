package com.liferecord.controller;

import com.liferecord.entity.Attachment;
import com.liferecord.service.FileService;
import com.liferecord.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /** 上传单个文件 */
    @PostMapping("/upload")
    public Result<Attachment> uploadFile(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentId", required = false) Long documentId) {
        Long userId = (Long) request.getAttribute("userId");
        if (file.isEmpty()) {
            return Result.error("请选择文件");
        }
        try {
            Attachment attachment = fileService.uploadFile(file, documentId, userId);
            return Result.success(attachment);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /** 上传多个文件（支持文件夹） */
    @PostMapping("/uploadMultiple")
    public Result<List<Attachment>> uploadMultiple(
            HttpServletRequest request,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "documentId", required = false) Long documentId) {
        Long userId = (Long) request.getAttribute("userId");
        if (files == null || files.length == 0) {
            return Result.error("请选择文件");
        }
        try {
            List<Attachment> list = fileService.uploadMultipleFiles(files, documentId, userId);
            return Result.success(list);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /** 获取文档的附件列表 */
    @GetMapping("/list/{documentId}")
    public Result<List<Attachment>> listFiles(HttpServletRequest request, @PathVariable Long documentId) {
        Long userId = (Long) request.getAttribute("userId");
        List<Attachment> list = fileService.getFilesByDocument(documentId, userId);
        return Result.success(list);
    }

    /** 删除附件 */
    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteFile(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            fileService.deleteFile(id, userId);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    /** 预览/下载文件（图片直接显示，其他文件下载） */
    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewFile(@PathVariable Long id) {
        Attachment attachment = fileService.getFileById(id);
        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(uploadDir, attachment.getFilePath());
        File file = filePath.toFile();
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String contentType = attachment.getFileType();
        if (contentType == null) contentType = "application/octet-stream";

        String filename = attachment.getOriginalName();
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename*=UTF-8''" + encodedFilename)
                .body(resource);
    }

    /** 获取文件信息 */
    @GetMapping("/info/{id}")
    public Result<Attachment> getFileInfo(@PathVariable Long id) {
        Attachment attachment = fileService.getFileById(id);
        if (attachment == null) {
            return Result.error(404, "文件不存在");
        }
        return Result.success(attachment);
    }
}