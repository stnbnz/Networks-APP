import React from 'react';
import { SecurityEvent } from '../types';
import { ShieldAlert, Globe, Crosshair, Ban, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityMonitorProps {
    threats: SecurityEvent[];
    setThreats: (threats: SecurityEvent[]) => void;
}

const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ threats, setThreats }) => {
    
    const handleBlock = (id: string) => {
        setThreats(threats.map(t => t.id === id ? { ...t, status: 'Blocked' } : t));
    };

    const handleResolve = (id: string) => {
         setThreats(threats.filter(t => t.id !== id));
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-red-500 p-6 rounded-xl shadow-lg shadow-red-900/20 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-red-100 font-medium mb-1">Threat Level</div>
                        <div className="text-3xl font-bold">ELEVATED</div>
                    </div>
                    <ShieldAlert size={64} className="absolute -right-4 -bottom-4 text-red-700 opacity-50"/>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-3 flex items-center justify-around text-center">
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">1,204</div>
                        <div className="text-xs text-slate-400">Packets Dropped (24h)</div>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div>
                        <div className="text-2xl font-bold text-red-400 mb-1">{threats.length}</div>
                        <div className="text-xs text-slate-400">Active Threats</div>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div>
                        <div className="text-2xl font-bold text-green-400 mb-1">100%</div>
                        <div className="text-xs text-slate-400">IPS Engine Status</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Geo Map Simulation */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col relative overflow-hidden group">
                     <div className="p-4 border-b border-slate-700 bg-slate-900/50 absolute w-full z-10">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Globe size={18} className="text-blue-500"/> Live Threat Map
                        </h3>
                    </div>
                    <div className="flex-1 bg-slate-900 flex items-center justify-center relative opacity-50 group-hover:opacity-100 transition-opacity">
                         {/* Abstract Map Circles */}
                         <div className="w-64 h-64 rounded-full border border-slate-700 flex items-center justify-center relative">
                             <div className="w-48 h-48 rounded-full border border-slate-700 flex items-center justify-center">
                                 <div className="w-32 h-32 rounded-full border border-slate-700 flex items-center justify-center bg-slate-800">
                                     <Crosshair size={24} className="text-primary-500 animate-spin-slow"/>
                                 </div>
                             </div>
                             {/* Blips */}
                             <div className="absolute top-10 right-10 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                             <div className="absolute bottom-20 left-10 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                         </div>
                         <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                             Simulated Geo-IP Visualization
                         </div>
                    </div>
                </div>

                {/* Threat Log */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col overflow-hidden">
                     <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-yellow-500"/> Intrusion Detection Log
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs">
                                <tr>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Source</th>
                                    <th className="p-3">Loc</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {threats.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-700/30">
                                        <td className="p-3 font-bold text-white">{t.type}</td>
                                        <td className="p-3 text-slate-400 font-mono text-xs">
                                            <div>{t.sourceIp}</div>
                                            <div className="text-slate-500">to {t.targetIp}</div>
                                        </td>
                                        <td className="p-3 text-slate-300 flex items-center gap-1">
                                            <MapPin size={12}/> {t.location}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.status === 'Blocked' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {t.status !== 'Blocked' && (
                                                <button onClick={() => handleBlock(t.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded mr-2" title="Block IP">
                                                    <Ban size={14}/>
                                                </button>
                                            )}
                                            <button onClick={() => handleResolve(t.id)} className="p-1 hover:bg-green-500/20 text-green-400 rounded" title="Resolve Alert">
                                                <CheckCircle size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityMonitor;