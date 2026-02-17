import React, { useState } from 'react';
import { Subscriber } from '../types';
import { Users, Search, Plus, Filter, Wifi, Radio, UserCheck, UserX, Activity } from 'lucide-react';

interface SubscriberManagerProps {
    subscribers: Subscriber[];
    setSubscribers: (subs: Subscriber[]) => void;
}

const SubscriberManager: React.FC<SubscriberManagerProps> = ({ subscribers, setSubscribers }) => {
    const [filter, setFilter] = useState('');

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Installation': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    const getSignalColor = (signal: string) => {
        if (signal === 'N/A') return 'text-slate-500';
        const dbm = parseFloat(signal);
        if (dbm > -20) return 'text-green-500'; // Great
        if (dbm > -25) return 'text-yellow-500'; // OK
        return 'text-red-500'; // Poor
    };

    const filteredSubs = subscribers.filter(s => 
        s.name.toLowerCase().includes(filter.toLowerCase()) || 
        s.accountNumber.toLowerCase().includes(filter.toLowerCase()) ||
        s.address.toLowerCase().includes(filter.toLowerCase())
    );

    const toggleStatus = (id: string) => {
        setSubscribers(subscribers.map(s => {
            if (s.id === id) {
                return { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' };
            }
            return s;
        }));
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Users size={24}/></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{subscribers.length}</div>
                        <div className="text-xs text-slate-400">Total Subscribers</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-500"><UserCheck size={24}/></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{subscribers.filter(s => s.status === 'Active').length}</div>
                        <div className="text-xs text-slate-400">Active Users</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-lg text-red-500"><UserX size={24}/></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{subscribers.filter(s => s.status === 'Suspended').length}</div>
                        <div className="text-xs text-slate-400">Suspended</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                     <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><Activity size={24}/></div>
                     <div>
                         <div className="text-2xl font-bold text-white">$ {subscribers.reduce((acc, s) => acc + s.monthlyFee, 0).toFixed(0)}</div>
                         <div className="text-xs text-slate-400">Est. Monthly Revenue</div>
                     </div>
                </div>
            </div>

            {/* Subscriber List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-primary-500"/> Customer Database
                    </h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                            <input 
                                type="text" 
                                placeholder="Search Name, Account, Address..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium">
                            <Plus size={16}/> New Sub
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs sticky top-0 z-10">
                            <tr>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Service Plan</th>
                                <th className="p-4">Connection</th>
                                <th className="p-4">Address</th>
                                <th className="p-4">Signal</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredSubs.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-700/30 group transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{sub.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{sub.accountNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-300">{sub.planName}</div>
                                        <div className="text-xs text-slate-500">{sub.serviceType} • ${sub.monthlyFee}</div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-400">
                                        <div>{sub.ip}</div>
                                        <div>{sub.mac}</div>
                                    </td>
                                    <td className="p-4 text-slate-300 max-w-xs truncate" title={sub.address}>
                                        {sub.address}
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-mono font-bold ${getSignalColor(sub.signalStrength || 'N/A')}`}>
                                            {sub.signalStrength !== 'N/A' ? `${sub.signalStrength} dBm` : '-'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => toggleStatus(sub.id)}
                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${sub.status === 'Active' ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                        >
                                            {sub.status === 'Active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriberManager;