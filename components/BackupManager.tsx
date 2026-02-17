import React, { useState } from 'react';
import { BackupFile } from '../types';
import { Archive, Download, RotateCcw, Clock, Save, FileCode, CheckCircle, Loader2 } from 'lucide-react';

interface BackupManagerProps {
    backups: BackupFile[];
    setBackups: (backups: BackupFile[]) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ backups, setBackups }) => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    const handleBackupNow = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            const newBackup: BackupFile = {
                id: Date.now().toString(),
                deviceId: '1',
                deviceName: 'Core-Router-01',
                filename: `core-r1-${new Date().toISOString().slice(0,10)}.cfg`,
                size: '12 KB',
                date: 'Just now',
                type: 'Manual'
            };
            setBackups([newBackup, ...backups]);
            setIsBackingUp(false);
        }, 2000);
    };

    const handleRestore = (id: string) => {
        if(confirm('Warning: This will overwrite the current configuration. Continue?')) {
            setRestoringId(id);
            setTimeout(() => {
                setRestoringId(null);
                alert('Configuration restored successfully.');
            }, 2000);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Archive className="text-primary-500"/> Disaster Recovery & Backups
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Automated daily backups for all critical infrastructure. Restore configurations in one click.
                    </p>
                </div>
                <button 
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                    {isBackingUp ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                    {isBackingUp ? 'Backing Up...' : 'Backup All Now'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Backup History */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                        <h3 className="font-bold text-white">Repository</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs sticky top-0">
                                <tr>
                                    <th className="p-4">Device</th>
                                    <th className="p-4">Filename</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {backups.map(file => (
                                    <tr key={file.id} className="hover:bg-slate-700/30">
                                        <td className="p-4 font-bold text-slate-200">{file.deviceName}</td>
                                        <td className="p-4 font-mono text-slate-300 flex items-center gap-2">
                                            <FileCode size={14} className="text-slate-500"/> {file.filename}
                                        </td>
                                        <td className="p-4 text-slate-400">{file.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${file.type === 'Auto' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white" title="Download">
                                                    <Download size={16}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleRestore(file.id)}
                                                    className="p-2 bg-slate-700 hover:bg-red-600 rounded text-slate-300 hover:text-white" 
                                                    title="Restore to Device"
                                                >
                                                    {restoringId === file.id ? <Loader2 size={16} className="animate-spin"/> : <RotateCcw size={16}/>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Panel */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="font-bold text-white mb-4">Backup Policy</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 text-green-500 rounded-lg"><Clock size={20}/></div>
                                <div>
                                    <div className="font-bold text-white">Daily @ 02:00 AM</div>
                                    <div className="text-xs text-slate-400">Scheduled Execution</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Save size={20}/></div>
                                <div>
                                    <div className="font-bold text-white">30 Days Retention</div>
                                    <div className="text-xs text-slate-400">Old backups auto-pruned</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                                <div className="text-xs text-slate-500 mb-1">Last Successful Backup</div>
                                <div className="text-green-400 font-bold flex items-center justify-center gap-2">
                                    <CheckCircle size={14}/> Today, 02:00 AM
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupManager;