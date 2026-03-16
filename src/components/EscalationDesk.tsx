import React, { useState } from 'react';
import { EscalationEntry } from '../types';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, ShieldAlert, Bot, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface EscalationDeskProps {
  escalations: EscalationEntry[];
  onResolve: (id: string) => void;
}

export const EscalationDesk: React.FC<EscalationDeskProps> = ({ escalations, onResolve }) => {
  const [view, setView] = useState<'pending' | 'resolved'>('pending');
  
  const pendingEscalations = escalations.filter(e => e.status !== 'Resolved');
  const resolvedEscalations = escalations.filter(e => e.status === 'Resolved');
  
  const displayedEscalations = view === 'pending' ? pendingEscalations : resolvedEscalations;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-red-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" /> Escalation Desk
          </h2>
          <p className="text-sm text-red-700 mt-1">Manage queries requiring human intervention.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white rounded-lg p-1 border border-red-100 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setView('pending')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                view === 'pending' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Pending ({pendingEscalations.length})
            </button>
            <button
              onClick={() => setView('resolved')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                view === 'resolved' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              Resolved ({resolvedEscalations.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto p-4 sm:p-6 bg-gray-50/50">
        {displayedEscalations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-gray-500 mt-16 max-w-sm mx-auto"
          >
            {view === 'pending' ? (
              <>
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">All caught up!</p>
                <p className="text-sm text-gray-500">No pending escalations require human attention. Great job!</p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200">
                  <History className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">No history yet</p>
                <p className="text-sm text-gray-500">Resolved escalations will appear here.</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayedEscalations.map((esc) => (
                <motion.div 
                  key={esc.id} 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                    view === 'resolved' ? 'border-green-200 opacity-80' : 'border-red-200'
                  }`}
                >
                  <div className={`text-white px-5 py-3 flex justify-between items-center text-sm font-semibold ${
                    view === 'resolved' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
                  }`}>
                    <span className="flex items-center gap-2">
                      {view === 'resolved' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {view === 'resolved' ? 'Resolved' : 'Action Required'}
                    </span>
                    <span className="text-white/90 text-xs font-medium bg-black/20 px-2 py-1 rounded-md">
                      {format(esc.timestamp, 'h:mm a')}
                    </span>
                  </div>
                  <div className="p-4 sm:p-6 flex-grow space-y-4 sm:space-y-5">
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI Summary
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap font-mono border border-gray-200 shadow-inner">
                        {esc.summary}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Original Query
                      </p>
                      <p className="text-sm text-gray-700 italic border-l-4 border-blue-400 pl-4 py-1 bg-blue-50/50 rounded-r-lg">
                        "{esc.query}"
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                    {view === 'pending' ? (
                      <>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
                        </span>
                        <button 
                          onClick={() => onResolve(esc.id)}
                          className="flex-1 bg-white border border-gray-200 text-sm text-gray-700 hover:text-green-700 hover:border-green-300 hover:bg-green-50 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Resolve
                        </button>
                      </>
                    ) : (
                      <span className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Resolved Successfully
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
