-- 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `username`    VARCHAR(50)  NOT NULL,
    `password`    VARCHAR(100) NOT NULL,
    `nickname`    VARCHAR(50)  NOT NULL,
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);
CREATE UNIQUE INDEX IF NOT EXISTS `uk_username` ON `user`(`username`);

-- 分类表
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(30) NOT NULL,
    `user_id`     BIGINT      NOT NULL,
    `create_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);
CREATE INDEX IF NOT EXISTS `idx_category_user_id` ON `category`(`user_id`);

-- 文档表
DROP TABLE IF EXISTS `document`;
CREATE TABLE `document` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(200) NOT NULL,
    `content`     TEXT,
    `category_id` BIGINT,
    `user_id`     BIGINT       NOT NULL,
    `status`      INT          NOT NULL DEFAULT 0,
    `create_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);
CREATE INDEX IF NOT EXISTS `idx_doc_user_id` ON `document`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_doc_category_id` ON `document`(`category_id`);
CREATE INDEX IF NOT EXISTS `idx_doc_create_time` ON `document`(`create_time`);
