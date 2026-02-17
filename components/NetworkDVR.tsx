import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, AlertTriangle, Activity, Server, Rewind, FastForward } from 'lucide-react';
import { Device, DeviceStatus, NetworkSnapshot, LogEntry } from '../types';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, ReferenceLine } from 'recharts';

// -- Mock Data Generator for Timeline --
const generateHistory = (devices: Device[]): NetworkSnapshot[] => {
    const history: NetworkSnapshot[] = [];
    const now = Date.now();
    const duration = 60; // 60 minutes history

    for (let i = 0; i < duration; i++) {
        const timeOffset = (duration - 1 - i) * 60 * 1000;
        const timestamp = now - timeOffset;
        const date = new Date(timestamp);
        const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        // Simulate an incident in the middle (minute 30-40)
        let isIncident = i > 30 && i < 40;
        let traffic = isIncident ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 40 + 40);
        
        // Incident Logic: Spike traffic before crash, then drop
        if (i === 29) traffic = 98; // Spike
        if (i === 30) traffic = 0; // Crash start

        const deviceStates: Record<string, DeviceStatus> = {};
        devices.forEach(d => {
            // Simulate device failure during incident
            if (isIncident && (d.type === 'SWITCH' || d.type === 'ACCESS_POINT')) {
                deviceStates[d.id] = DeviceStatus.OFFLINE;
            } else if (i === 29 && d.type === 'ROUTER') {
                deviceStates[d.id] = DeviceStatus.WARNING; // High load warning
            } else {
                deviceStates[d.id] = DeviceStatus.ONLINE;
            }
        });

        const logs: LogEntry[] = [];
        if (i === 29) logs.push({ id: `log-${i}`, timestamp: timeLabel, severity: 'WARN', source: 'Core-Router-01', message: 'Traffic utilization > 95%' });
        if (i === 30) logs.push({ id: `log-${i}`, timestamp: timeLabel, severity: 'ERROR', source: 'Dist-Switch-A', message: 'Keepalive timeout. Neighbor down.' });
        if (i === 31) logs.push({ id: `log-${i}`, timestamp: timeLabel, severity: 'ERROR', source: 'System', message: 'Multiple devices unreachable.' });
        if (i === 40) logs.push({ id: `log-${i}`, timestamp: timeLabel, severity: 'INFO', source: 'Dist-Switch-A', message: 'Interface up. Recovery detected.' });

        history.push({
            timestamp,
            timeLabel,
            trafficLoad: traffic,
            activeAlerts: isIncident ? 5 : 0,
            deviceStates,
            logs
        });
    }
    return history;
};

interface NetworkDVRProps {
    devices: Device[];
}

const NetworkDVR: React.FC<NetworkDVRProps> = ({ devices }) => {
    const [history] = useState<NetworkSnapshot[]>(() => generateHistory(devices));
    const [currentIndex, setCurrentIndex] = useState<number>(history.length - 1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentSnapshot = history[currentIndex];

    // Playback Logic
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= history.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, playbackSpeed);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPlaying, playbackSpeed, history.length]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentIndex(Number(e.target.value));
        setIsPlaying(false);
    };

    const getDeviceColor = (status: DeviceStatus) => {
        switch (status) {
            case DeviceStatus.ONLINE: return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
            case DeviceStatus.OFFLINE: return 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse';
            case DeviceStatus.WARNING: return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header Control Panel */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Rewind size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Network Time Travel</h2>
                        <p className="text-xs text-slate-400">Replay incidents and traffic states</p>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-4 bg-slate-900 px-6 py-2 rounded-full border border-slate-700">
                    <button onClick={() => setCurrentIndex(0)} className="text-slate-400 hover:text-white"><SkipBack size={20}/></button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-yellow-500 text-black' : 'bg-primary-600 text-white'}`}
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor" className="ml-1"/>}
                    </button>
                    <button onClick={() => setCurrentIndex(history.length - 1)} className="text-slate-400 hover:text-white"><SkipForward size={20}/></button>
                    
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    
                    <span className="font-mono text-primary-400 font-bold w-16 text-center">{currentSnapshot.timeLabel}</span>
                </div>
            </div>

            {/* Main Visual Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                
                {/* 1. Topology State Visualization */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 relative overflow-hidden flex flex-col">
                    <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
                        Network State at <span className="text-white font-bold">{currentSnapshot.timeLabel}</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                         {/* Simple Topology Layout for DVR (Grid or Star) */}
                         <div className="relative w-full max-w-lg aspect-video">
                            {/* Central Core */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-slate-800 transition-colors duration-300 ${getDeviceColor(currentSnapshot.deviceStates['1'] || DeviceStatus.ONLINE)}`}>
                                    <Activity className="text-white" size={24}/>
                                </div>
                                <span className="mt-2 text-xs font-bold text-slate-300 bg-slate-900/80 px-2 rounded">Core Router</span>
                            </div>

                            {/* Connected Nodes */}
                            {devices.slice(1, 6).map((device, idx, arr) => {
                                const angle = (idx / arr.length) * 2 * Math.PI;
                                const radius = 160; // distance from center
                                const x = Math.cos(angle) * radius; // Center is 0,0 relative
                                const y = Math.sin(angle) * radius;

                                return (
                                    <React.Fragment key={device.id}>
                                        {/* Line to Center */}
                                        <div 
                                            className="absolute top-1/2 left-1/2 h-0.5 bg-slate-600 origin-left transition-opacity duration-300"
                                            style={{
                                                width: `${radius}px`,
                                                transform: `rotate(${angle * (180/Math.PI)}deg)`,
                                                opacity: currentSnapshot.deviceStates['1'] === DeviceStatus.OFFLINE || currentSnapshot.deviceStates[device.id] === DeviceStatus.OFFLINE ? 0.2 : 1
                                            }}
                                        ></div>

                                        {/* Node */}
                                        <div 
                                            className="absolute top-1/2 left-1/2 flex flex-col items-center transition-all duration-500"
                                            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                                        >
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 border-slate-800 transition-colors duration-300 ${getDeviceColor(currentSnapshot.deviceStates[device.id] || DeviceStatus.ONLINE)}`}>
                                                <Server className="text-white" size={20}/>
                                            </div>
                                            <span className="mt-1 text-[10px] text-slate-400 bg-slate-900/80 px-1 rounded whitespace-nowrap">{device.name}</span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                         </div>
                    </div>
                </div>

                {/* 2. Context Panel (Logs & Stats) */}
                <div className="flex flex-col gap-6">
                    {/* Traffic Gauge */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Traffic Load</h3>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-bold font-mono ${currentSnapshot.trafficLoad > 90 ? 'text-red-500' : 'text-white'}`}>
                                {currentSnapshot.trafficLoad}%
                            </span>
                            <span className="text-slate-500 mb-1">capacity used</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${currentSnapshot.trafficLoad > 90 ? 'bg-red-500' : 'bg-primary-500'}`} 
                                style={{ width: `${currentSnapshot.trafficLoad}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Historical Logs */}
                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                         <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                             <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                 <Clock size={16} className="text-slate-400"/> Event Log
                             </h3>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
                             {currentSnapshot.logs.length > 0 ? (
                                 currentSnapshot.logs.map((log, i) => (
                                     <div key={i} className="flex gap-3 items-start animate-in slide-in-from-right duration-300">
                                         <div className="mt-1">
                                             {log.severity === 'ERROR' ? <AlertTriangle size={14} className="text-red-500"/> : <Activity size={14} className="text-blue-500"/>}
                                         </div>
                                         <div>
                                             <div className="text-xs text-slate-500 font-mono">{log.timestamp}</div>
                                             <div className={`text-sm ${log.severity === 'ERROR' ? 'text-red-400' : 'text-slate-300'}`}>{log.message}</div>
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <div className="text-center text-slate-600 text-xs italic mt-10">No significant events at this timestamp.</div>
                             )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Bottom Timeline Slider */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <div className="h-24 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="trafficLoad" stroke="#6366f1" fill="url(#trafficGradient)" strokeWidth={2} />
                            {/* Current Time Indicator Line */}
                            <ReferenceLine x={currentSnapshot.timeLabel} stroke="#fff" strokeDasharray="3 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                    
                    {/* The Range Input Overlay */}
                    <input 
                        type="range" 
                        min="0" 
                        max={history.length - 1} 
                        value={currentIndex}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Custom Thumb Indicator Visual (follows the slider) */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] pointer-events-none transition-all duration-75"
                        style={{ left: `${(currentIndex / (history.length - 1)) * 100}%` }}
                    >
                        <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono uppercase tracking-wider">
                    <span>-60 Minutes</span>
                    <span>Live</span>
                </div>
            </div>
        </div>
    );
};

export default NetworkDVR;