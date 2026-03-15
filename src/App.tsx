/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatSimulator } from './components/ChatSimulator';
import { LogsDashboard } from './components/LogsDashboard';
import { EscalationDesk } from './components/EscalationDesk';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsDashboard } from './components/SettingsDashboard';
import { LogEntry, EscalationEntry, ChatMessage } from './types';
import { processStudentQuery } from './services/ai';
import { MessageSquare, Database, AlertTriangle, FileText, Menu, X, BarChart2, Settings, LogOut, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'logs' | 'escalations' | 'analytics' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for the application
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [escalations, setEscalations] = useState<EscalationEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Process with AI
      const result = await processStudentQuery(text);
      
      // Add bot message
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: result.reply,
        timestamp: new Date(),
        isEscalated: result.isEscalated
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Add to logs
      const newLog: LogEntry = {
        id: (Date.now() + 2).toString(),
        timestamp: new Date(),
        query: text,
        category: result.category,
        status: result.isEscalated ? 'Escalated' : 'Resolved',
        reply: result.rawReply,
        processingTimeMs: result.processingTimeMs
      };
      setLogs(prev => [newLog, ...prev]);

      // Add to escalations if needed
      if (result.isEscalated) {
        const newEscalation: EscalationEntry = {
          id: (Date.now() + 3).toString(),
          timestamp: new Date(),
          studentName: 'Web User',
          query: text,
          reason: result.escalationReason,
          summary: result.escalationSummary,
          status: 'Pending'
        };
        setEscalations(prev => [newEscalation, ...prev]);
        toast.warning('Query escalated to human staff', {
          description: result.escalationReason
        });
      } else {
        toast.success('Query resolved automatically');
      }
    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to process query', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleResolveEscalation = (id: string) => {
    setEscalations(prev => prev.map(esc => 
      esc.id === id ? { ...esc, status: 'Resolved' } : esc
    ));
    
    toast.success('Escalation resolved', {
      description: 'The student query has been marked as resolved.'
    });
  };

  const navItems: { id: 'chat' | 'logs' | 'escalations' | 'analytics'; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'Live Simulator', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'logs', label: 'Interaction Logs', icon: <Database className="w-5 h-5" /> },
    { id: 'escalations', label: 'Escalation Desk', icon: <AlertTriangle className="w-5 h-5" />, badge: escalations.filter(e => e.status !== 'Resolved').length },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <div className={`bg-[#0f172a] text-slate-300 w-72 flex-shrink-0 flex flex-col transition-all duration-300 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-72 absolute h-full z-30'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Vriddhikar AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold">Support Hub</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-4 py-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Main Menu</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${activeTab === item.id ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@vriddhikar.org</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                activeTab === 'settings' 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-red-400 hover:text-red-300 transition-colors border border-slate-700">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-4 shadow-sm z-20 relative">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 bg-gray-100 p-2 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Vriddhikar AI</h1>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-50/50">
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto h-full">
              <ChatSimulator 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping} 
                onClearChat={() => setMessages([])}
              />
            </div>
          )}
          
          {activeTab === 'logs' && (
            <div className="max-w-6xl mx-auto h-full">
              <LogsDashboard logs={logs} />
            </div>
          )}
          
          {activeTab === 'escalations' && (
            <div className="max-w-6xl mx-auto h-full">
              <EscalationDesk escalations={escalations} onResolve={handleResolveEscalation} />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto h-full">
              <AnalyticsDashboard logs={logs} escalations={escalations} />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto h-full">
              <SettingsDashboard />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


