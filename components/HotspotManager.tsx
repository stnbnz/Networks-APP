import React, { useState } from 'react';
import { HotspotUser } from '../types';
import { Wifi, User, Search, Ticket, Lock, AlertCircle, RefreshCw, Smartphone, Laptop, Trash2, Plus, X } from 'lucide-react';

interface HotspotManagerProps {
    users: HotspotUser[];
    setUsers: (users: HotspotUser[]) => void;
}

const HotspotManager: React.FC<HotspotManagerProps> = ({ users, setUsers }) => {
    const [filter, setFilter] = useState('');
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [voucherAmount, setVoucherAmount] = useState(1);
    const [voucherProfile, setVoucherProfile] = useState('Guest');

    const handleKick = (id: string) => {
        if (confirm('Disconnect this user?')) {
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Expired' } : u));
        }
    };

    const handleDelete = (id: string) => {
        if(confirm('Delete this user record?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const generateVoucher = (e: React.FormEvent) => {
        e.preventDefault();
        const newUsers: HotspotUser[] = [];
        for(let i=0; i<voucherAmount; i++) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            newUsers.push({
                id: Date.now().toString() + i,
                username: `v-${code}`,
                profile: voucherProfile as any,
                status: 'Active',
                ip: '0.0.0.0', // pending assignment
                mac: 'Pending',
                uptime: '0m',
                download: 0,
                upload: 0,
                quota: voucherProfile === 'VIP' ? 5000 : 500
            });
        }
        setUsers([...newUsers, ...users]);
        setIsVoucherModalOpen(false);
        setVoucherAmount(1);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Expired': return 'bg-slate-700/50 text-slate-500 border-slate-600';
            case 'Suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-700 text-slate-400';
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full relative">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Active Sessions</p>
                        <h3 className="text-3xl font-bold text-white">{users.filter(u => u.status === 'Active').length}</h3>
                    </div>
                    <div className="p-4 bg-green-500/20 rounded-full text-green-500"><Wifi size={24}/></div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Bandwidth Consumed</p>
                        <h3 className="text-3xl font-bold text-white">3.4 GB</h3>
                    </div>
                    <div className="p-4 bg-blue-500/20 rounded-full text-blue-500"><ActivityIcon size={24}/></div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                     <button 
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-lg font-bold flex flex-col items-center gap-1 shadow-lg"
                    >
                         <Ticket size={24}/>
                         <span>Generate Voucher</span>
                     </button>
                     <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-lg font-bold flex flex-col items-center gap-1 border border-slate-600">
                         <User size={24}/>
                         <span>User Profiles</span>
                     </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Wifi size={18} className="text-primary-500"/> Hotspot Users
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                        <input 
                            type="text" 
                            placeholder="Search username, IP, MAC..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs sticky top-0 z-10">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Profile</th>
                                <th className="p-4">IP / MAC</th>
                                <th className="p-4">Uptime</th>
                                <th className="p-4">Usage (DL/UL)</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.filter(u => u.username.includes(filter) || u.ip.includes(filter)).map(user => (
                                <tr key={user.id} className="hover:bg-slate-700/30 group">
                                    <td className="p-4 font-bold text-white flex items-center gap-2">
                                        <div className="p-2 bg-slate-700 rounded-full">
                                            {user.profile === 'Guest' ? <Smartphone size={16} className="text-slate-400"/> : <Laptop size={16} className="text-blue-400"/>}
                                        </div>
                                        {user.username}
                                    </td>
                                    <td className="p-4 text-slate-300">{user.profile}</td>
                                    <td className="p-4 text-xs font-mono text-slate-400">
                                        <div className="text-slate-300">{user.ip}</div>
                                        <div>{user.mac}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">{user.uptime}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 w-32">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>{user.download} MB</span>
                                                <span>Limit: {user.quota}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{width: `${(user.download / user.quota) * 100}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleKick(user.id)}
                                                className="p-2 hover:bg-orange-500/20 hover:text-orange-500 text-slate-500 rounded-lg transition-colors" 
                                                title="Disconnect User"
                                            >
                                                <Lock size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 hover:bg-red-500/20 hover:text-red-500 text-slate-500 rounded-lg transition-colors" 
                                                title="Delete User"
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

            {/* Voucher Modal */}
            {isVoucherModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                            <h3 className="text-lg font-bold text-white">Generate Vouchers</h3>
                            <button onClick={() => setIsVoucherModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={generateVoucher} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Profile</label>
                                <select value={voucherProfile} onChange={e => setVoucherProfile(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none">
                                    <option value="Guest">Guest (500MB)</option>
                                    <option value="Employee">Employee (Unlimited)</option>
                                    <option value="VIP">VIP (5GB High Speed)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                                <input type="number" min="1" max="50" value={voucherAmount} onChange={e => setVoucherAmount(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none" />
                            </div>
                            <button type="submit" className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-2">
                                <Ticket size={18}/> Generate
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActivityIcon = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default HotspotManager;