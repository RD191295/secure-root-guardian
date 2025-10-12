import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogEntry } from '@/hooks/useBootLogs';

interface BootLogsPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClearLogs: () => void;
}

export const BootLogsPanel: React.FC<BootLogsPanelProps> = ({
  logs,
  isOpen,
  onToggle,
  onClearLogs
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getLevelStyles = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'success':
        return 'border-l-green-500 bg-green-500/5';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'error':
        return 'border-l-red-500 bg-red-500/5';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="fixed right-0 top-24 h-[calc(100vh-6rem)] z-40">
      <div className={`h-full transition-all duration-300 ${isOpen ? 'w-[450px]' : 'w-12'}`}>
        {/* Toggle Button */}
        <CollapsibleTrigger asChild>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-gray-800 hover:bg-gray-700 border border-r-0 border-gray-700 rounded-l-lg p-2 transition-colors"
            aria-label="Toggle logs panel"
          >
            {isOpen ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>

        {/* Panel Content */}
        <CollapsibleContent className="h-full">
          <div className="h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Boot Logs</h3>
                <span className="text-xs text-gray-500">({logs.length})</span>
              </div>
              <button
                onClick={onClearLogs}
                className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Logs Container */}
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="p-4 space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No logs yet</p>
                    <p className="text-xs mt-1">Logs will appear as boot stages progress</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded border-l-4 ${getLevelStyles(log.level)} animate-fade-in`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getLevelIcon(log.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{log.timestamp}</span>
                            <span className="text-xs text-gray-600">Stage {log.stage}</span>
                          </div>
                          <p className="text-sm text-gray-200 font-mono leading-relaxed break-words">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
              Real-time secure boot monitoring
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
