'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Spin, Tag, Typography, Divider, List, Progress, Alert, Space, Button, Timeline, Collapse } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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

// 在组件顶部定义汇丰银行主题色（同上）
const HSBC_COLORS = {
  primary: '#DB0011',    // 汇丰红色
  secondary: '#333333',  // 深灰色
  light: '#F5F5F5',      // 浅灰色背景
  white: '#FFFFFF',      // 白色
  border: '#E5E5E5',     // 边框色
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

  // 获取测试详情和结果
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      try {
        // 获取测试详情
        const testResponse = await testApi.getTestById(testId);
        if (testResponse.code === '0' && testResponse.data) {
          setTest(testResponse.data);
          
          // 获取用户和职位信息
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
          
          // 仅当测试状态为完成时才获取测试结果
          if (testResponse.data.status === 'completed') {
            const resultResponse = await testResultApi.getTestResult(testId);
            if (resultResponse.code === '0' && resultResponse.data) {
              setTestResult(resultResponse.data);
            }
          }
        } else {
          setError(testResponse.message || '获取测试详情失败');
        }
      } catch (err) {
        console.error('获取测试详情失败:', err);
        setError('获取测试详情时发生错误');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  // 返回测试列表页
  const handleGoBack = () => {
    router.push('/dashboard/tests');
  };

  // 获取测试状态标签颜色
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
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleGoBack}>
              返回列表
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
          message="未找到测试"
          description="未能找到指定的测试信息"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleGoBack}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 导航栏 */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ paddingLeft: 0, color: HSBC_COLORS.primary }}
        >
          返回测试列表
        </Button>
      </div>
      
      {/* 测试基本信息 */}
      <Card 
        title={
          <Space size="middle">
            <Title level={4} style={{ margin: 0, color: HSBC_COLORS.secondary }}>测试详情</Title>
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
          <Descriptions.Item label="测试ID">{test.test_id}</Descriptions.Item>
          <Descriptions.Item label="激活码">{test.activate_code}</Descriptions.Item>
          <Descriptions.Item label="用户">{userName || test.user_name || '未知用户'}</Descriptions.Item>
          <Descriptions.Item label="职位">{jobTitle || test.job_title || '未知职位'}</Descriptions.Item>
          <Descriptions.Item label="测试类型">{testTypeMap[test.type] || test.type}</Descriptions.Item>
          <Descriptions.Item label="测试语言">{languageMap[test.language] || test.language}</Descriptions.Item>
          <Descriptions.Item label="难度">{difficultyMap[test.difficulty] || test.difficulty}</Descriptions.Item>
          <Descriptions.Item label="时长">{test.test_time}分钟</Descriptions.Item>
          <Descriptions.Item label="开始时间" span={2}>
            {dayjs(test.start_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="过期时间" span={2}>
            {dayjs(test.expire_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {dayjs(test.create_date).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="考察要点" span={4}>
            <Space size={[0, 8]} wrap>
              {test.examination_points?.map((point, index) => (
                <Tag key={index} color="blue">{point}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      {/* 测试结果 */}
      {test.status === 'completed' ? (
        testResult ? (
          <>
            {/* 测试结果概览 */}
            <Card title={<Title level={4} style={{ margin: 0 }}>测试结果</Title>} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <Progress
                    type="dashboard"
                    percent={testResult.score}
                    format={percent => `${percent}分`}
                    status={testResult.score >= 60 ? 'success' : 'exception'}
                    strokeColor={testResult.score >= 60 ? '#006633' : HSBC_COLORS.primary}
                  />
                  <div style={{ marginTop: '8px' }}>总分</div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="总题数">{testResult.question_number}题</Descriptions.Item>
                    <Descriptions.Item label="正确题数">{testResult.correct_number}题</Descriptions.Item>
                    <Descriptions.Item label="耗时">{testResult.elapse_time.toFixed(1)}分钟</Descriptions.Item>
                    <Descriptions.Item label="完成时间">
                      {dayjs(testResult.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider />
                  
                  <Paragraph>
                    <Title level={5}>测试总结</Title>
                    <Text>{testResult.summary}</Text>
                  </Paragraph>
                </div>
              </div>
            </Card>
            
            {/* 问答历史 */}
            <Card title={<Title level={4} style={{ margin: 0 }}>问答详情</Title>}>
              <Collapse defaultActiveKey={['0']} accordion>
                {testResult.qa_history.map((qa, index) => (
                  <Panel 
                    header={
                      <Space>
                        <span>问题 {index + 1}</span>
                        <Text ellipsis style={{ maxWidth: '500px' }}>{qa.question}</Text>
                      </Space>
                    } 
                    key={index}
                  >
                    <Descriptions bordered column={1} layout="vertical">
                      <Descriptions.Item label="问题">
                        <div style={{ whiteSpace: 'pre-wrap' }}>{qa.question}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="回答">
                        <div style={{ whiteSpace: 'pre-wrap' }}>{qa.answer}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="点评">
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
            message="未找到测试结果"
            description="该测试已完成，但未找到相关测试结果数据"
            type="warning"
            showIcon
          />
        )
      ) : (
        <Alert
          message="测试未完成"
          description={`当前测试状态为"${testStatusMap[test.status] || test.status}"，测试完成后才能查看结果`}
          type="info"
          showIcon
        />
      )}
    </div>
  );
} 