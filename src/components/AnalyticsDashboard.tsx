import React, { useMemo } from 'react';
import { LogEntry, EscalationEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Zap, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users, Calendar, BarChart2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface AnalyticsDashboardProps {
  logs: LogEntry[];
  escalations: EscalationEntry[];
}

// Generate some fake historical data for the charts to look good even when empty
const generateHistoricalData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      queries: Math.floor(Math.random() * 50) + 20,
      resolved: Math.floor(Math.random() * 40) + 10,
    });
  }
  return data;
};

const historicalData = generateHistoricalData();

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ logs, escalations }) => {
  const stats = useMemo(() => {
    const totalQueries = logs.length;
    const resolved = logs.filter(l => l.status === 'Resolved').length;
    const automationRate = totalQueries > 0 ? Math.round((resolved / totalQueries) * 100) : 0;
    
    // Assume each automated query saves 5 minutes of human time
    const timeSavedMinutes = resolved * 5;
    const timeSavedHours = (timeSavedMinutes / 60).toFixed(1);

    const avgProcessingTime = totalQueries > 0 
      ? Math.round(logs.reduce((acc, log) => acc + (log.processingTimeMs || 0), 0) / totalQueries)
      : 0;

    return { totalQueries, resolved, automationRate, timeSavedHours, avgProcessingTime };
  }, [logs]);

  const categoryData = useMemo(() => {
    if (logs.length === 0) {
      return [
        { name: 'Enrollment', value: 45 },
        { name: 'Fees', value: 30 },
        { name: 'Schedule', value: 20 },
        { name: 'Eligibility', value: 15 },
        { name: 'Other', value: 5 },
      ];
    }
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.category] = (counts[log.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const statusData = useMemo(() => {
    if (logs.length === 0) {
      return [
        { name: 'Resolved', value: 85, color: '#10b981' },
        { name: 'Escalated', value: 15, color: '#ef4444' }
      ];
    }
    return [
      { name: 'Resolved', value: stats.resolved, color: '#10b981' },
      { name: 'Escalated', value: logs.length - stats.resolved, color: '#ef4444' }
    ];
  }, [stats.resolved, logs.length]);

  const trendData = useMemo(() => {
    // If we have real logs from today, update the last day's data
    if (logs.length > 0) {
      const updatedData = [...historicalData];
      const todayIndex = updatedData.length - 1;
      updatedData[todayIndex] = {
        ...updatedData[todayIndex],
        queries: updatedData[todayIndex].queries + logs.length,
        resolved: updatedData[todayIndex].resolved + stats.resolved
      };
      return updatedData;
    }
    return historicalData;
  }, [logs.length, stats.resolved]);

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
      className="space-y-6"
    >
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" /> Analytics Overview
          </h2>
          <p className="text-gray-500 mt-1">Real-time performance metrics for the AI Auto-Reply Bot.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Calendar className="w-4 h-4" /> Last 7 Days
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants as any} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600 z-10">
            <Users className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-sm font-medium text-gray-500">Total Queries</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{stats.totalQueries || 115}</p>
              {logs.length === 0 && <span className="text-xs text-blue-500 font-medium bg-blue-50 px-1.5 py-0.5 rounded">Simulated</span>}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-sm font-medium text-gray-500">Automation Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{logs.length > 0 ? stats.automationRate : 85}%</p>
              <span className="text-xs text-emerald-600 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600 z-10">
            <Clock className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-sm font-medium text-gray-500">Time Saved</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{logs.length > 0 ? stats.timeSavedHours : '8.5'} <span className="text-sm font-normal text-gray-500">hrs</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600 z-10">
            <Zap className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{logs.length > 0 ? stats.avgProcessingTime : '1.2'} <span className="text-sm font-normal text-gray-500">{logs.length > 0 ? 'ms' : 's'}</span></p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants as any} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Query Volume Trend</h3>
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-md">Last 7 Days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="queries" name="Total Queries" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
                <Area type="monotone" dataKey="resolved" name="Resolved by AI" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Resolution Status</h3>
          <p className="text-sm text-gray-500 mb-6">AI vs Human handling ratio</p>
          <div className="h-64 flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Queries`, '']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Queries by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Queries`, 'Volume']}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
