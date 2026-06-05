package com.liferecord.config;

import com.liferecord.util.Result;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
public class NoRepeatSubmitAspect {

    // Redis 可选注入：有就用 Redis，没有就用本地 ConcurrentHashMap
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    // 本地降级存储（无 Redis 时使用）
    private final Map<String, Long> localCache = new ConcurrentHashMap<>();

    @Around("@annotation(com.liferecord.config.NoRepeatSubmit)")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();

        // 用户指纹
        String token = request.getHeader("Authorization");
        String userId = "anonymous";
        if (token != null && token.startsWith("Bearer ")) {
            userId = token.length() > 20 ? token.substring(token.length() - 20) : token;
        }

        String uri = request.getRequestURI();
        Object[] args = point.getArgs();
        String bodyHash = args.length > 0 ? String.valueOf(java.util.Arrays.hashCode(args)) : String.valueOf(request.hashCode());

        String lockKey = "norepeat:" + userId + ":" + uri + ":" + bodyHash;

        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        NoRepeatSubmit annotation = method.getAnnotation(NoRepeatSubmit.class);
        int expire = (annotation != null) ? annotation.value() : 2;

        boolean isDuplicate;
        if (redisTemplate != null) {
            // 有 Redis 就用 Redis 分布式锁
            Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", expire, TimeUnit.SECONDS);
            isDuplicate = Boolean.FALSE.equals(success);
        } else {
            // 无 Redis 就用本地缓存降级
            Long now = System.currentTimeMillis();
            Long lastTime = localCache.get(lockKey);
            if (lastTime != null && (now - lastTime) < expire * 1000L) {
                isDuplicate = true;
            } else {
                localCache.put(lockKey, now);
                isDuplicate = false;
            }
        }

        if (isDuplicate) {
            return Result.error("操作过于频繁，请稍后再试");
        }

        return point.proceed();
    }
}
