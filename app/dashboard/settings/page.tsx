'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { SystemSettings } from '@/app/lib/data';

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 获取系统设置
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        form.setFieldsValue(data.settings);
      }
    } catch (error) {
      message.error('获取系统设置失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchSettings();
  }, []);

  // 提交表单
  const handleSubmit = async (values: SystemSettings) => {
    setSubmitting(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('系统设置已更新');
    } catch (error) {
      message.error('更新系统设置失败');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="系统设置" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          theme: 'light',
          language: 'zh',
        }}
      >
        <Form.Item
          name="siteName"
          label="系统名称"
          rules={[{ required: true, message: '请输入系统名称' }]}
        >
          <Input placeholder="请输入系统名称" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo路径"
          rules={[{ required: true, message: '请输入Logo路径' }]}
        >
          <Input placeholder="请输入Logo路径" />
        </Form.Item>

        <Form.Item
          name="theme"
          label="主题"
          rules={[{ required: true, message: '请选择主题' }]}
        >
          <Select>
            <Select.Option value="light">浅色</Select.Option>
            <Select.Option value="dark">深色</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="language"
          label="语言"
          rules={[{ required: true, message: '请选择语言' }]}
        >
          <Select>
            <Select.Option value="zh">中文</Select.Option>
            <Select.Option value="en">英文</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
} 