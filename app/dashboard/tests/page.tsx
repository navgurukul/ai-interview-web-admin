'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select, DatePicker, InputNumber, Tooltip, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
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

// Define HSBC theme colors at the top of the component
const HSBC_COLORS = {
  primary: '#DB0011',    // HSBC red
  secondary: '#333333',  // Dark gray
  light: '#F5F5F5',      // Light gray background
  white: '#FFFFFF',      // White
  border: '#E5E5E5',     // Border color
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [form] = Form.useForm();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);
  
  // Data for selection
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examinationPoints, setExaminationPoints] = useState<string[]>([]);

  const router = useRouter();

  // Fetch test list with pagination
  const fetchTests = async (page: number = 1, pageSize: number = 10) => {
    console.log('🚀 === STARTING API CALL FOR TESTS ===');
    console.log('📊 Request Parameters:', { page, pageSize });
    
    setLoading(true);
    try {
      console.log('🌐 Making API call to testApi.getPaginatedTests...');
      const response = await testApi.getPaginatedTests(page, pageSize);
      
      console.log('✅ === BACKEND RESPONSE RECEIVED ===');
      console.log('📦 Full Response Object:', response);
      
      if (response.code === '0' && response.data) {
        // Data is now directly in response.data (array of tests)
        setTests(response.data || []);
        
        // Metadata is in a separate metadata object
        if (response.metadata) {
          setTotalItems(response.metadata.total_count || 0);
          console.log('✅ Total count from metadata:', response.metadata.total_count);
          console.log('✅ Current page:', response.metadata.current_page);
          console.log('✅ Total pages:', response.metadata.total_pages);
        }
        
        console.log('✅ Tests set in state successfully');
      } else {
        console.error('❌ API returned error code:', response.code);
        message.error(response.message || 'Failed to fetch test list');
      }
    } catch (error) {
      console.error('💥 === API CALL ERROR ===');
      console.error('Error object:', error);
      message.error('Failed to fetch test list');
    } finally {
      setLoading(false);
      console.log('🏁 === API CALL COMPLETED ===');
    }
  };

  // Fetch user list
  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers(0, 100);
      if (response.code === '0' && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user list:', error);
    }
  };

  // Fetch job list
  const fetchJobs = async () => {
    try {
      const response = await jobApi.getJobs(0, 100);
      if (response.code === '0' && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch job list:', error);
    }
  };

  // Fetch question list
  const fetchQuestions = async () => {
    try {
      const response = await questionApi.getQuestions(0, 100);
      if (response.code === '0' && response.data) {
        setQuestions(response.data);
        
        // Extract all examination points
        const points = new Set<string>();
        response.data.forEach(question => {
          question.examination_points.forEach(point => {
            points.add(point);
          });
        });
        setExaminationPoints(Array.from(points));
      }
    } catch (error) {
      console.error('Failed to fetch question list:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTests(currentPage, pageSize);
    fetchUsers();
    fetchJobs();
    fetchQuestions();
  }, [currentPage]);  // Re-fetch when page changes

  // Handle page change
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Client-side pagination logic
  const [clientPage, setClientPage] = useState(1);
  const clientPageSize = 10;
  const paginatedTests = tests.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);

  // Update table change handler for client-side pagination
  const handleTableChange = (pagination: any) => {
    setClientPage(pagination.current);
  };

  // Open add test modal
  const showAddModal = () => {
    setCurrentTest(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open edit test modal
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

  // Close modal
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Copy activation code
  const copyActivateCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success('Activation code copied to clipboard');
    }).catch(() => {
      message.error('Copy failed, please copy manually');
    });
  };

  // Submit form
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
        // Update test
        response = await testApi.updateTest(currentTest.test_id, testData);
      } else {
        // Create test
        response = await testApi.createTest(testData);
      }
        if (response.code === '0') {
        message.success(currentTest ? 'Test updated successfully' : 'Test created successfully');
        setModalVisible(false);
        fetchTests(currentPage, pageSize);
      } else {
        message.error(response.message || (currentTest ? 'Failed to update test' : 'Failed to create test'));
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };
  // Delete test
  const handleDelete = async (testId: string) => {
    Modal.confirm({
      title: 'Confirm deletion',
      content: 'Are you sure you want to delete this test? This action cannot be undone.',
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await testApi.deleteTest(testId);
          if (response.code === '0') {
            message.success('Test deleted successfully');
            fetchTests(currentPage, pageSize);
          } else {
            message.error(response.message || 'Failed to delete test');
          }
        } catch (error) {
          message.error('Failed to delete test');
          console.error(error);
        }
      }
    });
  };

  // Get job title by job ID
  const getJobTitleById = (jobId?: string) => {
    if (!jobId) return 'No associated job';
    const job = jobs.find(j => j.job_id === jobId);
    return job ? job.job_title : 'Unknown job';
  };

  // Get user name by user ID
  const getUserNameById = (userId?: string) => {
    if (!userId) return 'No associated user';
    const user = users.find(u => u.user_id === userId);
    return user ? user.user_name : 'Unknown user';
  };

  // Table column definitions - simplified version
  const columns = [
    {
      title: 'Activation Code',
      dataIndex: 'activate_code',
      key: 'activate_code',
      render: (text: string) => (
        <Space>
          {text}
          <Tooltip title="Copy activation code">
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        // Use HSBC theme colors to modify status tags
        const statusColorMap: Record<string, string> = {
          created: HSBC_COLORS.secondary,
          activated: '#007799',         // Keep blue but darken
          open: '#006633',           // Keep green but darken
          completed: HSBC_COLORS.primary, // Use HSBC red
          expired: '#999999',           // Gray
        };

        return (
          <Tag color={statusColorMap[status] || HSBC_COLORS.secondary}>
            {testStatusMap[status] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Job',
      dataIndex: 'job_title',
      key: 'job_title',
      render: (text: string, record: Test) => record.job_title || getJobTitleById(record.job_id),
      ellipsis: true,
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text: string, record: Test) => record.user_name || getUserNameById(record.user_id),
      ellipsis: true,
    },
    {
      title: 'Test Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => testTypeMap[type] || type,
    },
    {
      title: 'Validity Period',
      key: 'dateRange',
      render: (text: string, record: Test) => (
        <>
          {dayjs(record.start_date).format('MM-DD')} to {dayjs(record.expire_date).format('MM-DD')}
        </>
      ),
    },
    {
      title: 'Actions',
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
            Details
          </Button>
          <Tooltip title="Edit">
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
          <Tooltip title="Delete">
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

  // Automatically populate examination points when a job is selected
  const handleJobChange = (jobId: string) => {
    const selectedJob = jobs.find(job => job.job_id === jobId);
    if (selectedJob) {
      // Get all skills related to the job as examination points
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
          Add Test
        </Button>
      </div>
        {/* Table with no built-in pagination controls */}
      <Table 
        columns={columns} 
        dataSource={tests} 
        rowKey="test_id" 
        loading={loading}
        pagination={false}
        scroll={{ x: 1300 }}
        style={{ 
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${HSBC_COLORS.border}`
        }}
      />
      {/* Custom pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 16 }}>
        <span style={{ color: '#888' }}>
          Page {currentPage} of {Math.ceil(totalItems / pageSize)} | Total Tests: {totalItems}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            icon={<LeftOutlined />}
          />
          <span style={{ minWidth: 20, textAlign: 'center' }}>{currentPage}</span>
          <Button 
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            icon={<RightOutlined />}
          />
        </div>
      </div>

      <Modal
        title={currentTest ? 'Edit Test' : 'Add Test'}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentTest ? 'Update' : 'Create'}
        cancelText="Cancel"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="testForm"
        >
          <Form.Item
            name="job_id"
            label="Select Job"
            rules={[{ required: true, message: 'Please select a job' }]}
          >
            <Select 
              placeholder="Select a job" 
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
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select 
              placeholder="Select a user" 
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
            label="Select Questions"
          >
            <Select
              mode="multiple"
              placeholder="Select questions (optional)"
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
            label="Examination Points"
            rules={[{ required: true, message: 'Please select or enter examination points' }]}
          >
            <Select
              mode="tags"
              placeholder="Select or enter examination points"
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
            label="Test Time (minutes)"
            rules={[{ required: true, message: 'Please enter test time' }]}
          >
            <InputNumber min={1} max={180} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="date_range"
            label="Test Validity Period"
            rules={[{ required: true, message: 'Please select test validity period' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Test Type"
            rules={[{ required: true, message: 'Please select test type' }]}
          >
            <Select placeholder="Select test type">
              <Option value="interview">Interview Test</Option>
              <Option value="coding">Coding Test</Option>
              <Option value="behavior">Behavior Test</Option>
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true, message: 'Please select a language' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select language">
                <Option value="Hindi">Hindi</Option>
                <Option value="English">English</Option>
              </Select>
            </Form.Item>
            
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
          </div>
        </Form>
      </Modal>
    </div>
  );
}