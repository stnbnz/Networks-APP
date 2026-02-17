import React, { useState } from 'react';
import { Subnet } from '../types';
import { Calculator, Database, Server, Plus, PieChart, RefreshCw } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MOCK_SUBNETS: Subnet[] = [
  { id: '1', name: 'Data Center Management', network: '10.0.0.0', cidr: 24, gateway: '10.0.0.1', vlan: 10, usage: 85, totalIps: 254, usedIps: 216, location: 'DC-A' },
  { id: '2', name: 'Corporate Wifi', network: '10.0.50.0', cidr: 23, gateway: '10.0.50.1', vlan: 20, usage: 45, totalIps: 510, usedIps: 230, location: 'HQ' },
  { id: '3', name: 'VoIP Network', network: '10.0.20.0', cidr: 24, gateway: '10.0.20.1', vlan: 30, usage: 12, totalIps: 254, usedIps: 30, location: 'HQ' },
  { id: '4', name: 'Guest Wifi', network: '192.168.100.0', cidr: 24, gateway: '192.168.100.1', vlan: 99, usage: 92, totalIps: 254, usedIps: 234, location: 'Lobby' },
];

const Ipam: React.FC = () => {
  const [calcIp, setCalcIp] = useState('192.168.1.10');
  const [calcCidr, setCalcCidr] = useState(24);
  const [calcResult, setCalcResult] = useState<any>(null);

  const calculateSubnet = () => {
    // Simple mock calculation logic for UI demonstration
    const total = Math.pow(2, 32 - calcCidr);
    const usable = total - 2;
    setCalcResult({
      network: `${calcIp.split('.').slice(0, 3).join('.')}.0`,
      mask: '255.255.255.0', // simplified
      broadcast: `${calcIp.split('.').slice(0, 3).join('.')}.255`,
      firstIp: `${calcIp.split('.').slice(0, 3).join('.')}.1`,
      lastIp: `${calcIp.split('.').slice(0, 3).join('.')}.254`,
      hosts: usable > 0 ? usable : 0
    });
  };

  const getUsageColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalUsed = MOCK_SUBNETS.reduce((acc, curr) => acc + curr.usedIps, 0);
  const totalAvailable = MOCK_SUBNETS.reduce((acc, curr) => acc + curr.totalIps, 0);
  
  const pieData = [
    { name: 'Used', value: totalUsed },
    { name: 'Free', value: totalAvailable - totalUsed },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
      
      {/* Main List */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">Total Subnets</p>
                    <h3 className="text-2xl font-bold text-white">{MOCK_SUBNETS.length}</h3>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Database size={24}/></div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">Total IPs Managed</p>
                    <h3 className="text-2xl font-bold text-white">{totalAvailable.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><Server size={24}/></div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center gap-4">
                <div className="flex-1">
                     <p className="text-slate-400 text-sm font-medium mb-1">Global Utilization</p>
                     <h3 className="text-2xl font-bold text-white mb-1">{Math.round((totalUsed/totalAvailable)*100)}%</h3>
                     <div className="w-full h-2 bg-slate-700 rounded-full">
                        <div className="h-full bg-primary-500 rounded-full" style={{width: `${(totalUsed/totalAvailable)*100}%`}}></div>
                     </div>
                </div>
                <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                            <Pie 
                                data={pieData} 
                                dataKey="value" 
                                innerRadius={20} 
                                outerRadius={30} 
                                stroke="none"
                            >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#334155" />
                            </Pie>
                        </RechartsPie>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Subnet Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Database size={18} className="text-primary-500"/> Subnet Inventory
                </h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm">
                    <Plus size={16}/> Add Subnet
                </button>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs">
                        <tr>
                            <th className="p-4">Subnet Name</th>
                            <th className="p-4">Network / CIDR</th>
                            <th className="p-4">VLAN</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 w-1/4">Utilization</th>
                            <th className="p-4 text-right">Available</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {MOCK_SUBNETS.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-white">{sub.name}</td>
                                <td className="p-4 font-mono text-slate-300">{sub.network}/{sub.cidr}</td>
                                <td className="p-4 text-slate-300">VLAN {sub.vlan}</td>
                                <td className="p-4 text-slate-300">{sub.location}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${getUsageColor(sub.usage)}`} style={{width: `${sub.usage}%`}}></div>
                                        </div>
                                        <span className="text-xs w-8 text-right text-slate-400">{sub.usage}%</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-300">{sub.totalIps - sub.usedIps}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Sidebar Calculator */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-primary-500"/> Subnet Calculator
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">IP Address</label>
                    <input 
                        type="text" 
                        value={calcIp} 
                        onChange={(e) => setCalcIp(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary-500 outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">CIDR Prefix (/{calcCidr})</label>
                    <input 
                        type="range" 
                        min="1" max="32" 
                        value={calcCidr} 
                        onChange={(e) => setCalcCidr(parseInt(e.target.value))} 
                        className="w-full accent-primary-500" 
                    />
                </div>
                <button onClick={calculateSubnet} className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center justify-center gap-2">
                    <RefreshCw size={16}/> Calculate
                </button>

                {calcResult && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Network:</span>
                            <span className="text-green-400">{calcResult.network}/{calcCidr}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Netmask:</span>
                            <span className="text-slate-300">{calcResult.mask}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Host Range:</span>
                            <span className="text-slate-300 text-right text-xs">{calcResult.firstIp} - <br/>{calcResult.lastIp}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Usable Hosts:</span>
                            <span className="text-white font-bold">{calcResult.hosts.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Ipam;