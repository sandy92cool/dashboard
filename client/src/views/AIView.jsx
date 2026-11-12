import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
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
      text: 'Hello! I am your Insurance Journey AI Copilot. I analyze the actual portfolio records in real-time. Ask me anything about conversion bottlenecks, product performance, demographic demand, or customer journeys.',
      engine: 'Grounded AI Engine'
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
          text: 'Sorry, I encountered an error analyzing the dataset. Please verify the server connection and try again.'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            🤖 AI Insights & Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time natural language analysis grounded strictly in portfolio data &bull; Zero Hallucination Mode
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            {insights?.engine || 'Strictly Grounded AI'}
          </span>
        </div>
      </div>

      {/* Date Filter */}
      <CalendarFilter
        startDate={startDate}
        endDate={endDate}
        onChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      {/* Executive Diagnostics */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Executive AI Portfolio Diagnostics</h2>
          </div>
          <button
            onClick={loadInsights}
            title="Re-analyze portfolio"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Re-analyze
          </button>
        </div>

        {insights?.executiveSummary && (
          <div className="mb-4 p-3.5 rounded-lg bg-slate-950/80 border border-indigo-500/20 text-xs text-slate-200 leading-relaxed">
            <span className="font-bold text-indigo-400">Executive Overview: </span>
            {insights.executiveSummary}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
            Analyzing portfolio records in real-time...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights?.insights?.map(item => {
              const border = item.severity === 'positive'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : item.severity === 'warning'
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-indigo-500/30 bg-indigo-500/5';

              const Icon = item.severity === 'positive'
                ? CheckCircle2
                : item.severity === 'warning'
                ? AlertTriangle
                : TrendingUp;

              const iconColor = item.severity === 'positive'
                ? 'text-emerald-400'
                : item.severity === 'warning'
                ? 'text-amber-400'
                : 'text-indigo-400';

              return (
                <div key={item.id} className={`p-4 rounded-xl border ${border} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.summary}</p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-indigo-300 font-medium">
                    💡 <span className="text-slate-400">Action:</span> {item.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive AI Copilot Chat */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Insurance Journey Copilot</h3>
              <p className="text-[11px] text-slate-400">
                Grounded natural language Q&A &bull; Date window: {startDate} to {endDate}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Grounded &bull; Non-Hallucinating
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
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="max-w-[85%] space-y-1">
                <div
                  className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.engine && (
                  <span className="text-[10px] text-slate-500 pl-1 block">
                    Source: {m.engine}
                  </span>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-400 rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
                <span className="ml-1">Analyzing portfolio records in real-time...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-slate-800/80">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about conversion rates, drop stages, products, or customer journeys..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || chatLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
