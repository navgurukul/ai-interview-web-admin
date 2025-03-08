'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  questionApi, 
  difficultyMap, 
  questionTypeMap,
  languageMap,
  jobApi
} from '@/app/lib/api';

const { TextArea } = Input;
const { Option } = Select;

// 考察点选项
const examinationPointOptions = [
  'React', '虚拟DOM', '性能优化', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
  '状态管理', '组件生命周期', 'Hooks', '路由', '服务端渲染', '微前端',
  'Node.js', 'Express', 'Koa', 'Nest.js', '数据库', 'SQL', 'NoSQL',
  '算法', '数据结构', '设计模式', '网络协议', 'HTTP', 'WebSocket',
  '安全', '认证', '授权', '加密', '测试', '部署', 'CI/CD'
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  // 获取题目列表
  const fetchQuestions = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await questionApi.getQuestions(skip, pageSize);
      
      if (response.code === '0') {
        setQuestions(response.data || []);
        // 假设总数为当前页数据数量，实际项目中应从API获取总数
        setPagination({
          ...pagination,
          current: page,
          total: (response.data?.length || 0) + skip,
        });
      } else {
        message.error(response.message || '获取题目列表失败');
      }
    } catch (error) {
      message.error('获取题目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取职位列表，用于下拉选择
  const fetchJobTitles = async () => {
    try {
      const response = await jobApi.getJobs(0, 100);
      if (response.code === '0' && response.data) {
        const titles = response.data.map(job => job.job_title);
        setJobTitles(titles);
      }
    } catch (error) {
      console.error('获取职位列表失败:', error);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchQuestions();
    fetchJobTitles();
  }, []);

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchQuestions(pagination.current, pagination.pageSize);
  };

  // 打开添加题目模态框
  const showAddModal = () => {
    setCurrentQuestion(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑题目模态框
  const showEditModal = (question: Question) => {
    setCurrentQuestion(question);
    form.setFieldsValue({
      question: question.question,
      answer: question.answer,
      examination_points: question.examination_points,
      job_title: question.job_title,
      language: question.language,
      difficulty: question.difficulty,
      type: question.type,
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
      
      if (currentQuestion) {
        // 更新题目
        const updateData: UpdateQuestionRequest = {
          question: values.question,
          answer: values.answer,
          examination_points: values.examination_points,
          job_title: values.job_title,
          language: values.language,
          difficulty: values.difficulty,
          type: values.type,
        };
        
        const response = await questionApi.updateQuestion(currentQuestion.question_id, updateData);
        
        if (response.code === '0') {
          message.success('题目更新成功');
          setModalVisible(false);
          fetchQuestions(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '更新题目失败');
        }
      } else {
        // 创建题目
        const createData: CreateQuestionRequest = {
          question: values.question,
          answer: values.answer,
          examination_points: values.examination_points,
          job_title: values.job_title,
          language: values.language,
          difficulty: values.difficulty,
          type: values.type,
        };
        
        const response = await questionApi.createQuestion(createData);
        
        if (response.code === '0') {
          message.success('题目创建成功');
          setModalVisible(false);
          fetchQuestions(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || '创建题目失败');
        }
      }
    } catch (error) {
      console.error('提交表单错误:', error);
      message.error('操作失败，请重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除题目
  const handleDelete = (questionId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个题目吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await questionApi.deleteQuestion(questionId);
          
          if (response.code === '0') {
            message.success('题目删除成功');
            fetchQuestions(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '删除题目失败');
          }
        } catch (error) {
          console.error('删除题目错误:', error);
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '题目',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      width: 300,
    },
    {
      title: '职位',
      dataIndex: 'job_title',
      key: 'job_title',
      width: 150,
    },
    {
      title: '考察点',
      dataIndex: 'examination_points',
      key: 'examination_points',
      width: 200,
      render: (points: string[]) => (
        <>
          {points.map(point => (
            <Tag color="blue" key={point}>
              {point}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: string) => {
        const colorMap: Record<string, string> = {
          'easy': 'green',
          'medium': 'orange',
          'hard': 'red',
        };
        return (
          <Tag color={colorMap[difficulty] || 'blue'}>
            {difficultyMap[difficulty] || difficulty}
          </Tag>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => questionTypeMap[type] || type,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 80,
      render: (language: string) => languageMap[language] || language,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Question) => (
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
            onClick={() => handleDelete(record.question_id)}
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
          添加题目
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={questions} 
        rowKey="question_id" 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: 0 }}>
              <p><strong>答案：</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{record.answer}</p>
            </div>
          ),
        }}
      />

      <Modal
        title={currentQuestion ? '编辑题目' : '添加题目'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentQuestion ? '更新' : '创建'}
        cancelText="取消"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="questionForm"
          initialValues={{
            language: 'Chinese',
            difficulty: 'medium',
            type: 'short_answer',
          }}
        >
          <Form.Item
            name="question"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <TextArea 
              placeholder="请输入题目内容" 
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          
          <Form.Item
            name="answer"
            label="参考答案"
            rules={[{ required: true, message: '请输入参考答案' }]}
          >
            <TextArea 
              placeholder="请输入参考答案" 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
          
          <Form.Item
            name="examination_points"
            label="考察点"
            rules={[{ required: true, message: '请选择或输入考察点' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入考察点"
              style={{ width: '100%' }}
              allowClear
              options={examinationPointOptions.map(point => ({ label: point, value: point }))}
            />
          </Form.Item>
          
          <Form.Item
            name="job_title"
            label="适用职位"
            rules={[{ required: true, message: '请选择适用职位' }]}
          >
            <Select
              placeholder="请选择适用职位"
              style={{ width: '100%' }}
              allowClear
              showSearch
              options={jobTitles.map(title => ({ label: title, value: title }))}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
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
            
            <Form.Item
              name="type"
              label="题目类型"
              rules={[{ required: true, message: '请选择题目类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择题目类型">
                <Option value="multiple_choice">多选题</Option>
                <Option value="single_choice">单选题</Option>
                <Option value="true_false">判断题</Option>
                <Option value="short_answer">简答题</Option>
                <Option value="essay">论述题</Option>
              </Select>
            </Form.Item>
            
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
          </div>
        </Form>
      </Modal>
    </div>
  );
} 