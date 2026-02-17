import React, { useState } from 'react';
import { AutomationTask } from '../types';
import { Play, Clock, CheckCircle, XCircle, MoreVertical, FileText, Calendar, Plus, Trash2, X, Search, Filter, Loader2, ChevronRight, Terminal } from 'lucide-react';

interface AutomationProps {
    tasks: AutomationTask[];
    setTasks: React.Dispatch<React.SetStateAction<AutomationTask[]>>;
}

const TASK_TYPES = [
    { value: 'BACKUP', label: 'Configuration Backup', icon: FileText, color: 'text-blue-400' },
    { value: 'SCRIPT', label: 'Custom Script Execution', icon: Terminal, color: 'text-purple-400' },
    { value: 'FIRMWARE', label: 'Firmware Upgrade', icon: CheckCircle, color: 'text-green-400' },
    { value: 'COMPLIANCE', label: 'Compliance Audit', icon:  XCircle, color: 'text-red-400' }, 
];

const Automation: React.FC<AutomationProps> = ({ tasks, setTasks }) => {
  const [filter, setFilter] = useState('');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<AutomationTask>>({ type: 'BACKUP', targetGroup: 'All Devices', schedule: 'Daily' });

  // Logs Modal State
  const [selectedTaskLog, setSelectedTaskLog] = useState<AutomationTask | null>(null);

  // Actions
  const handleRunTask = (id: string) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'RUNNING' } : t));
      
      // Simulate execution
      setTimeout(() => {
          setTasks(prev => prev.map(t => {
              if (t.id === id) {
                  const isSuccess = Math.random() > 0.2; // 80% success rate mock
                  return { 
                      ...t, 
                      status: isSuccess ? 'SUCCESS' : 'FAILED',
                      lastRun: 'Just now' 
                  };
              }
              return t;
          }));
      }, 2500);
  };

  const handleDeleteTask = (id: string) => {
      if(confirm('Are you sure you want to delete this automation task?')) {
          setTasks(tasks.filter(t => t.id !== id));
      }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTask.name) return;

      const task: AutomationTask = {
          id: Date.now().toString(),
          name: newTask.name,
          type: newTask.type as any,
          targetGroup: newTask.targetGroup || 'All Devices',
          schedule: newTask.schedule || 'Manual',
          lastRun: 'Never',
          status: 'PENDING',
          nextRun: 'Pending Schedule'
      };

      setTasks([...tasks, task]);
      setIsCreateOpen(false);
      setNewTask({ type: 'BACKUP', targetGroup: 'All Devices', schedule: 'Daily' });
  };

  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));

  // Stats
  const successRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'SUCCESS').length / tasks.length) * 100) : 0;
  const runningCount = tasks.filter(t => t.status === 'RUNNING').length;

  return (
    <div className="flex flex-col gap-6 h-full relative">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                 <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Clock size={24}/></div>
                 <div>
                     <div className="text-2xl font-bold text-white">{tasks.length}</div>
                     <div className="text-xs text-slate-400">Total Tasks</div>
                 </div>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                 <div className="p-3 bg-green-500/20 rounded-lg text-green-500"><CheckCircle size={24}/></div>
                 <div>
                     <div className="text-2xl font-bold text-white">{successRate}%</div>
                     <div className="text-xs text-slate-400">Success Rate</div>
                 </div>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                 <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500">
                     {runningCount > 0 ? <Loader2 size={24} className="animate-spin"/> : <ActivityIcon size={24}/>}
                 </div>
                 <div>
                     <div className="text-2xl font-bold text-white">{runningCount}</div>
                     <div className="text-xs text-slate-400">Running Now</div>
                 </div>
             </div>
             <button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl border border-primary-500 flex flex-col items-center justify-center gap-1 transition-all shadow-lg hover:shadow-primary-900/50"
            >
                 <Plus size={24}/>
                 <span className="font-bold">Create New Task</span>
             </button>
        </div>

        {/* Task List Container */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-1 overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Terminal size={18} className="text-slate-400"/> Automation Schedules
                </h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <button className="p-2 bg-slate-700 rounded-lg text-slate-300 hover:text-white border border-slate-600">
                        <Filter size={18}/>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs sticky top-0 z-10">
                        <tr>
                            <th className="p-4">Task Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Target Group</th>
                            <th className="p-4">Schedule</th>
                            <th className="p-4">Last Run</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-slate-700/30 group transition-colors">
                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                                        {task.type === 'BACKUP' && <FileText size={16}/>}
                                        {task.type === 'SCRIPT' && <Terminal size={16}/>}
                                        {task.type === 'FIRMWARE' && <CheckCircle size={16}/>}
                                        {task.type === 'COMPLIANCE' && <XCircle size={16}/>}
                                    </div>
                                    {task.name}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 font-mono font-bold tracking-wide">{task.type}</span>
                                </td>
                                <td className="p-4 text-slate-300">{task.targetGroup}</td>
                                <td className="p-4 text-slate-300 flex items-center gap-2">
                                    <Clock size={14} className="text-slate-500"/> {task.schedule}
                                </td>
                                <td className="p-4 text-slate-400 text-xs">
                                    <div className="font-medium text-slate-300">{task.lastRun}</div>
                                    <div className="text-slate-500">Next: {task.nextRun}</div>
                                </td>
                                <td className="p-4">
                                    {task.status === 'SUCCESS' && <span className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-green-500/20"><CheckCircle size={12}/> SUCCESS</span>}
                                    {task.status === 'FAILED' && <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-red-500/20"><XCircle size={12}/> FAILED</span>}
                                    {task.status === 'RUNNING' && <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-500/20"><Loader2 size={12} className="animate-spin"/> RUNNING</span>}
                                    {task.status === 'PENDING' && <span className="flex items-center gap-1.5 text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-500/20"><Clock size={12}/> PENDING</span>}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleRunTask(task.id)}
                                            disabled={task.status === 'RUNNING'}
                                            className="p-2 bg-slate-700 hover:bg-green-600 hover:text-white rounded-lg text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                            title="Run Now"
                                        >
                                            <Play size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTaskLog(task)}
                                            className="p-2 bg-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-slate-300 transition-colors" 
                                            title="View Logs"
                                        >
                                            <FileText size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-2 bg-slate-700 hover:bg-red-600 hover:text-white rounded-lg text-slate-300 transition-colors"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Create Task Modal */}
        {isCreateOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Plus size={20} className="text-primary-500"/> Create Automation Task
                        </h3>
                        <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Task Name</label>
                            <input 
                                type="text" 
                                required 
                                value={newTask.name || ''} 
                                onChange={e => setNewTask({...newTask, name: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary-500 outline-none" 
                                placeholder="e.g. Weekly Switch Backup" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Task Type</label>
                                <div className="space-y-2">
                                    {TASK_TYPES.map(type => (
                                        <label key={type.value} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${newTask.type === type.value ? 'bg-primary-600/20 border-primary-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}>
                                            <input 
                                                type="radio" 
                                                name="taskType" 
                                                className="hidden" 
                                                checked={newTask.type === type.value} 
                                                onChange={() => setNewTask({...newTask, type: type.value as any})}
                                            />
                                            <type.icon size={16} className={newTask.type === type.value ? 'text-primary-400' : 'text-slate-500'}/>
                                            <span className={`text-sm ${newTask.type === type.value ? 'text-white font-medium' : 'text-slate-400'}`}>{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Target Group</label>
                                    <select 
                                        value={newTask.targetGroup} 
                                        onChange={e => setNewTask({...newTask, targetGroup: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none"
                                    >
                                        <option value="All Devices">All Devices</option>
                                        <option value="All Routers">All Routers</option>
                                        <option value="All Switches">All Switches</option>
                                        <option value="Firewalls">Firewalls</option>
                                        <option value="Access Points">Access Points</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Schedule</label>
                                    <select 
                                        value={newTask.schedule} 
                                        onChange={e => setNewTask({...newTask, schedule: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none"
                                    >
                                        <option value="Daily">Daily (00:00)</option>
                                        <option value="Weekly">Weekly (Sunday)</option>
                                        <option value="Hourly">Every Hour</option>
                                        <option value="Manual">Manual Trigger Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 mt-2">
                            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary-900/50">
                                <Plus size={18} /> Create Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Logs Viewer Modal */}
        {selectedTaskLog && (
            <div className="absolute inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full md:w-1/2 h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-primary-500"/> Task Execution Logs
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">{selectedTaskLog.name} • {selectedTaskLog.id}</p>
                        </div>
                        <button onClick={() => setSelectedTaskLog(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                             <div className="p-2 bg-green-500/20 text-green-500 rounded-lg mt-1"><CheckCircle size={18}/></div>
                             <div>
                                 <div className="font-bold text-slate-200 mb-1">Execution Successful</div>
                                 <div className="text-slate-400 text-xs mb-2">Timestamp: {selectedTaskLog.lastRun}</div>
                                 <div className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                     {`> Initializing ${selectedTaskLog.type} sequence...\n> Target Group: ${selectedTaskLog.targetGroup}\n> Connecting to devices...\n> 12/12 Devices reachable.\n> Executing payload...\n> Verifying integrity...\n> Task completed successfully.`}
                                 </div>
                             </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-800 opacity-70">
                             <div className="p-2 bg-red-500/20 text-red-500 rounded-lg mt-1"><XCircle size={18}/></div>
                             <div>
                                 <div className="font-bold text-slate-200 mb-1">Execution Failed</div>
                                 <div className="text-slate-400 text-xs mb-2">Timestamp: Yesterday, 02:00 AM</div>
                                 <div className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                     {`> Initializing ${selectedTaskLog.type} sequence...\n> Target Group: ${selectedTaskLog.targetGroup}\n> Connecting to devices...\n> Error: Connection timeout on Device-04\n> Retry 1/3...\n> Failed to establish SSH session.\n> Task aborted.`}
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                         <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700">Download Full Log</button>
                         <button onClick={() => setSelectedTaskLog(null)} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold">Close</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const ActivityIcon = ({size, className}: {size?:number, className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default Automation;