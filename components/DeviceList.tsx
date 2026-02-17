import React, { useState } from 'react';
import { Device, DeviceStatus, DeviceType, RouterOSResource, RouterOSInterface } from '../types';
import { fetchSystemHealth, MikrotikCredentials } from '../services/mikrotikService';
import { Search, Plus, Filter, MoreVertical, Wifi, Server, Shield, Globe, Settings, Edit, Trash2, X, Check, Loader2, Radar, Cpu, HardDrive, Activity, Eye, Zap, Lock } from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  onConfigure: (deviceId: string) => void;
  onAddDevice: (device: Device) => void;
  onDeleteDevice: (id: string) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onConfigure, onAddDevice, onDeleteDevice }) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  
  // Scan State
  const [scanSubnet, setScanSubnet] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<Partial<Device>[]>([]);
  
  // Add Manual State
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    type: DeviceType.SERVER,
    status: DeviceStatus.ONLINE,
    location: 'Data Center',
    config: 'hostname new-device\n!'
  });

  // -- MikroTik API State --
  const [mtModalOpen, setMtModalOpen] = useState(false);
  const [mtData, setMtData] = useState<{resource: RouterOSResource, interfaces: RouterOSInterface[]} | null>(null);
  const [loadingMt, setLoadingMt] = useState(false);
  const [mtError, setMtError] = useState('');
  const [creds, setCreds] = useState<MikrotikCredentials>({ host: '', user: 'admin', password: '', port: 8728 });

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(filter.toLowerCase()) || 
    d.ip.includes(filter) ||
    d.location.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.name || !newDevice.ip) return;
    const device = createDeviceObject(newDevice);
    onAddDevice(device);
    setIsModalOpen(false);
    setNewDevice({ type: DeviceType.SERVER, status: DeviceStatus.ONLINE, config: 'hostname new-device\n!' });
  };

  const createDeviceObject = (partial: Partial<Device>): Device => ({
      id: Date.now().toString() + Math.random().toString().slice(2,5),
      name: partial.name || 'Unknown',
      ip: partial.ip || '0.0.0.0',
      mac: partial.mac || '00:00:00:00:00:00',
      type: partial.type as DeviceType,
      status: DeviceStatus.ONLINE,
      location: partial.location || 'Unknown',
      uptime: '0m',
      lastSeen: 'Just now',
      config: partial.config || '',
      cpu: Math.floor(Math.random() * 20),
      ram: Math.floor(Math.random() * 40),
      temp: 40
  });

  const startScan = () => {
    setIsScanning(true);
    setFoundDevices([]);
    
    // Simulate Scan Process
    setTimeout(() => {
        setFoundDevices(prev => [...prev, { name: 'HP-LaserJet-Pro', ip: '192.168.1.45', type: DeviceType.WORKSTATION, mac: '00:1B:44:11:3A:B7', location: 'Office' }]);
    }, 1000);
    setTimeout(() => {
        setFoundDevices(prev => [...prev, { name: 'Backup-NAS-02', ip: '192.168.1.200', type: DeviceType.SERVER, mac: '00:11:32:XX:XX:XX', location: 'Server Room' }]);
    }, 2000);
    setTimeout(() => {
        setFoundDevices(prev => [...prev, { name: 'Unknown-IoT-Device', ip: '192.168.1.105', type: DeviceType.ACCESS_POINT, mac: 'AC:84:C6:11:22:33', location: 'Lobby' }]);
        setIsScanning(false);
    }, 3000);
  };

  const importDevice = (dev: Partial<Device>) => {
      onAddDevice(createDeviceObject(dev));
      setFoundDevices(prev => prev.filter(d => d.ip !== dev.ip));
  };

  const openMikrotikModal = (device: Device) => {
      setCreds({
          host: device.ip,
          user: device.apiUser || 'admin',
          password: '',
          port: device.apiPort || 8728
      });
      setMtData(null);
      setMtError('');
      setMtModalOpen(true);
  };

  const handleConnectMikrotik = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoadingMt(true);
      setMtError('');
      setMtData(null);
      
      const result = await fetchSystemHealth(creds);
      
      if (result) {
          setMtData(result);
      } else {
          setMtError('Connection failed. Ensure Middleware (node server) is running on port 3001 and device is reachable.');
      }
      setLoadingMt(false);
  };

  const getIcon = (type: DeviceType) => {
    switch (type) {
      case DeviceType.ROUTER: return <Globe size={18} className="text-blue-400"/>;
      case DeviceType.SWITCH: return <Filter size={18} className="text-indigo-400"/>;
      case DeviceType.SERVER: return <Server size={18} className="text-purple-400"/>;
      case DeviceType.FIREWALL: return <Shield size={18} className="text-red-400"/>;
      case DeviceType.ACCESS_POINT: return <Wifi size={18} className="text-green-400"/>;
      default: return <Server size={18} className="text-slate-400"/>;
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ONLINE:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Online</span>;
      case DeviceStatus.OFFLINE:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Offline</span>;
      case DeviceStatus.WARNING:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Warning</span>;
      case DeviceStatus.MAINTENANCE:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">Maint.</span>;
    }
  };

  const getLoadColor = (val: number) => {
      if (val > 80) return 'bg-red-500';
      if (val > 50) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search devices by name, IP, or location..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsScanOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600 group"
            >
                <Radar size={18} className="group-hover:text-primary-400" />
                <span>Scan Network</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg"
            >
                <Plus size={18} />
                <span>Add Device</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-700">
              <th className="p-4 font-medium">Device Name</th>
              <th className="p-4 font-medium">IP Address</th>
              <th className="p-4 font-medium w-32">Status</th>
              <th className="p-4 font-medium w-32">CPU Load</th>
              <th className="p-4 font-medium w-32">RAM Usage</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredDevices.map((device) => (
              <tr key={device.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                        {getIcon(device.type)}
                    </div>
                    <div>
                        <p className="font-medium text-slate-200">{device.name}</p>
                        <p className="text-xs text-slate-500">{device.location} • {device.uptime}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300 font-mono text-sm">{device.ip}</td>
                <td className="p-4">{getStatusBadge(device.status)}</td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                       <Cpu size={14} className="text-slate-500"/>
                       <div className="flex-1 h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                           <div className={`h-full ${getLoadColor(device.cpu)}`} style={{width: `${device.cpu}%`}}></div>
                       </div>
                       <span className="text-xs text-slate-300 w-6">{device.cpu}%</span>
                   </div>
                </td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                       <HardDrive size={14} className="text-slate-500"/>
                       <div className="flex-1 h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                           <div className={`h-full ${getLoadColor(device.ram)}`} style={{width: `${device.ram}%`}}></div>
                       </div>
                       <span className="text-xs text-slate-300 w-6">{device.ram}%</span>
                   </div>
                </td>
                <td className="p-4 text-right">
                   <div className="flex justify-end gap-2">
                        {device.type === DeviceType.ROUTER && (
                            <button 
                                onClick={() => openMikrotikModal(device)}
                                className="p-2 bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                                title="Live RouterOS Stats"
                            >
                                <Activity size={16} />
                            </button>
                        )}
                        <button 
                            onClick={() => onConfigure(device.id)}
                            className="p-2 bg-slate-700 hover:bg-primary-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Configure Device"
                        >
                            <Settings size={16} />
                        </button>
                        <button 
                            onClick={() => onDeleteDevice(device.id)}
                            className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Delete Device"
                        >
                            <Trash2 size={16} />
                        </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Device Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <h3 className="text-lg font-bold text-white">Add New Device</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Device Name</label>
                        <input type="text" required value={newDevice.name || ''} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-primary-500 outline-none" placeholder="e.g. Switch-Floor-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">IP Address</label>
                            <input type="text" required value={newDevice.ip || ''} onChange={e => setNewDevice({...newDevice, ip: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-primary-500 outline-none" placeholder="192.168.1.1" />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                             <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value as DeviceType})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none">
                                {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                        <input type="text" value={newDevice.location || ''} onChange={e => setNewDevice({...newDevice, location: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex items-center gap-2">
                            <Check size={16} /> Add Device
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Network Scanner Modal */}
      {isScanOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                 <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Radar size={20} className="text-primary-500"/> Network Discovery
                    </h3>
                    <button onClick={() => setIsScanOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                 </div>
                 
                 <div className="p-6 bg-slate-800 border-b border-slate-700">
                     <div className="flex gap-4 items-end">
                         <div className="flex-1">
                             <label className="block text-xs font-medium text-slate-400 mb-1">Target Subnet / CIDR</label>
                             <input 
                                type="text" 
                                value={scanSubnet} 
                                onChange={e => setScanSubnet(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                         </div>
                         <button 
                            onClick={startScan}
                            disabled={isScanning}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {isScanning ? <Loader2 size={18} className="animate-spin"/> : <Radar size={18}/>}
                            {isScanning ? 'Scanning...' : 'Start Scan'}
                         </button>
                     </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50">
                     {foundDevices.length === 0 && !isScanning && (
                         <div className="text-center py-10 text-slate-500">
                             Enter a subnet and click scan to discover devices.
                         </div>
                     )}
                     
                     {foundDevices.length > 0 && (
                         <div className="space-y-3">
                             {foundDevices.map((dev, i) => (
                                 <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 animate-in slide-in-from-bottom-2">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-slate-700 rounded-lg">
                                             {getIcon(dev.type as DeviceType)}
                                         </div>
                                         <div>
                                             <div className="font-bold text-white">{dev.name}</div>
                                             <div className="text-xs text-slate-400 font-mono">{dev.ip} • {dev.mac}</div>
                                         </div>
                                     </div>
                                     <button 
                                        onClick={() => importDevice(dev)}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg flex items-center gap-1"
                                    >
                                        <Plus size={14}/> Import
                                     </button>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             </div>
          </div>
      )}

      {/* MikroTik Live API Modal */}
      {mtModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                 <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#4e3c35] rounded border border-[#e14e0e]/50">
                            {/* MikroTik Color hint */}
                            <Activity size={18} className="text-[#e14e0e]"/> 
                        </div>
                        <h3 className="text-lg font-bold text-white">
                            RouterOS Live Diagnostic
                        </h3>
                    </div>
                    <button onClick={() => setMtModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                 </div>

                 <div className="flex flex-col md:flex-row h-full overflow-hidden">
                     {/* Auth Panel */}
                     <div className="w-full md:w-64 bg-slate-900 p-4 border-r border-slate-800 flex flex-col gap-4">
                         <div className="text-xs font-bold text-slate-500 uppercase">Connection Details</div>
                         
                         <div>
                             <label className="text-xs text-slate-400 block mb-1">Host IP</label>
                             <input type="text" value={creds.host} readOnly className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-400 font-mono text-sm cursor-not-allowed"/>
                         </div>
                         <div>
                             <label className="text-xs text-slate-400 block mb-1">API User</label>
                             <input type="text" value={creds.user} onChange={e => setCreds({...creds, user: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"/>
                         </div>
                         <div>
                             <label className="text-xs text-slate-400 block mb-1">Password</label>
                             <div className="relative">
                                <Lock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"/>
                                <input type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1.5 text-white text-sm"/>
                             </div>
                         </div>
                         <div>
                             <label className="text-xs text-slate-400 block mb-1">API Port</label>
                             <input type="number" value={creds.port} onChange={e => setCreds({...creds, port: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"/>
                         </div>

                         <button 
                            onClick={handleConnectMikrotik}
                            disabled={loadingMt}
                            className="mt-2 w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {loadingMt ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
                            {loadingMt ? 'Connecting...' : 'Connect & Fetch'}
                         </button>

                         {mtError && (
                             <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                                 {mtError}
                             </div>
                         )}

                         <div className="mt-auto text-[10px] text-slate-600">
                             Requires Backend Middleware running on port 3001.
                         </div>
                     </div>

                     {/* Data Panel */}
                     <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
                         {!mtData ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                 <Activity size={48} className="opacity-20 mb-4"/>
                                 <p>Ready to connect. Enter credentials and click Connect.</p>
                             </div>
                         ) : (
                             <div className="space-y-6 animate-in fade-in duration-300">
                                 {/* Health Cards */}
                                 <div className="grid grid-cols-4 gap-4">
                                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                         <div className="text-slate-400 text-xs">Board Name</div>
                                         <div className="text-white font-bold text-lg">{mtData.resource['board-name']}</div>
                                     </div>
                                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                         <div className="text-slate-400 text-xs">Version</div>
                                         <div className="text-white font-bold text-lg">{mtData.resource.version}</div>
                                     </div>
                                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                         <div className="text-slate-400 text-xs">Uptime</div>
                                         <div className="text-white font-bold text-lg">{mtData.resource.uptime}</div>
                                     </div>
                                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                         <div className="text-slate-400 text-xs">CPU Load</div>
                                         <div className="flex items-center gap-2">
                                             <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                 <div className={`h-full ${parseInt(mtData.resource['cpu-load']) > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${mtData.resource['cpu-load']}%`}}></div>
                                             </div>
                                             <span className="text-white font-bold">{mtData.resource['cpu-load']}%</span>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Interface Table */}
                                 <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                     <div className="px-4 py-2 bg-slate-900 border-b border-slate-700 font-bold text-sm text-slate-300">
                                         Interfaces ({mtData.interfaces.length})
                                     </div>
                                     <table className="w-full text-left text-sm">
                                         <thead className="bg-slate-900 text-slate-500 text-xs uppercase">
                                             <tr>
                                                 <th className="p-3">Name</th>
                                                 <th className="p-3">Type</th>
                                                 <th className="p-3">MAC Address</th>
                                                 <th className="p-3">Status</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-700">
                                             {mtData.interfaces.map((iface, idx) => (
                                                 <tr key={idx} className="hover:bg-slate-700/50">
                                                     <td className="p-3 font-bold text-white">{iface.name}</td>
                                                     <td className="p-3 text-slate-400">{iface.type}</td>
                                                     <td className="p-3 font-mono text-slate-400 text-xs">{iface['mac-address']}</td>
                                                     <td className="p-3">
                                                         {iface.running === 'true' 
                                                            ? <span className="text-green-500 text-xs font-bold px-2 py-0.5 bg-green-900/20 rounded border border-green-900/50">RUNNING</span> 
                                                            : <span className="text-slate-500 text-xs">DOWN</span>}
                                                         {iface.disabled === 'true' && <span className="ml-2 text-red-500 text-xs font-bold">DISABLED</span>}
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default DeviceList;