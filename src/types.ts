export interface LogEntry {
  id: string;
  timestamp: Date;
  query: string;
  category: string;
  status: 'Resolved' | 'Escalated';
  reply: string;
  processingTimeMs: number;
}

export interface EscalationEntry {
  id: string;
  timestamp: Date;
  studentName: string;
  query: string;
  reason: string;
  summary: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isEscalated?: boolean;
}

