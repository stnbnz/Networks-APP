import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Search, Filter, Download, RotateCw, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '2023-10-27 10:45:01', severity: 'ERROR', source: 'Core-Router-01', message: 'OSPF-4-ADJCHG: Process 1, Nbr 10.0.0.2 on GigabitEthernet0/1 from FULL to DOWN', process: 'OSPF' },
  { id: '2', timestamp: '2023-10-27 10:45:05', severity: 'WARN', source: 'Firewall-Main', message: 'Connection limit reached for source 192.168.100.45', process: 'FW_CONN' },
  { id: '3', timestamp: '2023-10-27 10:46:12', severity: 'INFO', source: 'Dist-Switch-A', message: 'Interface GigabitEthernet1/0/24 changed state to up', process: 'LINK' },
  { id: '4', timestamp: '2023-10-27 10:47:00', severity: 'DEBUG', source: 'Web-Server-01', message: 'Health check probe received from Load Balancer', process: 'HTTP' },
  { id: '5', timestamp: '2023-10-27 10:48:30', severity: 'INFO', source: 'Wifi-AP-Lobby', message: 'Client ab:cd:ef:12:34:56 associated with SSID "Corp-Guest"', process: 'WIFI' },
  { id: '6', timestamp: '2023-10-27 10:50:15', severity: 'ERROR', source: 'DB-Server-01', message: 'Backup job failed: Disk space low', process: 'BACKUP' },
  { id: '7', timestamp: '2023-10-27 10:51:22', severity: 'WARN', source: 'Core-Router-01', message: 'High CPU utilization (88%) due to SSH brute force attempt', process: 'SEC' },
  { id: '8', timestamp: '2023-10-27 10:52:10', severity: 'INFO', source: 'System', message: 'User admin logged in from 10.0.50.100', process: 'AUTH' },
];

const LogViewer: React.FC = () => {
  const [filterText, setFilterText] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesText = 
      log.message.toLowerCase().includes(filterText.toLowerCase()) || 
      log.source.toLowerCase().includes(filterText.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesText && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'ERROR': return <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs font-bold"><AlertCircle size={12}/> ERROR</span>;
      case 'WARN': return <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs font-bold"><AlertTriangle size={12}/> WARN</span>;
      case 'INFO': return <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold"><Info size={12}/> INFO</span>;
      case 'DEBUG': return <span className="flex items-center gap-1 text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded text-xs font-bold"><Bug size={12}/> DEBUG</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-full">
      {/* Header / Toolbar */}
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/50">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white mr-4">System Logs</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="bg-slate-900 text-slate-200 pl-9 pr-4 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm w-64"
                />
            </div>
            <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 text-sm focus:outline-none"
            >
                <option value="ALL">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
            </select>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors" title="Refresh">
                <RotateCw size={18} />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors border border-slate-600">
                <Download size={16} /> Export
            </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 sticky top-0 z-10">
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b border-slate-800 w-40">Timestamp</th>
                    <th className="p-3 border-b border-slate-800 w-24">Severity</th>
                    <th className="p-3 border-b border-slate-800 w-32">Source</th>
                    <th className="p-3 border-b border-slate-800 w-24">Process</th>
                    <th className="p-3 border-b border-slate-800">Message</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
                {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors group">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3">{getSeverityBadge(log.severity)}</td>
                        <td className="p-3 text-slate-300 font-bold">{log.source}</td>
                        <td className="p-3 text-slate-500">{log.process}</td>
                        <td className="p-3 text-slate-300 break-all">{log.message}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
                No logs found matching your filters.
            </div>
        )}
      </div>
      <div className="p-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-500 flex justify-between">
          <span>Showing {filteredLogs.length} events</span>
          <span>Live Logging: Active</span>
      </div>
    </div>
  );
};

export default LogViewer;