import React, { useState } from 'react';
import { AdminUser } from '../types';
import { Shield, UserPlus, Lock, Key, Edit, Trash2, CheckCircle, User, X } from 'lucide-react';

interface AccessControlProps {
    users: AdminUser[];
    setUsers: (users: AdminUser[]) => void;
}

const AccessControl: React.FC<AccessControlProps> = ({ users, setUsers }) => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUser, setNewUser] = useState<Partial<AdminUser>>({ role: 'Viewer', status: 'Active', twoFactor: false });

    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this admin user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newUser.name || !newUser.email) return;

        const user: AdminUser = {
            id: Date.now().toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role as any,
            status: 'Active',
            lastLogin: 'Never',
            twoFactor: newUser.twoFactor || false
        };

        setUsers([...users, user]);
        setIsAddOpen(false);
        setNewUser({ role: 'Viewer', status: 'Active', twoFactor: false });
    };

    return (
        <div className="flex flex-col gap-6 h-full relative">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-primary-500"/> User Access Control (RBAC)
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage system administrators, roles, and security policies.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <UserPlus size={18}/> Add New User
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                        <h3 className="font-bold text-white">Administrator Accounts</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Last Login</th>
                                <th className="p-4">2FA</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                                <User size={16}/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            user.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                            user.role === 'Viewer' ? 'bg-slate-700 text-slate-400' : 
                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">{user.lastLogin}</td>
                                    <td className="p-4">
                                        {user.twoFactor ? 
                                            <span className="text-green-500 flex items-center gap-1 text-xs"><CheckCircle size={12}/> Enabled</span> : 
                                            <span className="text-slate-500 text-xs">Disabled</span>
                                        }
                                    </td>
                                    <td className="p-4">
                                        {user.status === 'Active' ? 
                                            <span className="text-green-500 text-xs font-bold">Active</span> : 
                                            <span className="text-red-500 text-xs font-bold">Locked</span>
                                        }
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Role Definitions */}
                <div className="space-y-6">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Key size={18} className="text-yellow-500"/> Role Permissions
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div className="text-purple-400 font-bold text-sm mb-1">Super Admin</div>
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    Full access to all modules, user management, system settings, and destructive actions.
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div className="text-blue-400 font-bold text-sm mb-1">Network Admin</div>
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    Can configure devices, manage VLANs, and update firewall rules. Cannot manage users.
                                </div>
                            </div>
                            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div className="text-green-400 font-bold text-sm mb-1">NOC Operator</div>
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    Read-only access to configs. Can acknowledge alerts and view logs.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
                         <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Lock size={18} className="text-red-500"/> Security Policy
                        </h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span>Session Timeout</span>
                                <span className="text-white">15 Minutes</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span>Password Expiry</span>
                                <span className="text-white">90 Days</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span>Failed Login Lockout</span>
                                <span className="text-white">5 Attempts</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span>Concurrent Sessions</span>
                                <span className="text-white">1 per User</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                            <h3 className="text-lg font-bold text-white">Add Administrator</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                                <input type="text" required value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                                <input type="email" required value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none">
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Network Admin">Network Admin</option>
                                    <option value="NOC Operator">NOC Operator</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={newUser.twoFactor} onChange={e => setNewUser({...newUser, twoFactor: e.target.checked})} className="rounded bg-slate-900 border-slate-600"/>
                                <label className="text-sm text-slate-300">Enforce 2FA on login</label>
                            </div>
                            <button type="submit" className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 mt-2">
                                <UserPlus size={18}/> Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessControl;