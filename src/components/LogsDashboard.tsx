import React, { useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { Database, Search, Filter, Clock, CheckCircle2, AlertTriangle, ChevronRight, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LogsDashboardProps {
  logs: LogEntry[];
}

export const LogsDashboard: React.FC<LogsDashboardProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Resolved' | 'Escalated'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.query.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, filterStatus]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    try {
      // Create CSV header
      const headers = ['Timestamp', 'Query', 'Category', 'Status', 'Processing Time (ms)', 'Raw Reply'];
      
      // Create CSV rows
      const csvRows = filteredLogs.map(log => {
        return [
          format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
          // Escape quotes and wrap in quotes to handle commas in text
          `"${log.query.replace(/"/g, '""')}"`,
          log.category,
          log.status,
          log.processingTimeMs || 0,
          `"${(log.reply || '').replace(/"/g, '""')}"`
        ].join(',');
      });
      
      // Combine header and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vriddhikar_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export logs');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Interaction Logs
          </h2>
          <p className="text-sm text-gray-500 mt-1">Simulating Google Sheets logging for analytics.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto relative">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50" 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors shadow-sm ${
                filterStatus !== 'All' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" /> 
              {filterStatus !== 'All' ? filterStatus : 'Filter'}
            </button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">Status</p>
                    {['All', 'Resolved', 'Escalated'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status as any);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          filterStatus === status 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto bg-gray-50/50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Timestamp</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Query</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Category</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Processing</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No logs found</p>
                    <p className="text-sm mt-1">
                      {logs.length === 0 
                        ? "Use the Chat Simulator to generate interaction logs." 
                        : "No logs match your current search/filter criteria."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  key={log.id} 
                  className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                >
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(log.timestamp, 'MMM d, h:mm a')}
                  </td>
                  <td className="p-4 text-sm text-gray-900 max-w-xs truncate font-medium" title={log.query}>
                    {log.query}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      log.status === 'Resolved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {log.status === 'Resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {log.processingTimeMs}ms
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
