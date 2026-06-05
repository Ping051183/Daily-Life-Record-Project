-- =====================================================
-- 日常生活文档记录系统 - 数据库初始化脚本
-- 版本: V1.0
-- 数据库: MySQL 5.7+ / 8.0+
-- =====================================================

CREATE DATABASE IF NOT EXISTS life_record
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE life_record;

-- 用户表
DROP TABLE IF EXISTS user;
CREATE TABLE user (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    username    VARCHAR(50)  NOT NULL COMMENT '用户名（唯一）',
    password    VARCHAR(100) NOT NULL COMMENT '密码（SHA-256加密）',
    
ickname    VARCHAR(50)  NOT NULL COMMENT '昵称',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 分类表
DROP TABLE IF EXISTS category;
CREATE TABLE category (
    id          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    
ame        VARCHAR(30) NOT NULL COMMENT '分类名称',
    user_id     BIGINT      NOT NULL COMMENT '所属用户ID',
    create_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 文档表
DROP TABLE IF EXISTS document;
CREATE TABLE document (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    	itle       VARCHAR(200) NOT NULL COMMENT '文档标题',
    content     TEXT         COMMENT '文档内容',
    category_id BIGINT       COMMENT '分类ID',
    user_id     BIGINT       NOT NULL COMMENT '用户ID',
    status      INT          NOT NULL DEFAULT 0 COMMENT '状态 0=未完成 1=已完成',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_category_id (category_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档表';

-- 默认分类
INSERT INTO category (
ame, user_id, create_time) VALUES
('生活',  0, NOW()),
('工作',  0, NOW()),
('学习',  0, NOW()),
('旅行',  0, NOW());

-- 测试用户（密码: 123456, SHA-256）
INSERT INTO user (username, password, 
ickname, create_time) VALUES
('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '管理员', NOW());

-- 测试文档
INSERT INTO document (	itle, content, category_id, user_id, status, create_time, update_time) VALUES
('欢迎使用日常生活记录系统', '这是您的第一篇文档。您可以在这里记录日常生活的点点滴滴，包括工作笔记、学习心得、生活感悟等。', 1, 1, 1, NOW(), NOW()),
('工作周报 - 第一周', '本周主要完成了项目需求分析，整理了用户反馈，制定了下一阶段的开发计划。\n\n重点工作：\n1. 需求文档编写\n2. 用户访谈\n3. 技术选型调研', 2, 1, 1, NOW(), NOW()),
('学习笔记：Java Stream API', 'Java 8 引入的 Stream API 极大简化了集合操作。\n\n常用操作：\n- filter: 筛选元素\n- map: 映射转换\n- collect: 收集结果\n- sorted: 排序', 3, 1, 0, NOW(), NOW());

-- ---------------------------------------------------
-- 附件表 (attachment)
-- ---------------------------------------------------
DROP TABLE IF EXISTS ttachment;
CREATE TABLE ttachment (
    id            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    document_id   BIGINT       COMMENT '关联文档ID',
    user_id       BIGINT       NOT NULL COMMENT '上传用户ID',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_name   VARCHAR(255) NOT NULL COMMENT '存储文件名',
    ile_path     VARCHAR(500) NOT NULL COMMENT '文件存储路径',
    ile_size     BIGINT       NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
    ile_type     VARCHAR(100) COMMENT 'MIME类型',
    is_image      INT          NOT NULL DEFAULT 0 COMMENT '是否图片 0=否 1=是',
    create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (id),
    KEY idx_document_id (document_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';
