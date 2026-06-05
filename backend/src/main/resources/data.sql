-- 测试用户 (密码: 123456, SHA-256)
MERGE INTO `user` KEY(username) VALUES
(1, 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '管理员', CURRENT_TIMESTAMP);

-- 默认分类
MERGE INTO `category` KEY(id) VALUES
(1, '生活',  0, CURRENT_TIMESTAMP),
(2, '工作',  0, CURRENT_TIMESTAMP),
(3, '学习',  0, CURRENT_TIMESTAMP),
(4, '旅行',  0, CURRENT_TIMESTAMP);

-- 测试文档
MERGE INTO `document` KEY(id) VALUES
(1, '欢迎使用日常生活记录系统', '这是您的第一篇文档。您可以在这里记录日常生活的点点滴滴，包括工作笔记、学习心得、生活感悟等。', 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '工作周报 - 第一周', '本周主要完成了项目需求分析，整理了用户反馈，制定了下一阶段的开发计划。', 2, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '学习笔记：Java Stream API', 'Java 8 引入的 Stream API 极大简化了集合操作。', 3, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
