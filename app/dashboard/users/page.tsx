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

  // Fetch user list
  const fetchUsers = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await userApi.getUsers(skip, pageSize);
      
      if (response.code === '0') {
        setUsers(response.data || []);
        // Assume total count is the current page data count; in real projects, total count should come from the API
        setPagination({
          ...pagination,
          current: page,
          total: (response.data?.length || 0) + skip,
        });
      } else {
        message.error(response.message || 'Failed to fetch user list');
      }
    } catch (error) {
      message.error('Failed to fetch user list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table pagination
  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination.current, pagination.pageSize);
  };

  // Open add user modal
  const showAddModal = () => {
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open edit user modal
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

  // Close modal
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (currentUser) {
        // Update user
        const updateData: UpdateUserRequest = {
          user_name: values.user_name,
          email: values.email,
          staff_id: values.staff_id,
          status: values.status,
          role: values.role,
        };
        
        const response = await userApi.updateUser(currentUser.user_id, updateData);
        
        if (response.code === '0') {
          message.success('User updated successfully');
          setModalVisible(false);
          fetchUsers(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || 'Failed to update user');
        }
      } else {
        // Create user
        const createData: CreateUserRequest = {
          user_name: values.user_name,
          password: values.password,
          email: values.email,
          staff_id: values.staff_id,
          role: values.role,
        };
        
        const response = await userApi.createUser(createData);
        
        if (response.code === '0') {
          message.success('User created successfully');
          setModalVisible(false);
          fetchUsers(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || 'Failed to create user');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Operation failed, please try again');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Delete user
  const handleDelete = (userId: string) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await userApi.deleteUser(userId);
          
          if (response.code === '0') {
            message.success('User deleted successfully');
            fetchUsers(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || 'Failed to delete user');
          }
        } catch (error) {
          message.error('Deletion failed, please try again');
          console.error(error);
        }
      },
    });
  };

  // Table column definitions
  const columns = [
    {
      title: 'Username',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Staff ID',
      dataIndex: 'staff_id',
      key: 'staff_id',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => roleMap[role] || `Role ${role}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => statusMap[status] || `Status ${status}`,
    },
    {
      title: 'Creation Date',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (date: string) => new Date(date).toLocaleString('en-US'),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.user_id)}
          >
            Delete
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
          Add User
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
        title={currentUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentUser ? 'Update' : 'Create'}
        cancelText="Cancel"
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
            label="Username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          
          {!currentUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter a password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          
          <Form.Item
            name="staff_id"
            label="Staff ID"
            rules={[{ required: true, message: 'Please enter a staff ID' }]}
          >
            <Input placeholder="Enter staff ID" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value={1}>Admin</Select.Option>
              <Select.Option value={2}>Regular User</Select.Option>
              <Select.Option value={0}>Guest</Select.Option>
            </Select>
          </Form.Item>
          
          {currentUser && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select>
                <Select.Option value={0}>Active</Select.Option>
                <Select.Option value={1}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
} 