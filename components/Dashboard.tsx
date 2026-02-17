import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Device, Alert, DeviceStatus } from '../types';
import { Activity, AlertTriangle, CheckCircle, Server, Wifi, ArrowUp, ArrowDown, Cpu, Shield, Clock, Zap } from 'lucide-react';

interface DashboardProps {
  devices: Device[];
  alerts: Alert[];
}

const dataTraffic = [
  { time: '00:00', upload: 40, download: 240 },
  { time: '04:00', upload: 30, download: 139 },
  { time: '08:00', upload: 200, download: 980 },
  { time: '12:00', upload: 278, download: 390 },
  { time: '16:00', upload: 189, download: 480 },
  { time: '20:00', upload: 239, download: 380 },
  { time: '24:00', upload: 349, download: 430 },
];

const dataProtocols = [
  { name: 'HTTPS', value: 45, color: '#3b82f6' },
  { name: 'SSH', value: 20, color: '#10b981' },
  { name: 'VoIP', value: 15, color: '#f59e0b' },
  { name: 'DNS', value: 10, color: '#8b5cf6' },
  { name: 'Other', value: 10, color: '#64748b' },
];

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
             <Icon size={80} className={colorClass.replace('bg-', 'text-').replace('/20', '')} />
        </div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                {subtext && <p className="text-slate-500 text-xs mt-2 font-medium">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20 shadow-inner`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('/20', '')} />
            </div>
        </div>
        {trend && (
            <div className={`mt-4 flex items-center text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? <ArrowUp size={12} className="mr-1"/> : <ArrowDown size={12} className="mr-1"/>}
                <span>{Math.abs(trend)}% vs last hour</span>
            </div>
        )}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ devices, alerts }) => {
  const onlineCount = devices.filter(d => d.status === DeviceStatus.ONLINE).length;
  const offlineCount = devices.filter(d => d.status === DeviceStatus.OFFLINE).length;
  const warningCount = devices.filter(d => d.status === DeviceStatus.WARNING).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  // Prepare Pie Chart Data
  const deviceStatusData = [
      { name: 'Online', value: onlineCount, color: '#22c55e' },
      { name: 'Warning', value: warningCount, color: '#eab308' },
      { name: 'Offline', value: offlineCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Get Top CPU Load Devices
  const highLoadDevices = [...devices].sort((a, b) => b.cpu - a.cpu).slice(0, 4);

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Inventory" 
            value={devices.length} 
            subtext={`${devices.length - offlineCount} Active Devices`}
            icon={Server} 
            colorClass="bg-blue-500 text-blue-500"
            trend={2}
        />
        <StatCard 
            title="Critical Issues" 
            value={criticalAlerts + offlineCount} 
            subtext="Requires Attention"
            icon={AlertTriangle} 
            colorClass="bg-red-500 text-red-500"
            trend={-5}
        />
        <StatCard 
            title="System Health" 
            value="98.5%" 
            subtext="Global Uptime"
            icon={CheckCircle} 
            colorClass="bg-green-500 text-green-500"
        />
        <StatCard 
            title="Net Throughput" 
            value="4.2 Gbps" 
            subtext="Peak: 8.5 Gbps"
            icon={Activity} 
            colorClass="bg-purple-500 text-purple-500"
            trend={8}
        />
      </div>

      {/* Row 2: Traffic & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart (Main) */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Network Traffic Volume</h3>
                    <p className="text-xs text-slate-400">Inbound vs Outbound (Last 24 Hours)</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Download</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Upload</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataTraffic}>
                        <defs>
                            <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} 
                            itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="download" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDown)" activeDot={{r: 6}} />
                        <Area type="monotone" dataKey="upload" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUp)" activeDot={{r: 6}} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Device Status Donut */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">Device Status</h3>
            <p className="text-xs text-slate-400 mb-6">Real-time availability distribution</p>
            
            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {deviceStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                             itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-3xl font-bold text-white">{devices.length}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Total</div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-green-500 font-bold text-lg">{onlineCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Online</div>
                </div>
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-yellow-500 font-bold text-lg">{warningCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Warning</div>
                </div>
                <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-red-500 font-bold text-lg">{offlineCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Offline</div>
                </div>
            </div>
        </div>
      </div>

      {/* Row 3: Detail Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* High CPU Load Devices */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Cpu size={18} className="text-orange-500"/> Top High-Load Devices
            </h3>
            <div className="space-y-4">
                {highLoadDevices.map(device => (
                    <div key={device.id} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 font-medium">{device.name}</span>
                            <span className={`font-mono font-bold ${device.cpu > 80 ? 'text-red-400' : 'text-yellow-400'}`}>{device.cpu}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${device.cpu > 80 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${device.cpu}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                             <span>{device.ip}</span>
                             <span>{device.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Protocol Distribution */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-blue-500"/> Protocol Distribution
            </h3>
            <div className="space-y-3">
                {dataProtocols.map((proto, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium text-slate-400">{proto.name}</div>
                        <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden relative">
                             <div 
                                className="absolute top-0 left-0 h-full rounded-full" 
                                style={{ width: `${proto.value}%`, backgroundColor: proto.color }}
                             ></div>
                        </div>
                        <div className="w-12 text-right text-sm font-bold text-slate-200">{proto.value}%</div>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700 flex items-center gap-3 text-xs text-slate-400">
                <Clock size={14}/>
                <span>Data aggregated from last 60 minutes via NetFlow.</span>
            </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield size={18} className="text-primary-500"/> Security Feed
                </h3>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded uppercase">Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[250px]">
                {alerts.map(alert => (
                    <div key={alert.id} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-default">
                        <div className={`mt-1 flex-shrink-0`}>
                            {alert.severity === 'critical' && <AlertTriangle size={16} className="text-red-500"/>}
                            {alert.severity === 'warning' && <Activity size={16} className="text-yellow-500"/>}
                            {alert.severity === 'info' && <CheckCircle size={16} className="text-blue-500"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 font-medium truncate">{alert.message}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-slate-500 font-mono">{alert.deviceId ? `ID: ${alert.deviceId}` : 'System'}</span>
                                <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div className="text-center text-slate-500 py-8 text-sm">
                        No active alerts. System healthy.
                    </div>
                )}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-bold text-center text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                View All Events Log
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;