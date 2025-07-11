'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
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

// Examination point options
const examinationPointOptions = [
  'React', 'Virtual DOM', 'Performance Optimization', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
  'State Management', 'Component Lifecycle', 'Hooks', 'Routing', 'Server-Side Rendering', 'Micro Frontend',
  'Node.js', 'Express', 'Koa', 'Nest.js', 'Database', 'SQL', 'NoSQL',
  'Algorithms', 'Data Structures', 'Design Patterns', 'Network Protocols', 'HTTP', 'WebSocket',
  'Security', 'Authentication', 'Authorization', 'Encryption', 'Testing', 'Deployment', 'CI/CD'
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Fetch question list
  const fetchQuestions = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await questionApi.getQuestions(page, pageSize);
      
      if (response.code === '0' && response.data) {
        setQuestions(response.data);
        setPagination({
          current: response.metadata?.current_page || page,
          pageSize: pageSize,
          total: response.metadata?.total_count || 0,
        });
      } else {
        message.error(response.message || 'Failed to fetch question list');
      }
    } catch (error) {
      message.error('Failed to fetch question list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch job titles for dropdown
  const fetchJobTitles = async () => {
    try {
      const response = await jobApi.getJobs(0, 100);
      if (response.code === '0' && response.data) {
        const titles = response.data.map(job => job.job_title);
        setJobTitles(titles);
      }
    } catch (error) {
      console.error('Failed to fetch job titles:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchQuestions(pagination.current, pagination.pageSize);
    fetchJobTitles();
  }, []);

  // Handle table pagination
  const handleTableChange = (newPagination: any) => {
    fetchQuestions(newPagination.current, newPagination.pageSize);
  };

  // Open add question modal
  const showAddModal = () => {
    setCurrentQuestion(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open edit question modal
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

  // Close modal
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (currentQuestion) {
        // Update question
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
          message.success('Question updated successfully');
          setModalVisible(false);
          fetchQuestions(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || 'Failed to update question');
        }
      } else {
        // Create question
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
          message.success('Question created successfully');
          setModalVisible(false);
          fetchQuestions(pagination.current, pagination.pageSize);
        } else {
          message.error(response.message || 'Failed to create question');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Operation failed, please try again');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Delete question
  const handleDelete = (questionId: string) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this question? This action cannot be undone.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await questionApi.deleteQuestion(questionId);
          
          if (response.code === '0') {
            message.success('Question deleted successfully');
            fetchQuestions(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || 'Failed to delete question');
          }
        } catch (error) {
          console.error('Error deleting question:', error);
          message.error('Deletion failed, please try again');
        }
      },
    });
  };

  // Table column definitions
  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Job Title',
      dataIndex: 'job_title',
      key: 'job_title',
      width: 150,
    },
    {
      title: 'Examination Points',
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
      title: 'Difficulty',
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => questionTypeMap[type] || type,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 80,
      render: (language: string) => languageMap[language] || language,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.question_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Question
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={questions}
        loading={loading}
        rowKey="question_id"
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        title={currentQuestion ? 'Edit Question' : 'Add Question'}
        visible={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentQuestion ? 'Update' : 'Create'}
        cancelText="Cancel"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="questionForm"
          initialValues={{
            language: 'Hindi',
            difficulty: 'medium',
            type: 'short_answer',
          }}
        >
          <Form.Item
            name="question"
            label="Question Content"
            rules={[{ required: true, message: 'Please enter the question content' }]}
          >
            <TextArea 
              placeholder="Enter question content" 
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          
          <Form.Item
            name="answer"
            label="Reference Answer"
            rules={[{ required: true, message: 'Please enter the reference answer' }]}
          >
            <TextArea 
              placeholder="Enter reference answer" 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
          
          <Form.Item
            name="examination_points"
            label="Examination Points"
            rules={[{ required: true, message: 'Please select or enter examination points' }]}
          >
            <Select
              mode="tags"
              placeholder="Select or enter examination points"
              style={{ width: '100%' }}
              allowClear
              options={examinationPointOptions.map(point => ({ label: point, value: point }))}
            />
          </Form.Item>
          
          <Form.Item
            name="job_title"
            label="Applicable Job Title"
            rules={[{ required: true, message: 'Please select an applicable job title' }]}
          >
            <Select
              placeholder="Select an applicable job title"
              style={{ width: '100%' }}
              allowClear
              showSearch
              options={jobTitles.map(title => ({ label: title, value: title }))}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="difficulty"
              label="Difficulty"
              rules={[{ required: true, message: 'Please select difficulty' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select difficulty">
                <Option value="easy">Easy</Option>
                <Option value="medium">Medium</Option>
                <Option value="hard">Hard</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="type"
              label="Question Type"
              rules={[{ required: true, message: 'Please select question type' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select question type">
                <Option value="multiple_choice">Multiple Choice</Option>
                <Option value="single_choice">Single Choice</Option>
                <Option value="true_false">True/False</Option>
                <Option value="short_answer">Short Answer</Option>
                <Option value="essay">Essay</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true, message: 'Please select language' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select language">
                <Option value="Hindi">Hindi</Option>
                <Option value="English">English</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
