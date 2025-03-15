'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select, DatePicker, InputNumber, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { 
  Test, 
  CreateTestRequest, 
  UpdateTestRequest, 
  testApi, 
  testStatusMap,
  userApi,
  jobApi,
  questionApi,
  User,
  Job,
  Question,
  testTypeMap,
  languageMap,
  difficultyMap
} from '@/app/lib/api';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 在组件顶部定义汇丰银行主题色
const HSBC_COLORS = {
  primary: '#DB0011',    // 汇丰红色
  secondary: '#333333',  // 深灰色
  light: '#F5F5F5',      // 浅灰色背景
  white: '#FFFFFF',      // 白色
  border: '#E5E5E5',     // 边框色
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // 用于选择的数据
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examinationPoints, setExaminationPoints] = useState<string[]>([]);

  const router = useRouter();

  // 获取测试列表
  const fetchTests = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await testApi.getTests(skip, pageSize);
      
      if (response.code === '0') {
        setTests(response.data || []);
        // 假设总数为当前页数据数量，实际项目中应从API获取总数
        setPagination({
          ...pagination,
          current: page,
          total: (response.data?.length || 0) + skip,
        });
      } else {
        message.error(response.message || '获取测试列表失败');
      }
    } catch (error) {
      message.error('获取测试列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers(0, 100);
      if (response.code === '0' && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 获取职位列表
  const fetchJobs = async () => {
    try {
      const response = await jobApi.getJobs(0, 100);
      if (response.code === '0' && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('获取职位列表失败:', error);
    }
  };

  // 获取问题列表
  const fetchQuestions = async () => {
    try {
      const response = await questionApi.getQuestions(0, 100);
      if (response.code === '0' && response.data) {
        setQuestions(response.data);
        
        // 提取所有考察点
        const points = new Set<string>();
        response.data.forEach(question => {
          question.examination_points.forEach(point => {
            points.add(point);
          });
        });
        setExaminationPoints(Array.from(points));
      }
    } catch (error) {
      console.error('获取问题列表失败:', error);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchTests();
    fetchUsers();
    fetchJobs();
    fetchQuestions();
  }, []);

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchTests(pagination.current, pagination.pageSize);
  };

  // 打开添加测试模态框
  const showAddModal = () => {
    setCurrentTest(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑测试模态框
  const showEditModal = (test: Test) => {
    setCurrentTest(test);
    form.setFieldsValue({
      ...test,
      user_id: test.user_id,
      job_id: test.job_id,
      type: test.type,
      language: test.language,
      difficulty: test.difficulty,
      question_ids: test.question_ids,
      examination_points: test.examination_points,
      test_time: test.test_time,
      date_range: [
        dayjs(test.start_date),
        dayjs(test.expire_date)
      ]
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 复制激活码
  const copyActivateCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success('激活码已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      const [start_date, expire_date] = values.date_range;
      
      const testData = {
        job_id: values.job_id,
        user_id: values.user_id,
        type: values.type,
        language: values.language,
        difficulty: values.difficulty,
        question_ids: values.question_ids || [],
        examination_points: values.examination_points || [],
        test_time: values.test_time,
        start_date: start_date.format('YYYY-MM-DD HH:mm:ss'),
        expire_date: expire_date.format('YYYY-MM-DD HH:mm:ss'),
      };
      
      let response;
      if (currentTest) {
        // 更新测试
        response = await testApi.updateTest(currentTest.test_id, testData);
      } else {
        // 创建测试
        response = await testApi.createTest(testData);
      }
      
      if (response.code === '0') {
        message.success(currentTest ? '测试更新成功' : '测试创建成功');
        setModalVisible(false);
        fetchTests(pagination.current, pagination.pageSize);
      } else {
        message.error(response.message || (currentTest ? '更新测试失败' : '创建测试失败'));
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除测试
  const handleDelete = async (testId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个测试吗？此操作不可恢复。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await testApi.deleteTest(testId);
          if (response.code === '0') {
            message.success('删除测试成功');
            fetchTests(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '删除测试失败');
          }
        } catch (error) {
          message.error('删除测试失败');
          console.error(error);
        }
      }
    });
  };

  // 根据职位ID获取职位名称
  const getJobTitleById = (jobId?: string) => {
    if (!jobId) return '未关联职位';
    const job = jobs.find(j => j.job_id === jobId);
    return job ? job.job_title : '未知职位';
  };

  // 根据用户ID获取用户名称
  const getUserNameById = (userId?: string) => {
    if (!userId) return '未关联用户';
    const user = users.find(u => u.user_id === userId);
    return user ? user.user_name : '未知用户';
  };

  // 表格列定义 - 简化版
  const columns = [
    {
      title: '激活码',
      dataIndex: 'activate_code',
      key: 'activate_code',
      render: (text: string) => (
        <Space>
          {text}
          <Tooltip title="复制激活码">
            <Button 
              icon={<CopyOutlined />} 
              size="small" 
              type="text"
              onClick={() => copyActivateCode(text)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        // 使用汇丰主题色修改状态标签
        const statusColorMap: Record<string, string> = {
          created: HSBC_COLORS.secondary,
          activated: '#007799',         // 保留蓝色但调暗
          started: '#006633',           // 保留绿色但调暗
          completed: HSBC_COLORS.primary, // 使用汇丰红色
          expired: '#999999',           // 灰色
        };

        return (
          <Tag color={statusColorMap[status] || HSBC_COLORS.secondary}>
            {testStatusMap[status] || status}
          </Tag>
        );
      },
    },
    {
      title: '职位',
      dataIndex: 'job_title',
      key: 'job_title',
      render: (text: string, record: Test) => record.job_title || getJobTitleById(record.job_id),
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text: string, record: Test) => record.user_name || getUserNameById(record.user_id),
      ellipsis: true,
    },
    {
      title: '测试类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => testTypeMap[type] || type,
    },
    {
      title: '有效期限',
      key: 'dateRange',
      render: (text: string, record: Test) => (
        <>
          {dayjs(record.start_date).format('MM-DD')} 至 {dayjs(record.expire_date).format('MM-DD')}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Test) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => router.push(`/dashboard/tests/${record.test_id}`)}
            style={{ color: HSBC_COLORS.primary }}
          >
            详情
          </Button>
          <Tooltip title="编辑">
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)}
              style={{ 
                backgroundColor: HSBC_COLORS.primary,
                borderColor: HSBC_COLORS.primary
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.test_id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 当选择职位时，自动填充考察点
  const handleJobChange = (jobId: string) => {
    const selectedJob = jobs.find(job => job.job_id === jobId);
    if (selectedJob) {
      // 获取该职位相关的所有技能作为考察点
      const jobPoints = [...selectedJob.technical_skills, ...selectedJob.soft_skills];
      form.setFieldsValue({ examination_points: jobPoints });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          style={{ 
            backgroundColor: HSBC_COLORS.primary,
            borderColor: HSBC_COLORS.primary
          }}
        >
          添加测试
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={tests} 
        rowKey="test_id" 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1300 }}
        style={{ 
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${HSBC_COLORS.border}`
        }}
        className="hsbc-table"
      />

      <Modal
        title={currentTest ? '编辑测试' : '添加测试'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentTest ? '更新' : '创建'}
        cancelText="取消"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="testForm"
        >
          <Form.Item
            name="job_id"
            label="选择职位"
            rules={[{ required: true, message: '请选择职位' }]}
          >
            <Select 
              placeholder="请选择职位" 
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleJobChange}
            >
              {jobs.map(job => (
                <Option key={job.job_id} value={job.job_id}>{job.job_title}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="user_id"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select 
              placeholder="请选择用户" 
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Option key={user.user_id} value={user.user_id}>{user.user_name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="question_ids"
            label="选择题目"
          >
            <Select
              mode="multiple"
              placeholder="请选择题目（可选）"
              style={{ width: '100%' }}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {questions.map(question => (
                <Option key={question.question_id} value={question.question_id}>
                  {question.question.length > 50 ? `${question.question.substring(0, 50)}...` : question.question}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="examination_points"
            label="考察要点"
            rules={[{ required: true, message: '请选择或输入考察要点' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入考察要点"
              style={{ width: '100%' }}
              allowClear
            >
              {examinationPoints.map(point => (
                <Option key={point} value={point}>{point}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="test_time"
            label="测试时间（分钟）"
            rules={[{ required: true, message: '请输入测试时间' }]}
          >
            <InputNumber min={1} max={180} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="date_range"
            label="测试有效期"
            rules={[{ required: true, message: '请选择测试有效期' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="测试类型"
            rules={[{ required: true, message: '请选择测试类型' }]}
          >
            <Select placeholder="请选择测试类型">
              <Option value="interview">面试测试</Option>
              <Option value="coding">编程测试</Option>
              <Option value="behavior">行为测试</Option>
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="language"
              label="语言"
              rules={[{ required: true, message: '请选择语言' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择语言">
                <Option value="Chinese">中文</Option>
                <Option value="English">英文</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="difficulty"
              label="难度"
              rules={[{ required: true, message: '请选择难度' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择难度">
                <Option value="easy">简单</Option>
                <Option value="medium">中等</Option>
                <Option value="hard">困难</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
} 