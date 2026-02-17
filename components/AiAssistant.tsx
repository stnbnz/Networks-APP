import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu, Loader2, Trash2, Sparkles, Activity, AlertTriangle, FileCode } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, Device, Alert } from '../types';
import ReactMarkdown from 'react-markdown';

interface AiAssistantProps {
  devices: Device[];
  alerts: Alert[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ devices, alerts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello Admin. I have access to your live network telemetry. How can I help you optimize or troubleshoot today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getNetworkContext = () => {
    // condense data to save tokens but keep relevant info
    const deviceSummary = devices.map(d => ({
        name: d.name,
        ip: d.ip,
        status: d.status,
        cpu: `${d.cpu}%`,
        type: d.type
    }));
    
    return JSON.stringify({
        summary: {
            total_devices: devices.length,
            offline_count: devices.filter(d => d.status === 'OFFLINE').length,
            active_alerts: alerts.length
        },
        devices: deviceSummary,
        recent_alerts: alerts.slice(0, 10)
    }, null, 2);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Generate fresh context
      const context = getNetworkContext();
      const responseText = await sendMessageToGemini(messages.concat(userMsg), textToSend, context);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "I encountered an error connecting to the AI service. Please check your API configuration.",
          timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: "Chat cleared. Ready for new network queries.",
        timestamp: Date.now()
      }]);
  };

  const QUICK_ACTIONS = [
      { label: "Analyze Network Health", prompt: "Analyze the current network health based on device status and CPU load. Identify any critical issues.", icon: Activity },
      { label: "Explain Alerts", prompt: "Summarize the active alerts and suggest a remediation plan for the most critical ones.", icon: AlertTriangle },
      { label: "Generate Router Config", prompt: "Generate a standard Cisco IOS configuration template for a new Core Router with OSPF and SSH enabled.", icon: FileCode },
      { label: "Security Audit", prompt: "Based on the device list and types, what potential security risks should I be aware of?", icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg shadow-lg">
                <Cpu size={20} className="text-white" />
            </div>
            <div>
                <h2 className="font-semibold text-white flex items-center gap-2">
                    NetGuardian AI <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">ONLINE</span>
                </h2>
                <p className="text-xs text-slate-400">Context-Aware Network Assistant</p>
            </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Clear Chat">
            <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-800/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-primary-600' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-900/20' 
                  : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600 shadow-xl'
              }`}>
                {msg.role === 'model' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                ) : (
                    msg.text
                )}
                <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot size={16} />
                </div>
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-600 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                    <span className="text-slate-300 text-sm">Analyzing telemetry & generating response...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-900 border-t border-slate-700">
        {/* Quick Actions */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-800">
            {QUICK_ACTIONS.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSend(action.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap shadow-sm hover:border-slate-600"
                >
                    <action.icon size={12} className="text-primary-400"/>
                    {action.label}
                </button>
            ))}
        </div>
        
        <div className="p-4 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask NetGuardian about your network status, logs, or configuration..."
            className="w-full bg-slate-800 text-slate-100 pl-4 pr-12 py-3.5 rounded-xl border border-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-slate-500 shadow-inner"
            autoComplete="off"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary-900/30"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 pb-2">
            NetGuardian AI processes live dashboard data. Verify critical actions manually.
        </p>
      </div>
    </div>
  );
};

export default AiAssistant;