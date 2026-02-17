import React, { useState, useEffect, useRef } from 'react';
import { TerminalSession } from '../types';
import { Terminal, Plus, X, Server, Shield } from 'lucide-react';

const MOCK_SESSIONS: TerminalSession[] = [
    { id: '1', deviceId: '1', deviceName: 'Core-Router-01', history: ['Core-Router-01# show ver', 'Cisco IOS Software...'] },
    { id: '2', deviceId: '4', deviceName: 'Firewall-Main', history: ['admin@fw-main> show system info', 'Hostname: fw-main...'] }
];

const WebTerminal: React.FC = () => {
  const [sessions, setSessions] = useState<TerminalSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeSession) {
        const cmd = input.trim();
        const newHistory = [...activeSession.history, `${activeSession.deviceName}# ${cmd}`];
        
        // Mock responses
        if (cmd === 'help' || cmd === '?') {
            newHistory.push('  show       Show running system information');
            newHistory.push('  configure  Enter configuration mode');
            newHistory.push('  ping       Send echo messages');
            newHistory.push('  exit       Exit current session');
        } else if (cmd === '') {
             // Do nothing just newline
        } else {
            newHistory.push(`% Unknown command or computer name, or unable to find computer address`);
        }

        const updatedSessions = sessions.map(s => 
            s.id === activeSessionId ? { ...s, history: newHistory } : s
        );
        setSessions(updatedSessions);
        setInput('');
    }
  };

  const closeSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (activeSessionId === id && newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
      }
  };

  const createSession = () => {
      const newId = Date.now().toString();
      const newSession: TerminalSession = {
          id: newId,
          deviceId: 'new',
          deviceName: `Terminal-${sessions.length + 1}`,
          history: ['Connecting...', 'Session established.']
      };
      setSessions([...sessions, newSession]);
      setActiveSessionId(newId);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl overflow-hidden border border-slate-700 shadow-2xl font-mono">
        {/* Tab Bar */}
        <div className="flex bg-slate-900 border-b border-slate-800">
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`group flex items-center gap-2 px-4 py-2 text-sm border-r border-slate-800 cursor-pointer select-none transition-colors ${activeSessionId === session.id ? 'bg-[#0d1117] text-white border-t-2 border-t-primary-500' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                >
                    <Terminal size={14} />
                    <span>{session.deviceName}</span>
                    <button onClick={(e) => closeSession(e, session.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400">
                        <X size={14} />
                    </button>
                </div>
            ))}
            <button onClick={createSession} className="px-3 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                <Plus size={16} />
            </button>
        </div>

        {/* Terminal Area */}
        {sessions.length > 0 ? (
            <div className="flex-1 p-4 overflow-y-auto text-sm" onClick={() => document.getElementById('terminal-input')?.focus()}>
                <div ref={outputRef} className="h-full flex flex-col">
                    <div className="text-slate-400 mb-2">Welcome to NetGuardian WebCLI v2.4.0</div>
                    {activeSession?.history.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap text-[#c9d1d9] leading-relaxed">{line}</div>
                    ))}
                    <div className="flex items-center mt-1">
                        <span className="text-green-500 mr-2">{activeSession?.deviceName}#</span>
                        <input 
                            id="terminal-input"
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleCommand}
                            autoFocus
                            autoComplete="off"
                            className="flex-1 bg-transparent border-none outline-none text-[#c9d1d9] caret-white"
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Server size={48} className="mb-4 opacity-50"/>
                <p>No active sessions.</p>
                <button onClick={createSession} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500">New Connection</button>
            </div>
        )}
    </div>
  );
};

export default WebTerminal;