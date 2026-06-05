package com.liferecord.service;

import com.liferecord.entity.Attachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    Attachment uploadFile(MultipartFile file, Long documentId, Long userId);
    List<Attachment> uploadMultipleFiles(MultipartFile[] files, Long documentId, Long userId);
    List<Attachment> getFilesByDocument(Long documentId, Long userId);
    void deleteFile(Long id, Long userId);
    Attachment getFileById(Long id);
}