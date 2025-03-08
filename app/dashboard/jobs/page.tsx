'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Job, CreateJobRequest, UpdateJobRequest, jobApi } from '@/app/lib/api';
import { Select } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

// 技能选项
const technicalSkillOptions = [
  'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Angular',
  'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift',
  'Kotlin', 'Go', 'Rust', 'SQL', 'NoSQL', 'MongoDB', 'MySQL', 'PostgreSQL',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD'
];

const softSkillOptions = [
  '团队协作', '沟通能力', '解决问题能力', '领导力', '时间管理',
  '适应能力', '创新思维', '批判性思考', '情绪智力', '冲突解决',
  '谈判技巧', '决策能力', '压力管理', '自我激励', '职业道德'
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取职位列表
  const fetchJobs = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await jobApi.getJobs(skip, pageSize);
      
      if (response.code === '0') {
        setJobs(response.data || []);
        // 假设总数为当前页数据数量，实际项目中应从API获取总数
        setPagination({
          ...pagination,
          current: page,
          total: (response.data?.length || 0) + skip,
        });
      } else {
        message.error(response.message || '获取职位列表失败');
      }
    } catch (error) {
      message.error('获取职位列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchJobs();
  }, []);

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchJobs(pagination.current, pagination.pageSize);
  };

  // 打开添加职位模态框
  const showAddModal = () => {
    setCurrentJob(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑职位模态框
  const showEditModal = (job: Job) => {
    setCurrentJob(job);
    form.setFieldsValue({
      job_title: job.job_title,
      job_description: job.job_description,
      technical_skills: job.technical_skills,
      soft_skills: job.soft_skills,
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
      
      if (currentJob) {
        // 更新职位
        const updateData: UpdateJobRequest = {
          job_title: values.job_title,
          job_description: values.job_description,
          technical_skills: values.technical_skills,
          soft_skills: values.soft_skills,
        };
        
        const response = await jobApi.updateJob(currentJob.job_id, updateData);
        
        if (response.code === '0') {
          message.success('职位更新成功');
          setModalVisible(false);
          fetchJobs(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '更新职位失败');
        }
      } else {
        // 创建职位
        const createData: CreateJobRequest = {
          job_title: values.job_title,
          job_description: values.job_description,
          technical_skills: values.technical_skills,
          soft_skills: values.soft_skills,
        };
        
        const response = await jobApi.createJob(createData);
        
        if (response.code === '0') {
          message.success('职位创建成功');
          setModalVisible(false);
          fetchJobs(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '创建职位失败');
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error);
      message.error('操作失败，请重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除职位
  const handleDelete = (jobId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个职位吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await jobApi.deleteJob(jobId);
          
          if (response.code === '0') {
            message.success('职位删除成功');
            fetchJobs(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '删除职位失败');
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
      title: '职位名称',
      dataIndex: 'job_title',
      key: 'job_title',
    },
    {
      title: '职位描述',
      dataIndex: 'job_description',
      key: 'job_description',
      ellipsis: true,
      width: 300,
    },
    {
      title: '技术技能',
      dataIndex: 'technical_skills',
      key: 'technical_skills',
      render: (skills: string[]) => (
        <>
          {skills.map(skill => (
            <Tag color="blue" key={skill}>
              {skill}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '软技能',
      dataIndex: 'soft_skills',
      key: 'soft_skills',
      render: (skills: string[]) => (
        <>
          {skills.map(skill => (
            <Tag color="green" key={skill}>
              {skill}
            </Tag>
          ))}
        </>
      ),
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
      render: (_: any, record: Job) => (
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
            onClick={() => handleDelete(record.job_id)}
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
          添加职位
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={jobs} 
        rowKey="job_id" 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={currentJob ? '编辑职位' : '添加职位'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentJob ? '更新' : '创建'}
        cancelText="取消"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          name="jobForm"
        >
          <Form.Item
            name="job_title"
            label="职位名称"
            rules={[{ required: true, message: '请输入职位名称' }]}
          >
            <Input placeholder="请输入职位名称" />
          </Form.Item>
          
          <Form.Item
            name="job_description"
            label="职位描述"
            rules={[{ required: true, message: '请输入职位描述' }]}
          >
            <TextArea 
              placeholder="请输入职位描述" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item
            name="technical_skills"
            label="技术技能"
            rules={[{ required: true, message: '请选择或输入技术技能' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入技术技能"
              style={{ width: '100%' }}
              allowClear
              options={technicalSkillOptions.map(skill => ({ label: skill, value: skill }))}
            />
          </Form.Item>
          
          <Form.Item
            name="soft_skills"
            label="软技能"
            rules={[{ required: true, message: '请选择或输入软技能' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入软技能"
              style={{ width: '100%' }}
              allowClear
              options={softSkillOptions.map(skill => ({ label: skill, value: skill }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 