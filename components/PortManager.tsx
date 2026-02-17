import React, { useState } from 'react';
import { SwitchPort } from '../types';
import { Cable, RefreshCw, Power, Settings, Activity } from 'lucide-react';

const MOCK_PORTS: SwitchPort[] = Array.from({ length: 48 }, (_, i) => {
    const isUp = i < 20 || i === 47; // Randomly make some ports up
    return {
        id: i + 1,
        name: `Gi1/0/${i + 1}`,
        status: isUp ? 'UP' : 'DOWN',
        speed: i === 47 ? '10G' : '1G',
        duplex: 'Full',
        vlan: i < 10 ? 10 : i < 20 ? 20 : 1,
        poe: i < 10, // First 10 ports have PoE
        neighbor: i === 47 ? 'Core-Router-01' : i === 0 ? 'Wifi-AP-Lobby' : undefined
    };
});

const PortManager: React.FC = () => {
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null);
  
  const getPortColor = (port: SwitchPort) => {
      if (port.status === 'ADMIN_DOWN') return 'bg-slate-700 border-slate-600';
      if (port.status === 'ERR_DISABLE') return 'bg-red-900/50 border-red-500 animate-pulse';
      if (port.status === 'DOWN') return 'bg-slate-800 border-slate-600';
      if (port.poe) return 'bg-blue-500/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      return 'bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  };

  const getLedColor = (status: string) => {
      if (status === 'UP') return 'bg-green-500';
      if (status === 'DOWN') return 'bg-slate-600';
      return 'bg-red-500';
  };

  return (
    <div className="flex flex-col h-full gap-6">
        {/* Visual Switch Faceplate */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-primary-500"/>
                        Dist-Switch-A (Cisco Catalyst 9300-48P)
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">Uptime: 120d 4h • IP: 10.0.1.1 • Location: Building 1 - MDF</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> UP</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> PoE</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-600"></span> DOWN</span>
                </div>
            </div>

            {/* Switch Chassis View */}
            <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4 min-w-[800px] relative shadow-inner">
                {/* Branding/Logo Area */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl tracking-widest opacity-20 rotate-90 origin-left">
                    CISCO
                </div>

                <div className="flex flex-wrap gap-y-4 justify-center ml-10">
                    {/* Top Row (Odd Ports) */}
                    <div className="flex gap-1 mb-2 w-full justify-center">
                        {MOCK_PORTS.filter(p => p.id % 2 !== 0).map(port => (
                             <div 
                                key={port.id}
                                onClick={() => setSelectedPort(port)}
                                className={`w-10 h-10 border-2 rounded sm:w-12 sm:h-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getPortColor(port)} ${selectedPort?.id === port.id ? 'ring-2 ring-white' : ''}`}
                             >
                                 <div className="flex gap-1 mb-1">
                                     <div className={`w-1.5 h-1.5 rounded-full ${getLedColor(port.status)}`}></div>
                                     {port.poe && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                                 </div>
                                 <span className="text-[9px] text-slate-300 font-mono">{port.id}</span>
                             </div>
                        ))}
                    </div>

                    {/* Bottom Row (Even Ports) */}
                    <div className="flex gap-1 w-full justify-center">
                        {MOCK_PORTS.filter(p => p.id % 2 === 0).map(port => (
                             <div 
                                key={port.id}
                                onClick={() => setSelectedPort(port)}
                                className={`w-10 h-10 border-2 rounded sm:w-12 sm:h-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getPortColor(port)} ${selectedPort?.id === port.id ? 'ring-2 ring-white' : ''}`}
                             >
                                 <span className="text-[9px] text-slate-300 font-mono mb-1">{port.id}</span>
                                 <div className="flex gap-1">
                                     <div className={`w-1.5 h-1.5 rounded-full ${getLedColor(port.status)}`}></div>
                                     {port.poe && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Port Details Panel */}
        {selectedPort ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex-1 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Cable className="text-slate-400"/> Interface {selectedPort.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Configuration and Status</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                            <RefreshCw size={16}/> Reset Counters
                        </button>
                        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                            <Settings size={16}/> Configure
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">Admin Status</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-lg font-bold ${selectedPort.status === 'UP' ? 'text-green-500' : 'text-red-500'}`}>{selectedPort.status}</span>
                                <button className="p-1 bg-slate-700 rounded hover:bg-slate-600">
                                    <Power size={16} className={selectedPort.status === 'UP' ? 'text-green-400' : 'text-slate-400'}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">VLAN Assignment</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-white">VLAN {selectedPort.vlan}</span>
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">Link Speed</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-white">{selectedPort.speed} / {selectedPort.duplex}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 uppercase font-bold">PoE Status</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-lg font-bold ${selectedPort.poe ? 'text-blue-400' : 'text-slate-500'}`}>{selectedPort.poe ? 'Delivering (15.4W)' : 'Disabled'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                    <h4 className="text-sm font-bold text-slate-300 mb-2">Connected Neighbor (LLDP/CDP)</h4>
                    {selectedPort.neighbor ? (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded border border-slate-600">
                                <Activity size={20} className="text-green-500"/>
                            </div>
                            <div>
                                <div className="text-white font-medium">{selectedPort.neighbor}</div>
                                <div className="text-xs text-slate-500">Port ID: GigabitEthernet0/1 • Capability: Router</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm italic">No neighbor detected.</div>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-slate-500">
                <p>Select a port on the switch faceplate to view details.</p>
            </div>
        )}
    </div>
  );
};

export default PortManager;