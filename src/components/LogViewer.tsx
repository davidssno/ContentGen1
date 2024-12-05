import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useLogger, LogEntry } from '../utils/logger';

const LogViewer = () => {
  const logs = useLogger((state) => state.logs);
  const clearLogs = useLogger((state) => state.clearLogs);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (logs.length === 0) return null;

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Process Log</h3>
        <button
          onClick={clearLogs}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear logs
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start space-x-2 text-sm"
          >
            {getIcon(log.type)}
            <span className="text-gray-500">{getTimeString(log.timestamp)}</span>
            <span className={`flex-1 ${
              log.type === 'error' ? 'text-red-600' :
              log.type === 'success' ? 'text-green-600' :
              'text-gray-700'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;