'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Spin, Tag, Typography, Divider, List, Progress, Alert, Space, Button, Timeline, Collapse } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { 
  Test, 
  TestResult, 
  testApi, 
  testResultApi,
  testStatusMap, 
  testTypeMap,
  languageMap,
  difficultyMap,
  userApi,
  jobApi
} from '@/app/lib/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Define HSBC theme colors at the top of the component
const HSBC_COLORS = {
  primary: '#DB0011',    // HSBC red
  secondary: '#333333',  // Dark gray
  light: '#F5F5F5',      // Light gray background
  white: '#FFFFFF',      // White
  border: '#E5E5E5',     // Border color
};

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');

  // Fetch test details and results
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      try {
        // Fetch test details
        const testResponse = await testApi.getTestById(testId);
        if (testResponse.code === '0' && testResponse.data) {
          setTest(testResponse.data);
          
          // Fetch user and job information
          if (testResponse.data.user_id) {
            const userResponse = await userApi.getUserById(testResponse.data.user_id);
            if (userResponse.code === '0' && userResponse.data) {
              setUserName(userResponse.data.user_name);
            }
          }
          
          if (testResponse.data.job_id) {
            const jobResponse = await jobApi.getJobById(testResponse.data.job_id);
            if (jobResponse.code === '0' && jobResponse.data) {
              setJobTitle(jobResponse.data.job_title);
            }
          }
          
          // Fetch test results only if the test status is completed
          if (testResponse.data.status === 'completed') {
            const resultResponse = await testResultApi.getTestResult(testId);
            if (resultResponse.code === '0' && resultResponse.data) {
              setTestResult(resultResponse.data);
            }
          }
        } else {
          setError(testResponse.message || 'Failed to fetch test details');
        }
      } catch (err) {
        console.error('Failed to fetch test details:', err);
        setError('An error occurred while fetching test details');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  // Navigate back to the test list page
  const handleGoBack = () => {
    router.push('/dashboard/tests');
  };

  // Get the color for the test status tag
  const getStatusColor = (status: string) => {
    const statusColorMap: Record<string, string> = {
      created: HSBC_COLORS.secondary,
      activated: '#007799',
      started: '#006633',
      completed: HSBC_COLORS.primary,
      cancelled: '#999999',
    };
    return statusColorMap[status] || 'default';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleGoBack}>
              Back to List
            </Button>
          }
        />
      </div>
    );
  }

  if (!test) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Test Not Found"
          description="The specified test information could not be found"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleGoBack}>
              Back to List
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Navigation Bar */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ paddingLeft: 0, color: HSBC_COLORS.primary }}
        >
          Back to Test List
        </Button>
      </div>
      
      {/* Test Basic Information */}
      <Card 
        title={
          <Space size="middle">
            <Title level={4} style={{ margin: 0, color: HSBC_COLORS.secondary }}>Test Details</Title>
            <Tag color={getStatusColor(test.status)}>{testStatusMap[test.status] || test.status}</Tag>
          </Space>
        }
        style={{ 
          marginBottom: '24px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        headStyle={{ 
          borderBottom: `2px solid ${HSBC_COLORS.primary}` 
        }}
      >
        <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Test ID">{test.test_id}</Descriptions.Item>
          <Descriptions.Item label="Activation Code">{test.activate_code}</Descriptions.Item>
          <Descriptions.Item label="User">{userName || test.user_name || 'Unknown User'}</Descriptions.Item>
          <Descriptions.Item label="Job">{jobTitle || test.job_title || 'Unknown Job'}</Descriptions.Item>
          <Descriptions.Item label="Test Type">{testTypeMap[test.type] || test.type}</Descriptions.Item>
          <Descriptions.Item label="Test Language">{languageMap[test.language] || test.language}</Descriptions.Item>
          <Descriptions.Item label="Difficulty">{difficultyMap[test.difficulty] || test.difficulty}</Descriptions.Item>
          <Descriptions.Item label="Duration">{test.test_time} minutes</Descriptions.Item>
          <Descriptions.Item label="Start Time" span={2}>
            {dayjs(test.start_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Expiration Time" span={2}>
            {dayjs(test.expire_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Creation Time" span={2}>
            {dayjs(test.create_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Examination Points" span={4}>
            <Space size={[0, 8]} wrap>
              {test.examination_points?.map((point, index) => (
                <Tag key={index} color="blue">{point}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      {/* Test Results */}
      {test.status === 'completed' ? (
        testResult ? (
          <>
            {/* Test Results Overview */}
            <Card title={<Title level={4} style={{ margin: 0 }}>Test Results</Title>} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <Progress
                    type="dashboard"
                    percent={testResult.score}
                    format={percent => `${percent} points`}
                    status={testResult.score >= 60 ? 'success' : 'exception'}
                    strokeColor={testResult.score >= 60 ? '#006633' : HSBC_COLORS.primary}
                  />
                  <div style={{ marginTop: '8px' }}>Total Score</div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Total Questions">{testResult.question_number} questions</Descriptions.Item>
                    <Descriptions.Item label="Correct Questions">{testResult.correct_number} questions</Descriptions.Item>
                    <Descriptions.Item label="Time Taken">{testResult.elapse_time.toFixed(1)} minutes</Descriptions.Item>
                    <Descriptions.Item label="Completion Time">
                      {dayjs(testResult.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider />
                  
                  <Paragraph>
                    <Title level={5}>Test Summary</Title>
                    <div className="markdown-content">
                      <ReactMarkdown>{testResult.summary}</ReactMarkdown>
                    </div>
                  </Paragraph>
                </div>
              </div>
            </Card>
            
            {/* Q&A History */}
            <Card title={<Title level={4} style={{ margin: 0 }}>Q&A Details</Title>}>
              <Collapse defaultActiveKey={['0']} accordion>
                {testResult.qa_history.map((qa, index) => (
                  <Panel 
                    header={
                      <Space>
                        <span>Question {index + 1}</span>
                        <Text ellipsis style={{ maxWidth: '500px' }}>{qa.question}</Text>
                      </Space>
                    } 
                    key={index}
                  >
                    <Descriptions bordered column={1} layout="vertical">
                      <Descriptions.Item label="Question">
                        <div className="markdown-content">
                          <ReactMarkdown>{qa.question}</ReactMarkdown>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Answer">
                        <div style={{ whiteSpace: 'pre-wrap' }}>{qa.answer}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Feedback">
                        <div style={{ whiteSpace: 'pre-wrap' }}>{qa.summary}</div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </>
        ) : (
          <Alert
            message="Test Results Not Found"
            description="The test is completed, but no related test result data was found"
            type="warning"
            showIcon
          />
        )
      ) : (
        <Alert
          message="Test Not Completed"
          description={`The current test status is "${testStatusMap[test.status] || test.status}". Results can only be viewed after the test is completed.`}
          type="info"
          showIcon
        />
      )}
    </div>
  );
} 