'use client';

import { useState, useEffect, useRef } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';

export default function InterviewPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [form] = Form.useForm();
  const [sessionId, setSessionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestQuestion, setLatestQuestion] = useState('');
  const [lastReceived, setLastReceived] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [interviewTimer, setInterviewTimer] = useState(0);
  type FeedbackType = {
    strengths: string;
    communication: string;
    suggestions: string;
  };
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);  

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTriggerRef = useRef(false);
  const lastTimerQuestionRef = useRef<string | null>(null);
  const answerRef = useRef('');
  const allMessagesRef = useRef<string[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  const appendMessage = (msg: string) => {
    allMessagesRef.current.push(msg);
    setVisibleMessages(prev => [...prev, msg]);
  };  

  const startTimer = (seconds: number, questionId: string) => {
    if (lastTimerQuestionRef.current === questionId) return;
  
    if (timerRef.current) clearInterval(timerRef.current);

    lastTimerQuestionRef.current = questionId;
    timeoutTriggerRef.current = false;
    setTimeLeft(seconds);
  
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timerRef.current!);
          triggerTimeout(); // guarded
          return 0;
        }
        return prev! - 1;
      });
    }, 1000);
  };  

  const stopInterviewTimer = () => {
    if (interviewTimerRef.current) {
      clearInterval(interviewTimerRef.current);
      interviewTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    lastTimerQuestionRef.current = null;
  };  

  const handleNewPayload = (payload: any) => {
    const { question, acknowledgement, questionNumber, isComplete, estimatedTime: newTime } = payload;
  
    if (question && question !== lastReceived) {
      const aiMessage = `AI: ${acknowledgement} Q${questionNumber}: ${question}`;
      appendMessage(aiMessage);
      setLatestQuestion(question);
      setLastReceived(question);
      startTimer(newTime || 60, `${question}-${questionNumber}`);
    }
  
    if (isComplete) {
      setInterviewComplete(true);
      stopInterviewTimer();
    }
  };  

  const triggerTimeout = async () => {
    if (timeoutTriggerRef.current) return; // prevent multiple calls
    timeoutTriggerRef.current = true; // mark as triggered
  
    try {
      const res = await fetch(`${backendUrl}/api/v1/interview-graph/handle-timeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          partialAnswer: answerRef.current?.trim()
        }),
      });
      
      console.log('⏳ Timeout triggered');
      const result = await res.json();
      const data = result?.data;
  
      if (data?.hint) {
        appendMessage(`💡 Hint: ${data.hint}`);
      }      

      // message.info({
      //   content: `🤖 AI made a decision: ${data.decision}`,
      //   duration: 4,
      // });
      
      if (data?.decision === 'stop_answering') {
        if (!answerRef.current.trim()) {
          await sendAnswer('[No answer]');
        } else {
          await sendAnswer(answerRef.current);
        }
      }      
  
    } catch (err) {
      console.error('Failed to handle timeout:', err);
    }
  };  

  const startInterview = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/interview-graph/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: values.role,
          level: values.level,
          durationMinutes: values.duration,
        }),
      });

      const data = await res.json();
      setSessionId(data.sessionId);
      allMessagesRef.current = data.messages || [];
      setVisibleMessages(data.messages || []);
      setInterviewTimer(0);

      if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
      interviewTimerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1);
      }, 1000);

      const initialPayload = data?.questionPayload;
      if (initialPayload) {
        handleNewPayload(initialPayload);
      }
    } catch (err) {
      message.error('Failed to start interview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async (submittedAnswer?: string, forceProceed = false) => {
    const finalAnswer = submittedAnswer ?? answer;
  
    if (!finalAnswer.trim()) {
      if (submittedAnswer === '[No answer]') return; 
      return await sendAnswer('[No answer]');
    }    
  
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/interview-graph/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: finalAnswer }),
      });
  
      const data = await res.json();
  
      if (finalAnswer.trim()) {
        appendMessage(`You: ${finalAnswer}`);
      } else if (forceProceed) {
        appendMessage(`You: [No answer submitted]`);
      }
  
      setAnswer('');
      answerRef.current = '';
  
      const payload = data?.new_state?.questionPayload;
      if (payload) handleNewPayload(payload);
    } catch (err) {
      message.error('Error submitting answer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };   

  useEffect(() => {
    if (!sessionId || interviewComplete) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/receive-question');
        const data = await res.json();

        if (data?.isComplete) {
          appendMessage(`AI: ${data.acknowledgement}`);
          setInterviewComplete(true);
          setLatestQuestion('');
          setLastReceived('');
          setTimeLeft(null);
          stopInterviewTimer();
          if (data.feedback) {
            const parsedFeedback =
              typeof data.feedback === 'string'
                ? JSON.parse(data.feedback)
                : data.feedback;
          
            setFeedback(parsedFeedback);
          }          
        } else if (data?.question && data.question !== lastReceived) {
          const payload = {
            question: data.question,
            acknowledgement: data.acknowledgement,
            questionNumber: data.questionNumber,
            estimatedTime: data.estimatedTime,
            isComplete: false,
          };
          handleNewPayload(payload);
        }
      } catch (err) {
        console.error('Polling failed', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, lastReceived, interviewComplete]);

  const endInterviewManually = async () => {
    stopInterviewTimer();
  
    try {
      const res = await fetch(`${backendUrl}/api/v1/interview-graph/end-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
  
      const result = await res.json();
      const data = result?.data;
  
      if (data) {
        handleNewPayload(data.questionPayload || {});
      }
    } catch (err) {
      console.error('Failed to end interview manually:', err);
    }
  };   

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [visibleMessages]);
  


  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Start AI Interview</span>
          {sessionId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.9rem', color: '#555' }}>
                🕒 {Math.floor(interviewTimer / 60)}m {interviewTimer % 60}s
              </span>
              {!interviewComplete && (
                <Button
                  type="primary"
                  danger
                  onClick={endInterviewManually}
                >
                  End Interview
                </Button>             
              )}
            </div>          
          )}
        </div>
      }
      loading={loading}
    >
      {!sessionId ? (
        <Form form={form} layout="vertical" onFinish={startInterview}>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input placeholder="e.g., Data Analyst" />
          </Form.Item>
          <Form.Item name="level" label="Level" rules={[{ required: true }]}>
            <Select placeholder="Select level">
              <Select.Option value="Entry">Entry</Select.Option>
              <Select.Option value="Mid">Mid</Select.Option>
              <Select.Option value="Senior">Senior</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="Duration (in minutes)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Start Interview
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <>
          <div
            ref={messagesEndRef}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem',
              minHeight: 200,
              maxHeight: 300,
              overflowY: 'auto',
              background: '#f7f7f7',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {visibleMessages.map((msg, index) => {
              const isUser = msg.startsWith('You:');
              const isHint = msg.startsWith('💡 Hint:');
              const isAI = msg.startsWith('AI:');
              const isQuestion = isAI && /Q\d+:/.test(msg);

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 8,
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: isUser
                      ? '#d9f7be'
                      : isHint
                      ? '#fffbe6'
                      : isQuestion
                      ? '#f0f5ff'
                      : isAI
                      ? '#e6f7ff'
                      : '#f5f5f5',
                    border: isHint
                      ? '1px dashed #faad14'
                      : isQuestion
                      ? '1px solid #adc6ff'
                      : 'none',
                    fontStyle: isHint ? 'italic' : 'normal',
                    color: isHint ? '#ad8b00' : 'inherit',
                    whiteSpace: 'pre-wrap',
                    width: 'fit-content',
                    maxWidth: '100%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {isUser && <strong>You:</strong>}
                  {isHint && <strong>💡 Hint:</strong>}
                  {isQuestion && <strong>🤖 Question:</strong>}
                  {isAI && !isQuestion && <strong>🤖 AI:</strong>}
                  {!isUser && !isHint && !isAI && <strong>Info:</strong>}{' '}
                  {msg.replace(/^(You:|AI:|💡 Hint:)/, '').trim()}
                </div>
              );
            })}

            {interviewComplete && feedback && (
              <div
                style={{
                  marginTop: 20,
                  padding: 10,
                  background: '#e6f7ff',
                  border: '1px solid #91d5ff',
                  borderRadius: 4,
                }}
              >
                <strong>📝 Feedback:</strong>
                <div style={{ marginTop: 8 }}>
                  <p><strong>Strengths:</strong> {feedback.strengths}</p>
                  <p><strong>Communication:</strong> {feedback.communication}</p>
                  <p><strong>Suggestions:</strong> {feedback.suggestions}</p>
                </div>
              </div>
            )}
          </div>

          {latestQuestion && timeLeft !== null && (
            <div style={{ marginBottom: 10, fontWeight: 'bold' }}>
              ⏳ Time remaining: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
            </div>
          )}

          <Input.TextArea
            value={answer}
            rows={2}
            onChange={(e) => {
              setAnswer(e.target.value);
              answerRef.current = e.target.value;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                sendAnswer();    
              }
            }}
            placeholder={interviewComplete ? "Interview is over." : "Type your answer..."}
            disabled={interviewComplete}
          />

          <Button
            type="primary"
            onClick={() => sendAnswer()}
            disabled={!answer.trim()}
            style={{ marginTop: 10 }}
            loading={loading}
          >
            Submit Answer
          </Button>
        </>
      )}
    </Card>
  );
}
