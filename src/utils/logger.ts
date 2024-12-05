import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success';
  details?: any;
}

interface LogState {
  logs: LogEntry[];
  addLog: (message: string, type: LogEntry['type'], details?: any) => void;
  clearLogs: () => void;
}

export const useLogger = create<LogState>((set) => ({
  logs: [],
  addLog: (message, type, details) => 
    set((state) => ({
      logs: [...state.logs, {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        message,
        type,
        details
      }]
    })),
  clearLogs: () => set({ logs: [] })
}));

export const logger = {
  info: (message: string, details?: any) => useLogger.getState().addLog(message, 'info', details),
  error: (message: string, details?: any) => useLogger.getState().addLog(message, 'error', details),
  success: (message: string, details?: any) => useLogger.getState().addLog(message, 'success', details)
};