'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, CreateUserRequest, UpdateUserRequest, userApi, roleMap, statusMap } from '@/app/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取用户列表
  const fetchUsers = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await userApi.getUsers(skip, pageSize);
      
      if (response.code === '0') {
        setUsers(response.data || []);
        // 假设总数为当前页数据数量，实际项目中应从API获取总数
        setPagination({
          ...pagination,
          current: page,
          total: (response.data?.length || 0) + skip,
        });
      } else {
        message.error(response.message || '获取用户列表失败');
      }
    } catch (error) {
      message.error('获取用户列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination.current, pagination.pageSize);
  };

  // 打开添加用户模态框
  const showAddModal = () => {
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑用户模态框
  const showEditModal = (user: User) => {
    setCurrentUser(user);
    form.setFieldsValue({
      user_name: user.user_name,
      email: user.email,
      staff_id: user.staff_id,
      status: user.status,
      role: user.role,
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (currentUser) {
        // 更新用户
        const updateData: UpdateUserRequest = {
          user_name: values.user_name,
          email: values.email,
          staff_id: values.staff_id,
          status: values.status,
          role: values.role,
        };
        
        const response = await userApi.updateUser(currentUser.user_id, updateData);
        
        if (response.code === '0') {
          message.success('用户更新成功');
          setModalVisible(false);
          fetchUsers(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '更新用户失败');
        }
      } else {
        // 创建用户
        const createData: CreateUserRequest = {
          user_name: values.user_name,
          password: values.password,
          email: values.email,
          staff_id: values.staff_id,
          role: values.role,
        };
        
        const response = await userApi.createUser(createData);
        
        if (response.code === '0') {
          message.success('用户创建成功');
          setModalVisible(false);
          fetchUsers(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '创建用户失败');
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error);
      message.error('操作失败，请重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除用户
  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await userApi.deleteUser(userId);
          
          if (response.code === '0') {
            message.success('用户删除成功');
            fetchUsers(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '删除用户失败');
          }
        } catch (error) {
          message.error('删除失败，请重试');
          console.error(error);
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: '员工ID',
      dataIndex: 'staff_id',
      key: 'staff_id',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => roleMap[role] || `角色${role}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => statusMap[status] || `状态${status}`,
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.user_id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
        >
          添加用户
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="user_id" 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={currentUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentUser ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
          initialValues={{
            status: 0,
            role: 2,
          }}
        >
          <Form.Item
            name="user_name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          {!currentUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="staff_id"
            label="员工ID"
            rules={[{ required: true, message: '请输入员工ID' }]}
          >
            <Input placeholder="请输入员工ID" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value={1}>管理员</Select.Option>
              <Select.Option value={2}>普通用户</Select.Option>
              <Select.Option value={0}>访客</Select.Option>
            </Select>
          </Form.Item>
          
          {currentUser && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Select.Option value={0}>激活</Select.Option>
                <Select.Option value={1}>未激活</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
} 