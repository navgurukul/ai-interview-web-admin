'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';

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
  const [aiThinking, setAiThinking] = useState(false);
  const [disableAnswer, setDisableAnswer] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTriggerRef = useRef(false);
  const lastTimerQuestionRef = useRef<string | null>(null);
  const answerRef = useRef('');
  const allMessagesRef = useRef<string[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [partialFeedback, setPartialFeedback] = useState<string | null>(null);
  const [partialAction, setPartialAction] = useState<string | null>(null);
  const [partialLoading, setPartialLoading] = useState(false);
  const partialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPartialSentRef = useRef('');
  const answerInputRef = useRef<any>(null);
  const lastReceivedRef = useRef('');

  // Message array for chat UI
  const [messages, setMessages] = useState<{ type: string; text: string; key: string }[]>([]);

  const appendMessage = (msg: { type: string; text: string; key?: string }) => {
    setMessages(prev => [...prev, { ...msg, key: msg.key || uuidv4() }]);
  };

  const replaceAiThinking = (aiText: string) => {
    setMessages(prev => {
      const idx = prev.map(m => m.type).lastIndexOf('ai-thinking');
      if (idx === -1) {
        // No ai-thinking message to replace, so append as new AI message
        return [...prev, { type: 'ai', text: aiText, key: uuidv4() }];
      }
      const newMsgs = [...prev];
      newMsgs[idx] = { type: 'ai', text: aiText, key: uuidv4() };
      return newMsgs;
    });
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
          // triggerTimeout(); // (Guarded) - Temporarily disabled to prevent legacy hint system.
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
    const { question, acknowledgement, questionNumber, isComplete, estimatedTime: newTime, feedback: payloadFeedback } = payload;

    if (isComplete) {
      replaceAiThinking('✅ Interview complete.');
      setInterviewComplete(true);
      stopInterviewTimer();
      if (payloadFeedback) setFeedback(payloadFeedback);
      return;
    }

    // Use ref to prevent duplicate questions
    if (question && question !== lastReceived && question !== lastReceivedRef.current) {
      replaceAiThinking(`${acknowledgement} Q${questionNumber}: ${question}`);
      setLatestQuestion(question);
      setLastReceived(question);
      lastReceivedRef.current = question;
      startTimer(newTime || 60, `${question}-${questionNumber}`);
    }
  };

  /*
  // This legacy timeout function is disabled in favor of the new real-time evaluation hints.
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
  */

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
      setMessages([]); // Clear chat for new interview
      setInterviewTimer(0);

      if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
      interviewTimerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1);
      }, 1000);

      const initialPayload = data?.questionPayload;
      if (initialPayload) {
        appendMessage({ type: 'ai-thinking', text: '' });
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
    setAiThinking(true);
    try {
      // Append user message
      appendMessage({ type: 'user', text: finalAnswer });
      setAnswer('');
      answerRef.current = '';
      // Append AI thinking message
      appendMessage({ type: 'ai-thinking', text: '' });

      const res = await fetch(`${backendUrl}/api/v1/interview-graph/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: finalAnswer }),
      });

      const data = await res.json();

      // Only append new AI message, do not reset messages
      const payload = data?.new_state?.questionPayload;
      if (payload) handleNewPayload(payload);
    } catch (err) {
      message.error('Error submitting answer');
      console.error(err);
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  useEffect(() => {
    if (!sessionId || interviewComplete) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/receive-question');
        const data = await res.json();

        if (data?.isComplete) {
          replaceAiThinking('✅ Interview complete.');
          setInterviewComplete(true);
          setLatestQuestion('');
          setLastReceived('');
          lastReceivedRef.current = '';
          setTimeLeft(null);
          stopInterviewTimer();
          // Set feedback from data.feedback or data.questionPayload.feedback
          let parsedFeedback = null;
          try {
            if (data.feedback) {
              parsedFeedback = typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback;
            } else if (data.questionPayload && data.questionPayload.feedback) {
              parsedFeedback = typeof data.questionPayload.feedback === 'string' ? JSON.parse(data.questionPayload.feedback) : data.questionPayload.feedback;
            }
          } catch (e) {
            parsedFeedback = null;
          }
          setFeedback(parsedFeedback);
        } else if (data?.question && data.question !== lastReceived && data.question !== lastReceivedRef.current) {
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
  }, [messages]);

  // Debounced partial answer evaluation
  const evaluatePartialAnswer = useCallback((currentAnswer: string) => {
    if (!sessionId || !latestQuestion || interviewComplete || !currentAnswer.trim()) {
      setPartialFeedback(null);
      setPartialAction(null);
      return;
    }
    setPartialLoading(true);
    fetch(`${backendUrl}/api/v1/chat/partial-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: sessionId, // or actual user_id if available
        test_id: sessionId, // using sessionId for both for now
        question_id: latestQuestion,
        partial_answer: currentAnswer,
        is_complete: false
      })
    })
      .then(res => res.json())
      .then(result => {
        const data = result?.data;
        if (data) {
          setPartialFeedback(data.message);
          setPartialAction(data.action);
        } else {
          setPartialFeedback(null);
          setPartialAction(null);
        }
      })
      .catch(() => {
        setPartialFeedback(null);
        setPartialAction(null);
      })
      .finally(() => setPartialLoading(false));
  }, [sessionId, latestQuestion, interviewComplete, backendUrl]);

  // Watch answer changes and debounce partial evaluation
  useEffect(() => {
    if (partialTimeoutRef.current) clearTimeout(partialTimeoutRef.current);
    if (!answer.trim()) {
      setPartialFeedback(null);
      setPartialAction(null);
      return;
    }
    // Only send if answer changed
    if (answer === lastPartialSentRef.current) return;
    partialTimeoutRef.current = setTimeout(() => {
      lastPartialSentRef.current = answer;
      evaluatePartialAnswer(answer);
    }, 1000); // 1 second debounce
    return () => {
      if (partialTimeoutRef.current) clearTimeout(partialTimeoutRef.current);
    };
  }, [answer, evaluatePartialAnswer]);

  return (
    <>
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
              {messages.map((msg, index) => {
                if (msg.type === 'user') {
                  return (
                    <div key={msg.key} style={{
                      marginBottom: 8,
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: '#d9f7be',
                      alignSelf: 'flex-end',
                      width: 'fit-content',
                      maxWidth: '100%',
                      whiteSpace: 'pre-wrap',
                    }}>
                      <strong>You:</strong> {msg.text}
                    </div>
                  );
                }
                if (msg.type === 'ai') {
                  return (
                    <div key={msg.key} style={{
                      marginBottom: 8,
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: '#e6f7ff',
                      alignSelf: 'flex-start',
                      width: 'fit-content',
                      maxWidth: '100%',
                      whiteSpace: 'pre-wrap',
                    }}>
                      <strong>🤖 AI:</strong> {msg.text}
                    </div>
                  );
                }
                if (msg.type === 'ai-thinking') {
                  return (
                    <div key={msg.key} style={{
                      marginBottom: 8,
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: '#e6f7ff',
                      color: '#888',
                      fontStyle: 'italic',
                      width: 'fit-content',
                      maxWidth: '100%',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <strong>🤖 AI:</strong>
                      <span className="ai-typing">
                        <span style={{ display: 'inline-block', width: 18 }}>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                        </span>
                      </span>
                    </div>
                  );
                }
                return null;
              })}

              {interviewComplete && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 10,
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: 4,
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
                    🎉 Interview complete! Here is your feedback:
                  </div>
                  {feedback ? (
                    <div style={{ marginTop: 8 }}>
                      <p><strong>Strengths:</strong> {feedback.strengths}</p>
                      <p><strong>Communication:</strong> {feedback.communication}</p>
                      <p><strong>Suggestions:</strong> {feedback.suggestions}</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: '#888' }}>
                      Feedback is not available. Please contact support if this persists.
                    </div>
                  )}
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
              disabled={interviewComplete || disableAnswer}
              ref={answerInputRef}
              style={{ marginTop: 10 }}
            />

            {/* Real-time feedback below the input */}
            {partialLoading && !interviewComplete && answer.trim() && (
              <div style={{ margin: '8px 0', color: '#888', fontStyle: 'italic' }}>
                Checking your answer so far...
              </div>
            )}
            {partialFeedback && !interviewComplete && answer.trim() && (() => {
              // Hide feedback if answer is correct or on the right track
              if (
                partialAction === 'continue' ||
                (partialAction === 'stop' && typeof partialFeedback === 'string' && /similarity_score.?[:=]\s*0?\.?9[5-9]?/i.test(partialFeedback))
              ) {
                return null;
              }
              // If answer is completely wrong, prompt to go to next question and disable input
              if (partialAction === 'stop' && typeof partialFeedback === 'string' && /similarity_score.?[:=]\s*0?\.?[01][0-9]?/i.test(partialFeedback)) {
                if (!disableAnswer) setDisableAnswer(true);
                return (
                  <div
                    style={{
                      margin: '8px 0',
                      background: '#fff1f0',
                      border: '1px solid #ff4d4f',
                      color: '#a8071a',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontWeight: 'bold',
                      width: answerInputRef.current ? answerInputRef.current.resizableTextArea?.textArea?.offsetWidth || '100%' : '100%',
                      maxWidth: '100%'
                    }}
                  >
                    ⚠️ Your answer does not match the expected response. Let's move to the next question.
                  </div>
                );
              } else if (disableAnswer) {
                setDisableAnswer(false);
              }
              // Only show for 'hint' (yellow)
              if (partialAction === 'hint') {
                return (
                  <div
                    style={{
                      margin: '8px 0',
                      background: '#fffbe6',
                      border: '1px dashed #faad14',
                      color: '#ad8b00',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontStyle: 'italic',
                      width: answerInputRef.current ? answerInputRef.current.resizableTextArea?.textArea?.offsetWidth || '100%' : '100%',
                      maxWidth: '100%'
                    }}
                  >
                    💡 Hint: {partialFeedback}
                  </div>
                );
              }
              return null;
            })()}

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
      <style jsx>{`
      .ai-typing .dot {
        animation: blink 1.4s infinite both;
        font-size: 1.5em;
      }
      .ai-typing .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .ai-typing .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
    `}</style>
    </>
  );
}
