package com.liferecord.controller;

import com.liferecord.entity.User;
import com.liferecord.service.UserService;
import com.liferecord.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result<User> register(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        String nickname = params.get("nickname");

        if (username == null || password == null || nickname == null) {
            return Result.error("参数不完整");
        }
        if (username.length() < 3 || username.length() > 50) {
            return Result.error("用户名长度3-50个字符");
        }
        if (password.length() < 6) {
            return Result.error("密码长度不少于6位");
        }

        try {
            User user = userService.register(username, password, nickname);
            user.setPassword(null);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");

        if (username == null || password == null) {
            return Result.error("请输入用户名和密码");
        }

        try {
            Map<String, Object> result = userService.login(username, password);
            return Result.success(result);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/info")
    public Result<User> getUserInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userService.getUserInfo(userId);
        return Result.success(user);
    }

    @PutMapping("/update")
    public Result<User> updateUser(HttpServletRequest request, @RequestBody Map<String, String> params) {
        Long userId = (Long) request.getAttribute("userId");
        String nickname = params.get("nickname");
        String oldPassword = params.get("oldPassword");
        String newPassword = params.get("newPassword");

        try {
            User user = userService.updateUser(userId, nickname, oldPassword, newPassword);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}