import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Square, Activity, Globe, Wifi, Search } from 'lucide-react';

type ToolType = 'PING' | 'TRACEROUTE' | 'DNS' | 'SPEEDTEST';

const NetworkTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('PING');
  const [target, setTarget] = useState('8.8.8.8');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const addLine = (text: string) => setOutput(prev => [...prev, text]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput([]);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      if (activeTool === 'PING') {
        addLine(`PING ${target} (${target}): 56 data bytes`);
        for (let i = 1; i <= 4; i++) {
          if (signal.aborted) break;
          await new Promise(r => setTimeout(r, 800)); // Simulate delay
          const time = (Math.random() * 20 + 10).toFixed(1);
          addLine(`64 bytes from ${target}: icmp_seq=${i} ttl=118 time=${time} ms`);
        }
        if (!signal.aborted) {
          addLine('');
          addLine(`--- ${target} ping statistics ---`);
          addLine('4 packets transmitted, 4 packets received, 0.0% packet loss');
          addLine('round-trip min/avg/max = 10.2/15.5/30.1 ms');
        }
      } 
      else if (activeTool === 'TRACEROUTE') {
        addLine(`traceroute to ${target} (${target}), 30 hops max, 60 byte packets`);
        const hops = [
          '10.0.0.1 (Gateway)  0.435 ms',
          '203.0.113.1 (ISP-Edge)  2.120 ms',
          '172.16.20.5 (ISP-Core)  12.50 ms',
          '142.250.x.x (Google-Edge) 15.30 ms',
          `${target} (DNS) 15.80 ms`
        ];
        for (let i = 0; i < hops.length; i++) {
           if (signal.aborted) break;
           await new Promise(r => setTimeout(r, 600));
           addLine(`${i + 1}  ${hops[i]}`);
        }
      }
      else if (activeTool === 'DNS') {
          addLine(`Server:		127.0.0.53`);
          addLine(`Address:	127.0.0.53#53`);
          addLine(``);
          addLine(`Non-authoritative answer:`);
          addLine(`Name:	${target}`);
          addLine(`Address: 8.8.8.8`);
          addLine(`Address: 8.8.4.4`);
          addLine(`Address: 2001:4860:4860::8888`);
      }
    } catch (e) {
      // Aborted
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLine('^C');
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="text-primary-500" />
            Network Diagnostic Tools
        </h2>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar / Tabs */}
          <div className="w-full md:w-48 bg-slate-900 border-r border-slate-800 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {[
                { id: 'PING', label: 'Ping', icon: Activity },
                { id: 'TRACEROUTE', label: 'Traceroute', icon: Globe },
                { id: 'DNS', label: 'DNS Lookup', icon: Search },
                { id: 'SPEEDTEST', label: 'Speedtest (Sim)', icon: Wifi },
            ].map((tool: any) => (
                <button
                    key={tool.id}
                    onClick={() => { setActiveTool(tool.id); setOutput([]); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeTool === tool.id 
                        ? 'bg-primary-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                >
                    <tool.icon size={18} />
                    {tool.label}
                </button>
            ))}
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col p-4 bg-slate-800 gap-4 overflow-hidden">
              {/* Input Area */}
              <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="flex-1">
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Target Host / IP</label>
                      <input 
                        type="text" 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:ring-1 focus:ring-primary-500 outline-none"
                      />
                  </div>
                  <div className="flex items-end h-full pt-5">
                     {!isRunning ? (
                         <button 
                            onClick={handleRun}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
                        >
                             <Play size={18} /> Run
                         </button>
                     ) : (
                         <button 
                            onClick={handleStop}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
                        >
                             <Square size={18} /> Stop
                         </button>
                     )}
                  </div>
              </div>

              {/* Terminal Output */}
              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 p-4 font-mono text-sm overflow-y-auto shadow-inner custom-scrollbar">
                  <div className="space-y-1">
                      {output.map((line, i) => (
                          <div key={i} className="text-slate-300 whitespace-pre-wrap">{line}</div>
                      ))}
                      {output.length === 0 && !isRunning && (
                          <div className="text-slate-600 italic">Ready to execute command. Enter a target and click Run.</div>
                      )}
                      {isRunning && <div className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></div>}
                  </div>
                  <div ref={outputEndRef} />
              </div>
          </div>
      </div>
    </div>
  );
};

export default NetworkTools;