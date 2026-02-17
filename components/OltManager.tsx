import React, { useState } from 'react';
import { OnuDevice } from '../types';
import { Radio, Signal, Power, AlertTriangle, Activity, Search } from 'lucide-react';

interface OltManagerProps {
    onus: OnuDevice[];
}

const OltManager: React.FC<OltManagerProps> = ({ onus }) => {
    const [selectedPort, setSelectedPort] = useState<string>('PON 0/1/1');

    const ports = Array.from(new Set(onus.map(o => o.oltPort)));

    const getSignalColor = (dbm: number) => {
        if (dbm > -20) return 'text-green-400';
        if (dbm > -25) return 'text-yellow-400';
        return 'text-red-500';
    };

    const getSignalBar = (dbm: number) => {
        // Normalize -30 to -10 range to 0-100%
        let percent = ((dbm + 30) / 20) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        
        let color = 'bg-red-500';
        if (dbm > -25) color = 'bg-yellow-500';
        if (dbm > -20) color = 'bg-green-500';

        return (
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* OLT Header Visual */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Radio className="text-primary-500"/> GPON-OLT-Huawei (MA5608T)
                        </h2>
                        <p className="text-xs text-slate-500 font-mono mt-1">Uptime: 120d • Temp: 42°C • CPU: 12%</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded border border-green-500/30">Normal</div>
                        <div className="px-3 py-1 bg-slate-700 text-slate-300 rounded">Uplink: 10Gbps</div>
                    </div>
                </div>

                {/* Ports Visualization */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['PON 0/1/0', 'PON 0/1/1', 'PON 0/1/2', 'PON 0/1/3', 'PON 0/1/4', 'PON 0/1/5'].map(port => {
                        const count = onus.filter(o => o.oltPort === port).length;
                        const isSelected = selectedPort === port;
                        return (
                            <button 
                                key={port}
                                onClick={() => setSelectedPort(port)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 min-w-[100px] transition-all ${isSelected ? 'bg-primary-600/20 border-primary-500' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                            >
                                <span className={`text-xs font-bold ${isSelected ? 'text-primary-400' : 'text-slate-400'}`}>{port}</span>
                                <div className="mt-2 flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                    <span className="text-white font-bold">{count}</span>
                                    <span className="text-[10px] text-slate-500">ONUs</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ONU List for Selected Port */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-primary-500"/> Connected ONUs on {selectedPort}
                    </h3>
                    <div className="text-xs text-slate-400">
                        Total: {onus.filter(o => o.oltPort === selectedPort).length} Devices
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                         <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs sticky top-0">
                            <tr>
                                <th className="p-4">Serial / Name</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Optical Rx (dBm)</th>
                                <th className="p-4">Distance</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {onus.filter(o => o.oltPort === selectedPort).map(onu => (
                                <tr key={onu.id} className="hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{onu.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{onu.serialNumber}</div>
                                    </td>
                                    <td className="p-4">
                                         {onu.status === 'Online' ? (
                                             <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase"><Power size={12}/> Online</span>
                                         ) : (
                                             <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase"><AlertTriangle size={12}/> {onu.status}</span>
                                         )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {getSignalBar(onu.signalRx)}
                                            <span className={`font-mono font-bold ${getSignalColor(onu.signalRx)}`}>
                                                {onu.signalRx} dBm
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {onu.distance} m
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 text-xs font-bold border border-blue-500/30 px-3 py-1 rounded bg-blue-500/10">Reboot</button>
                                    </td>
                                </tr>
                            ))}
                            {onus.filter(o => o.oltPort === selectedPort).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                        No ONUs connected to this port.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OltManager;