import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import CalendarFilter from '../components/CalendarFilter.jsx';

const QUICK_QUESTIONS = [
  'What is our top trending product and its conversion rate?',
  'Why are users dropping off and which page is the main bottleneck?',
  'Give me the portfolio status count breakdown',
  'Which cities have the highest demand for insurance products?',
  'What are the top underwriting rejection errors for customers?',
  'Tell me the status and details for APP-2026-10001'
];

export default function AIView() {
  const [startDate, setStartDate] = useState('2026-09-28');
  const [endDate, setEndDate] = useState('2026-10-28');

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello. I am the Insurance Journey AI Intelligence Engine. I analyze the verified portfolio records directly. Ask me about funnel bottlenecks, product velocities, or specific customer applications.'
    }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAiInsights(startDate, endDate);
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [startDate, endDate]);

  const handleSend = async (queryText) => {
    const q = (queryText ?? input).trim();
    if (!q) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await apiClient.askAi(q, startDate, endDate);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          engine: res.engine
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error querying analytical engine. Please try again.'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Executive Intelligence &amp; AI Copilot
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly grounded analytical reasoning engine &bull; Zero Hallucination Mode
          </p>
        </div>

        <CalendarFilter
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {/* Executive Overview Box */}
      {insights?.executiveSummary && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-slate-800 leading-relaxed shadow-2xs">
          <span className="font-bold text-blue-900 uppercase font-mono tracking-wider mr-2">
            Actuarial Summary:
          </span>
          {insights.executiveSummary}
        </div>
      )}

      {/* Executive Diagnostic Cards Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Executive Diagnostics</h2>
          </div>
          <button
            onClick={loadInsights}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Re-calculate
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            Evaluating portfolio records in real-time...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights?.insights?.map(item => {
              const border = item.severity === 'positive'
                ? 'border-emerald-200 bg-emerald-50/30'
                : item.severity === 'warning'
                ? 'border-amber-200 bg-amber-50/30'
                : 'border-slate-200 bg-slate-50/50';

              const Icon = item.severity === 'positive'
                ? CheckCircle2
                : item.severity === 'warning'
                ? AlertTriangle
                : TrendingUp;

              const iconColor = item.severity === 'positive'
                ? 'text-emerald-700'
                : item.severity === 'warning'
                ? 'text-amber-700'
                : 'text-blue-700';

              return (
                <div key={item.id} className={`p-4 rounded-lg border ${border} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.summary}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-700 font-medium">
                    <span className="font-mono text-slate-500 uppercase text-[10px] block">Action:</span>
                    {item.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Copilot Chat Window */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-[480px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Copilot</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Verified Grounded Engine &bull; Window: {startDate} to {endDate}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            ZERO HALLUCINATION
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="max-w-[85%] space-y-1">
                <div
                  className={`rounded-lg px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-4 py-2 text-xs flex items-center gap-1.5 font-mono">
                Evaluating records in real-time...
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-slate-100">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query journey metrics, conversion bottlenecks, or specific policy numbers..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || chatLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
