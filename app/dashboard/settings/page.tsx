'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { SystemSettings } from '@/app/lib/data';

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch system settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        form.setFieldsValue(data.settings);
      }
    } catch (error) {
      message.error('Failed to fetch system settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSettings();
  }, []);

  // Submit form
  const handleSubmit = async (values: SystemSettings) => {
    setSubmitting(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      message.success('System settings updated successfully');
    } catch (error) {
      message.error('Failed to update system settings');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="System Settings" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          theme: 'light',
          language: 'en',
        }}
      >
        <Form.Item
          name="siteName"
          label="Site Name"
          rules={[{ required: true, message: 'Please enter the site name' }]}
        >
          <Input placeholder="Enter site name" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo Path"
          rules={[{ required: true, message: 'Please enter the logo path' }]}
        >
          <Input placeholder="Enter logo path" />
        </Form.Item>

        <Form.Item
          name="theme"
          label="Theme"
          rules={[{ required: true, message: 'Please select a theme' }]}
        >
          <Select>
            <Select.Option value="light">Light</Select.Option>
            <Select.Option value="dark">Dark</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="language"
          label="Language"
          rules={[{ required: true, message: 'Please select a language' }]}
        >
          <Select>
            <Select.Option value="en">English</Select.Option>
            <Select.Option value="hi">Hindi</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}