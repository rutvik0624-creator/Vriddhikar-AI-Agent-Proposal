import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bot, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsDashboard: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    botName: 'Vriddhikar Support Bot',
    confidenceThreshold: 85,
    autoEscalate: true,
    notificationEmail: 'admin@vriddhikar.org',
    slackWebhook: 'https://hooks.slack.com/services/...',
    theme: 'light'
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> System Settings
          </h2>
          <p className="text-gray-500 mt-1">Configure the AI Auto-Reply Bot and notification preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants as any} className="md:col-span-2 space-y-6">
          {/* AI Configuration */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Bot className="w-5 h-5 text-indigo-500" /> AI Configuration
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bot Display Name</label>
                <input 
                  type="text" 
                  value={settings.botName}
                  onChange={(e) => setSettings({...settings, botName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Confidence Threshold</label>
                  <span className="text-sm font-bold text-blue-600">{settings.confidenceThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="100" 
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Queries with AI confidence below this threshold will be automatically escalated to human staff.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Auto-Escalation</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Automatically route complex queries to the Escalation Desk.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoEscalate}
                    onChange={(e) => setSettings({...settings, autoEscalate: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Bell className="w-5 h-5 text-amber-500" /> Notification Preferences
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
                <input 
                  type="email" 
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({...settings, notificationEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slack Webhook URL</label>
                <input 
                  type="text" 
                  value={settings.slackWebhook}
                  onChange={(e) => setSettings({...settings, slackWebhook: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Used to send alerts to the #escalations channel.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="space-y-6">
          {/* Security & Access */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Shield className="w-5 h-5 text-emerald-500" /> Security
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>End-to-end encryption active</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>PII redaction enabled</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Role-based access control</span>
              </div>
              
              <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Manage API Keys
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">API Connection</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Database Sync</span>
                <span className="text-slate-200 font-medium">Up to date</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Last Backup</span>
                <span className="text-slate-200 font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Version</span>
                <span className="text-slate-200 font-medium font-mono">v1.2.4</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
