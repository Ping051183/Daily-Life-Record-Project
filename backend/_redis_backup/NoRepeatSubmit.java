package com.liferecord.config;

import java.lang.annotation.*;

/**
 * 防重复提交注解（基于 Redis）
 * 标记在 Controller 方法上，同一用户短时间内的相同请求只放行一次
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NoRepeatSubmit {
    /**
     * 锁定时间（秒），默认 2 秒
     */
    int value() default 2;
}
