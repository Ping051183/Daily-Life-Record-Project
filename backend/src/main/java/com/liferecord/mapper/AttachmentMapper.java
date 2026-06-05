package com.liferecord.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.liferecord.entity.Attachment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AttachmentMapper extends BaseMapper<Attachment> {
}