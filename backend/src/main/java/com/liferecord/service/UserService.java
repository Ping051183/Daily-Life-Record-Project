package com.liferecord.service;

import com.liferecord.entity.User;

import java.util.Map;

public interface UserService {
    User register(String username, String password, String nickname);
    Map<String, Object> login(String username, String password);
    User getUserInfo(Long userId);
    User updateUser(Long userId, String nickname, String oldPassword, String newPassword);
}
