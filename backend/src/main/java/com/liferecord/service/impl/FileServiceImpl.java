package com.liferecord.service.impl;

import com.liferecord.entity.Attachment;
import com.liferecord.mapper.AttachmentMapper;
import com.liferecord.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private AttachmentMapper attachmentMapper;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录: " + uploadDir, e);
        }
    }

    @Override
    public Attachment uploadFile(MultipartFile file, Long documentId, Long userId) {
        if (file.isEmpty()) {
            throw new RuntimeException("文件为空");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "unknown";

        // 生成存储路径：uploads/yyyy/MM/dd/uuid.ext
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String ext = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex > 0) {
            ext = originalName.substring(dotIndex).toLowerCase();
        }
        String storedName = UUID.randomUUID().toString() + ext;
        String relativePath = datePath + "/" + storedName;
        Path fullPath = Paths.get(uploadDir, relativePath);

        try {
            Files.createDirectories(fullPath.getParent());
            Files.copy(file.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }

        String contentType = file.getContentType();
        boolean isImage = contentType != null && contentType.startsWith("image/");

        Attachment attachment = new Attachment();
        attachment.setDocumentId(documentId);
        attachment.setUserId(userId);
        attachment.setOriginalName(originalName);
        attachment.setStoredName(storedName);
        attachment.setFilePath(relativePath);
        attachment.setFileSize(file.getSize());
        attachment.setFileType(contentType);
        attachment.setIsImage(isImage ? 1 : 0);

        attachmentMapper.insert(attachment);
        return attachment;
    }

    @Override
    public List<Attachment> uploadMultipleFiles(MultipartFile[] files, Long documentId, Long userId) {
        List<Attachment> list = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                list.add(uploadFile(file, documentId, userId));
            }
        }
        return list;
    }

    @Override
    public List<Attachment> getFilesByDocument(Long documentId, Long userId) {
        return attachmentMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Attachment>()
                        .eq(Attachment::getDocumentId, documentId)
                        .eq(Attachment::getUserId, userId)
                        .orderByDesc(Attachment::getCreateTime));
    }

    @Override
    public void deleteFile(Long id, Long userId) {
        Attachment attachment = attachmentMapper.selectById(id);
        if (attachment == null) {
            throw new RuntimeException("文件不存在");
        }
        if (!attachment.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此文件");
        }

        // 删除磁盘文件
        try {
            Path filePath = Paths.get(uploadDir, attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // 文件不存在也继续
        }

        attachmentMapper.deleteById(id);
    }

    @Override
    public Attachment getFileById(Long id) {
        return attachmentMapper.selectById(id);
    }
}