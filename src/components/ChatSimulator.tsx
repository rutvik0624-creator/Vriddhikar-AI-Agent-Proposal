import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ChatSimulatorProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isTyping: boolean;
  onClearChat?: () => void;
}

const QUICK_ACTIONS = [
  "What time are the classes?",
  "How much does tutoring cost?",
  "Can I join if I'm 15?",
  "I lost my student ID card."
];

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ messages, onSendMessage, isTyping, onClearChat }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleQuickAction = (action: string) => {
    if (isTyping) return;
    onSendMessage(action);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Vriddhikar Support Bot</h2>
            <div className="flex items-center gap-2 text-blue-100 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Online & Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onClearChat && messages.length > 0 && (
            <button 
              onClick={onClearChat}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Powered
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-[#f8fafc] relative scroll-smooth">
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-gray-500 mt-12 max-w-sm mx-auto"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <Bot className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Simulator</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Test the AI Auto-Reply Bot by sending a message below, or use one of the quick actions to see how it categorizes and responds.
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : msg.isEscalated 
                      ? 'bg-red-50 border border-red-200 text-red-900 rounded-bl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.isEscalated && msg.role === 'bot' && (
                    <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold mb-2 uppercase tracking-wider bg-red-100/50 w-fit px-2 py-1 rounded-md">
                      <AlertTriangle className="w-3.5 h-3.5" /> Escalated to Human
                    </div>
                  )}
                  <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  <span className={`text-[10px] block mt-2 font-medium ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-auto">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a student query..."
            className="w-full pl-5 pr-14 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px]"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
