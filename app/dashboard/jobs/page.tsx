'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Job, CreateJobRequest, UpdateJobRequest, jobApi } from '@/app/lib/api';

const { TextArea } = Input;
const { Option } = Select;

// Technical skill options
const technicalSkillOptions = [
  'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Angular',
  'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift',
  'Kotlin', 'Go', 'Rust', 'SQL', 'NoSQL', 'MongoDB', 'MySQL', 'PostgreSQL',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD'
];

const softSkillOptions = [
  'Teamwork', 'Communication', 'Problem-solving', 'Leadership', 'Time management',
  'Adaptability', 'Creative thinking', 'Critical thinking', 'Emotional intelligence', 'Conflict resolution',
  'Negotiation', 'Decision-making', 'Stress management', 'Self-motivation', 'Work ethic'
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [form] = Form.useForm();

  // Client-side pagination
  const [clientPage, setClientPage] = useState(1);
  const clientPageSize = 10;

  // Fetch job list
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch all jobs, assuming the API supports a large limit
      const response = await jobApi.getJobs(0, 1000);
      if (response.code === '0') {
        setJobs(response.data || []);
      } else {
        message.error(response.message || 'Failed to fetch job list');
      }
    } catch (error) {
      message.error('Failed to fetch job list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  const paginatedJobs = jobs.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);

  // Open add job modal
  const showAddModal = () => {
    setCurrentJob(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open edit job modal
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

  // Close modal
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (currentJob) {
        // Update job
        const updateData: UpdateJobRequest = {
          job_title: values.job_title,
          job_description: values.job_description,
          technical_skills: values.technical_skills,
          soft_skills: values.soft_skills,
        };
        
        const response = await jobApi.updateJob(currentJob.job_id, updateData);
        
        if (response.code === '0') {
          message.success('Job updated successfully');
          setModalVisible(false);
          fetchJobs();
        } else {
          message.error(response.message || 'Failed to update job');
        }
      } else {
        // Create job
        const createData: CreateJobRequest = {
          job_title: values.job_title,
          job_description: values.job_description,
          technical_skills: values.technical_skills,
          soft_skills: values.soft_skills,
        };
        
        const response = await jobApi.createJob(createData);
        
        if (response.code === '0') {
          message.success('Job created successfully');
          setModalVisible(false);
          fetchJobs();
        } else {
          message.error(response.message || 'Failed to create job');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Operation failed, please try again');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Delete job
  const handleDelete = (jobId: string) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this job? This action cannot be undone.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await jobApi.deleteJob(jobId);
          
          if (response.code === '0') {
            message.success('Job deleted successfully');
            fetchJobs();
          } else {
            message.error(response.message || 'Failed to delete job');
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
      title: 'Job Title',
      dataIndex: 'job_title',
      key: 'job_title',
    },
    {
      title: 'Job Description',
      dataIndex: 'job_description',
      key: 'job_description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Technical Skills',
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
      title: 'Soft Skills',
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
      title: 'Creation Date',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (date: string) => new Date(date).toLocaleString('en-US'),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Job) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.job_id)}>
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
          Add Job
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={paginatedJobs} 
        loading={loading}
        rowKey="id"
        pagination={false}
      />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 16 }}>
        <span style={{ color: '#888' }}>
          Total Pages: {Math.ceil(jobs.length / clientPageSize)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button 
            onClick={() => setClientPage(clientPage - 1)} 
            disabled={clientPage === 1}
            icon={<LeftOutlined />}
          />
          <span style={{ minWidth: 20, textAlign: 'center' }}>{clientPage}</span>
          <Button 
            onClick={() => setClientPage(clientPage + 1)} 
            disabled={clientPage >= Math.ceil(jobs.length / clientPageSize)}
            icon={<RightOutlined />}
          />
        </div>
      </div>
      <Modal
        title={currentJob ? 'Edit Job' : 'Add Job'}
        visible={modalVisible}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText={currentJob ? 'Update' : 'Create'}
        cancelText="Cancel"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          name="jobForm"
        >
          <Form.Item
            name="job_title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter the job title' }]}
          >
            <Input placeholder="Enter job title" />
          </Form.Item>
          
          <Form.Item
            name="job_description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter the job description' }]}
          >
            <TextArea 
              placeholder="Enter job description" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item
            name="technical_skills"
            label="Technical Skills"
            rules={[{ required: true, message: 'Please select or enter technical skills' }]}
          >
            <Select
              mode="tags"
              placeholder="Select or enter technical skills"
              style={{ width: '100%' }}
              allowClear
              options={technicalSkillOptions.map(skill => ({ label: skill, value: skill }))}
            />
          </Form.Item>
          
          <Form.Item
            name="soft_skills"
            label="Soft Skills"
            rules={[{ required: true, message: 'Please select or enter soft skills' }]}
          >
            <Select
              mode="tags"
              placeholder="Select or enter soft skills"
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