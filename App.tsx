import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Network, Server, Settings, MessageSquare, Menu, Bell, Search, User, FileCode, FileText, Wrench, Database, Shield, PieChart, Cable, Terminal, Clock, Rewind, Wifi, Archive, Lock, Maximize, Minimize } from 'lucide-react';
import Dashboard from './components/Dashboard';
import DeviceList from './components/DeviceList';
import TopologyMap from './components/TopologyMap';
import AiAssistant from './components/AiAssistant';
import ConfigManager from './components/ConfigManager';
import LogViewer from './components/LogViewer';
import NetworkTools from './components/NetworkTools';
import SettingsPage from './components/Settings';
import Ipam from './components/Ipam';
import FirewallBuilder from './components/FirewallBuilder';
import Reports from './components/Reports';
import PortManager from './components/PortManager';
import Automation from './components/Automation';
import WebTerminal from './components/WebTerminal';
import NetworkDVR from './components/NetworkDVR';
import CommandPalette from './components/CommandPalette';
import HotspotManager from './components/HotspotManager';
import AccessControl from './components/AccessControl';
import BackupManager from './components/BackupManager';
import SecurityMonitor from './components/SecurityMonitor';
import Login from './components/Login';
import { Device, Alert, DeviceStatus, DeviceType, NetworkData, HotspotUser, AdminUser, BackupFile, AutomationTask, FirewallRule, SecurityEvent } from './types';

// -- Mock Configs --
const CISCO_CONFIG = `
!
version 16.9
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname Core-Router-01
!
interface GigabitEthernet0/0/0
 description WAN-UPLINK
 ip address 203.0.113.5 255.255.255.252
 negotiation auto
!
interface GigabitEthernet0/0/1
 description LAN-CORE
 ip address 10.0.0.1 255.255.255.0
 negotiation auto
!
router ospf 1
 router-id 10.0.0.1
 network 10.0.0.0 0.0.0.255 area 0
!
line vty 0 4
 password cisco
 login
 transport input telnet
!
end
`;

const SWITCH_CONFIG = `
!
version 15.2
hostname Dist-Switch-A
!
vlan 10
 name SALES
!
vlan 20
 name HR
!
interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 10
!
interface GigabitEthernet1/0/2
 switchport mode access
 switchport access vlan 20
!
interface Vlan1
 ip address 10.0.1.1 255.255.255.0
!
end
`;

// -- Initial Data Sets --
const INITIAL_DEVICES: Device[] = [
  { id: '1', name: 'Core-Router-01', ip: '10.0.0.1', mac: '00:1A:2B:3C:4D:5E', type: DeviceType.ROUTER, status: DeviceStatus.ONLINE, uptime: '45d 12h', location: 'Data Center A', lastSeen: 'Now', config: CISCO_CONFIG, cpu: 45, ram: 60, temp: 42 },
  { id: '2', name: 'Dist-Switch-A', ip: '10.0.1.1', mac: '00:1A:2B:3C:4D:5F', type: DeviceType.SWITCH, status: DeviceStatus.ONLINE, uptime: '120d 4h', location: 'Building 1 - MDF', lastSeen: 'Now', config: SWITCH_CONFIG, cpu: 12, ram: 30, temp: 38 },
  { id: '3', name: 'Dist-Switch-B', ip: '10.0.2.1', mac: '00:1A:2B:3C:4D:60', type: DeviceType.SWITCH, status: DeviceStatus.WARNING, uptime: '5d 2h', location: 'Building 2 - MDF', lastSeen: '2m ago', config: SWITCH_CONFIG.replace('Dist-Switch-A', 'Dist-Switch-B'), cpu: 88, ram: 40, temp: 55 },
  { id: '4', name: 'Firewall-Main', ip: '10.0.0.254', mac: '00:1A:2B:3C:4D:61', type: DeviceType.FIREWALL, status: DeviceStatus.ONLINE, uptime: '200d 1h', location: 'Data Center A', lastSeen: 'Now', config: '# Firewall Rules\nallow 10.0.0.0/24 any', cpu: 25, ram: 50, temp: 40 },
  { id: '5', name: 'Web-Server-01', ip: '10.0.10.5', mac: '00:1A:2B:3C:4D:62', type: DeviceType.SERVER, status: DeviceStatus.ONLINE, uptime: '12d 6h', location: 'Data Center A', lastSeen: 'Now', cpu: 10, ram: 80, temp: 35 },
  { id: '6', name: 'DB-Server-01', ip: '10.0.10.6', mac: '00:1A:2B:3C:4D:63', type: DeviceType.SERVER, status: DeviceStatus.MAINTENANCE, uptime: '0d 0h', location: 'Data Center A', lastSeen: '1h ago', cpu: 0, ram: 0, temp: 0 },
  { id: '7', name: 'Wifi-AP-Lobby', ip: '10.0.50.10', mac: '00:1A:2B:3C:4D:64', type: DeviceType.ACCESS_POINT, status: DeviceStatus.ONLINE, uptime: '30d 12h', location: 'Lobby', lastSeen: 'Now', cpu: 55, ram: 60, temp: 45 },
  { id: '8', name: 'Wifi-AP-Conf', ip: '10.0.50.11', mac: '00:1A:2B:3C:4D:65', type: DeviceType.ACCESS_POINT, status: DeviceStatus.OFFLINE, uptime: '0d 0h', location: 'Conf Room B', lastSeen: '2h ago', cpu: 0, ram: 0, temp: 0 },
];

const INITIAL_HOTSPOT_USERS: HotspotUser[] = [
    { id: '1', username: 'guest_01', profile: 'Guest', status: 'Active', ip: '10.0.50.101', mac: 'AA:BB:CC:11:22:33', uptime: '2h 15m', download: 120, upload: 15, quota: 500 },
    { id: '2', username: 'guest_02', profile: 'Guest', status: 'Active', ip: '10.0.50.102', mac: 'AA:BB:CC:11:22:34', uptime: '45m', download: 45, upload: 5, quota: 500 },
    { id: '3', username: 'employee_jane', profile: 'Employee', status: 'Active', ip: '10.0.50.201', mac: 'AA:BB:CC:11:22:35', uptime: '4d 2h', download: 2400, upload: 800, quota: 99999 },
    { id: '4', username: 'guest_03', profile: 'Guest', status: 'Expired', ip: '10.0.50.103', mac: 'AA:BB:CC:11:22:36', uptime: '0m', download: 499, upload: 50, quota: 500 },
];

const INITIAL_ADMINS: AdminUser[] = [
    { id: '1', name: 'Super Admin', email: 'admin@netguardian.io', role: 'Super Admin', lastLogin: 'Just now', status: 'Active', twoFactor: true },
    { id: '2', name: 'NOC Operator 1', email: 'noc1@netguardian.io', role: 'NOC Operator', lastLogin: '2 hours ago', status: 'Active', twoFactor: true },
    { id: '3', name: 'Junior Tech', email: 'tech@netguardian.io', role: 'Viewer', lastLogin: 'Yesterday', status: 'Active', twoFactor: false },
    { id: '4', name: 'Former Employee', email: 'audit@netguardian.io', role: 'Network Admin', lastLogin: '30 days ago', status: 'Locked', twoFactor: false },
];

const INITIAL_BACKUPS: BackupFile[] = [
    { id: '1', deviceId: '1', deviceName: 'Core-Router-01', filename: 'core-r1-20231027.cfg', size: '12 KB', date: 'Oct 27, 2023 02:00', type: 'Auto' },
    { id: '2', deviceId: '1', deviceName: 'Core-Router-01', filename: 'core-r1-20231026.cfg', size: '12 KB', date: 'Oct 26, 2023 02:00', type: 'Auto' },
    { id: '3', deviceId: '2', deviceName: 'Dist-Switch-A', filename: 'dist-sw-a-pre-upgrade.cfg', size: '8 KB', date: 'Oct 25, 2023 14:30', type: 'Manual' },
];

const INITIAL_TASKS: AutomationTask[] = [
    { id: '1', name: 'Daily Config Backup', type: 'BACKUP', targetGroup: 'All Routers', schedule: '0 2 * * *', lastRun: 'Today, 02:00 AM', status: 'SUCCESS', nextRun: 'Tomorrow, 02:00 AM' },
    { id: '2', name: 'Check Firmware Compliance', type: 'COMPLIANCE', targetGroup: 'Switches', schedule: '0 5 * * MON', lastRun: 'Mon, 05:00 AM', status: 'FAILED', nextRun: 'Next Mon, 05:00 AM' },
    { id: '3', name: 'Update Security Signatures', type: 'FIRMWARE', targetGroup: 'Firewalls', schedule: 'Every 4 Hours', lastRun: 'Today, 08:00 AM', status: 'SUCCESS', nextRun: 'Today, 12:00 PM' },
    { id: '4', name: 'Reboot Guest Wifi APs', type: 'SCRIPT', targetGroup: 'Access Points', schedule: '0 3 * * SUN', lastRun: 'Sun, 03:00 AM', status: 'SUCCESS', nextRun: 'Next Sun, 03:00 AM' },
];

const INITIAL_FW_RULES: FirewallRule[] = [
  { id: '1', sequence: 10, action: 'ALLOW', protocol: 'TCP', source: '10.0.0.0/24', destination: 'ANY', port: '80, 443', description: 'Allow Web Traffic Outbound' },
  { id: '2', sequence: 20, action: 'ALLOW', protocol: 'TCP', source: '10.0.50.0/23', destination: '10.0.10.5', port: '3306', description: 'Allow App to DB' },
  { id: '3', sequence: 30, action: 'DENY', protocol: 'ANY', source: 'ANY', destination: 'ANY', port: 'ANY', description: 'Implicit Deny' },
];

const INITIAL_THREATS: SecurityEvent[] = [
    { id: '1', type: 'Brute Force', sourceIp: '192.168.100.45', targetIp: '10.0.0.1 (Core)', location: 'Internal', severity: 'High', status: 'Blocked', timestamp: '10:45:00' },
    { id: '2', type: 'Port Scan', sourceIp: '45.33.22.11', targetIp: '10.0.0.254 (FW)', location: 'Russia', severity: 'Medium', status: 'Blocked', timestamp: '10:42:15' },
    { id: '3', type: 'DDoS', sourceIp: 'Unknown (Botnet)', targetIp: '10.0.10.5 (Web)', location: 'Global', severity: 'Critical', status: 'Detected', timestamp: '10:30:00' },
];

const MOCK_ALERTS: Alert[] = [
  { id: '1', severity: 'critical', message: 'Wifi-AP-Conf is unresponsive (timeout)', timestamp: '10:42 AM', deviceId: '8' },
  { id: '2', severity: 'warning', message: 'Dist-Switch-B high CPU utilization (85%)', timestamp: '09:15 AM', deviceId: '3' },
  { id: '3', severity: 'info', message: 'Scheduled backup completed for Core-Router-01', timestamp: '03:00 AM', deviceId: '1' },
];

// -- Components --

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'topology' | 'ai' | 'config' | 'logs' | 'tools' | 'settings' | 'ipam' | 'firewall' | 'reports' | 'ports' | 'automation' | 'terminal' | 'dvr' | 'hotspot' | 'access' | 'backup' | 'security'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedConfigDevice, setSelectedConfigDevice] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // -- GLOBAL STATE --
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [hotspotUsers, setHotspotUsers] = useState<HotspotUser[]>(INITIAL_HOTSPOT_USERS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [backups, setBackups] = useState<BackupFile[]>(INITIAL_BACKUPS);
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>(INITIAL_TASKS);
  const [fwRules, setFwRules] = useState<FirewallRule[]>(INITIAL_FW_RULES);
  const [threats, setThreats] = useState<SecurityEvent[]>(INITIAL_THREATS);

  // Command Palette State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Responsive sidebar check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts for Command Palette
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setIsPaletteOpen(true);
          }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfigureDevice = (deviceId: string) => {
    setSelectedConfigDevice(deviceId);
    setActiveTab('config');
  };

  const handleUpdateConfig = (deviceId: string, newConfig: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, config: newConfig } : d));
  };

  const handleAddDevice = (device: Device) => {
      setDevices([...devices, device]);
  };

  const handleDeleteDevice = (id: string) => {
      if(confirm("Are you sure you want to remove this device?")) {
        setDevices(devices.filter(d => d.id !== id));
      }
  };
  
  const handleNavigate = (tab: string) => {
      setActiveTab(tab as any);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        setIsFullScreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    }
  };

  const MOCK_TOPOLOGY: NetworkData = {
    nodes: devices.map(d => ({ 
      id: d.name, 
      group: d.type === DeviceType.ROUTER ? 1 : 2, 
      type: d.type,
      status: d.status
    })),
    links: [
      { source: 'Core-Router-01', target: 'Firewall-Main', value: 5 },
      { source: 'Core-Router-01', target: 'Dist-Switch-A', value: 3 },
      { source: 'Core-Router-01', target: 'Dist-Switch-B', value: 3 },
      { source: 'Dist-Switch-A', target: 'Web-Server-01', value: 1 },
      { source: 'Dist-Switch-A', target: 'DB-Server-01', value: 1 },
      { source: 'Dist-Switch-B', target: 'Wifi-AP-Lobby', value: 1 },
      { source: 'Dist-Switch-B', target: 'Wifi-AP-Conf', value: 1 },
    ].filter(l => 
        // Filter links if devices are deleted
        devices.some(d => d.name === l.source) && devices.some(d => d.name === l.target)
    )
  };

  if (!isLoggedIn) {
      return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Helper to determine if a tab scrolls or is fixed height
  const isScrollableTab = (tab: string) => {
      return ['dashboard', 'reports', 'settings'].includes(tab);
  };

  return (
    // Changed: `min-h-screen` to `h-screen` to force fixed height on viewport
    <div className="h-screen bg-slate-900 text-slate-100 font-sans flex overflow-hidden">
      
      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onNavigate={handleNavigate}
        devices={devices}
      />

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 border-r border-slate-800 flex-shrink-0 transition-all duration-300 flex flex-col fixed lg:relative z-20 h-full`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg mr-3 flex items-center justify-center shadow-lg">
             <Network className="text-white" size={20}/>
          </div>
          <span className="font-bold text-lg tracking-tight">NetGuardian</span>
        </div>

        {/* Sidebar Navigation: Added min-h-0 to ensure flex shrinking and scrolling work properly */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto min-h-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Overview</div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Server} label="Inventory" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
          <SidebarItem icon={Network} label="Topology Map" active={activeTab === 'topology'} onClick={() => setActiveTab('topology')} />
          <SidebarItem icon={Cable} label="Port Mapper" active={activeTab === 'ports'} onClick={() => setActiveTab('ports')} />
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Management</div>
          <SidebarItem icon={Terminal} label="Web CLI" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
          <SidebarItem icon={Wifi} label="Hotspot Manager" active={activeTab === 'hotspot'} onClick={() => setActiveTab('hotspot')} />
          <SidebarItem icon={Database} label="IPAM" active={activeTab === 'ipam'} onClick={() => setActiveTab('ipam')} />
          <SidebarItem icon={FileCode} label="Configuration" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
          <SidebarItem icon={Archive} label="Backup & Restore" active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} />
          <SidebarItem icon={Clock} label="Automation" active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} />
          <SidebarItem icon={Wrench} label="Tools" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Intelligence</div>
          <SidebarItem icon={Shield} label="Security Center" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
          <SidebarItem icon={Rewind} label="Network DVR" active={activeTab === 'dvr'} onClick={() => setActiveTab('dvr')} />
          <SidebarItem icon={FileText} label="System Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <SidebarItem icon={PieChart} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarItem icon={MessageSquare} label="AI Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">System</div>
          <SidebarItem icon={Lock} label="Access Control" active={activeTab === 'access'} onClick={() => setActiveTab('access')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>

        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@netguardian.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 lg:hidden">
               <Menu size={20} />
             </button>
             <h1 className="font-semibold text-lg text-slate-100 capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 text-sm px-4 py-1.5 rounded-lg hover:border-slate-600 hover:text-slate-300 transition-all"
            >
              <Search size={14} />
              <span>Type a command...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-700 rounded-md">Ctrl K</kbd>
            </button>
            <button 
              onClick={toggleFullScreen}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 bg-slate-950 overflow-hidden flex flex-col min-h-0">
          
          {isScrollableTab(activeTab) ? (
              // Scrollable Document View (Dashboard, Reports, Settings)
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'dashboard' && <Dashboard devices={devices} alerts={MOCK_ALERTS} />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'settings' && <SettingsPage />}
              </div>
          ) : (
              // Fixed App View (Apps that manage their own scroll/layout)
              <div className="flex-1 p-6 h-full flex flex-col overflow-hidden">
                {activeTab === 'devices' && (
                    <DeviceList 
                        devices={devices} 
                        onConfigure={handleConfigureDevice} 
                        onAddDevice={handleAddDevice}
                        onDeleteDevice={handleDeleteDevice}
                    />
                )}
                {activeTab === 'topology' && <TopologyMap data={MOCK_TOPOLOGY} onNavigate={handleNavigate} />}
                {activeTab === 'ipam' && <Ipam />}
                {activeTab === 'config' && (
                    <ConfigManager 
                        devices={devices} 
                        selectedDeviceId={selectedConfigDevice} 
                        onUpdateConfig={handleUpdateConfig} 
                    />
                )}
                {activeTab === 'firewall' && <FirewallBuilder rules={fwRules} setRules={setFwRules} />}
                {activeTab === 'tools' && <NetworkTools />}
                {activeTab === 'logs' && <LogViewer />}
                {activeTab === 'ai' && <AiAssistant devices={devices} alerts={MOCK_ALERTS} />}
                {activeTab === 'ports' && <PortManager />}
                {activeTab === 'automation' && <Automation tasks={automationTasks} setTasks={setAutomationTasks} />}
                {activeTab === 'terminal' && <WebTerminal />}
                {activeTab === 'dvr' && <NetworkDVR devices={devices} />}
                {activeTab === 'hotspot' && <HotspotManager users={hotspotUsers} setUsers={setHotspotUsers} />}
                {activeTab === 'access' && <AccessControl users={adminUsers} setUsers={setAdminUsers} />}
                {activeTab === 'backup' && <BackupManager backups={backups} setBackups={setBackups} />}
                {activeTab === 'security' && <SecurityMonitor threats={threats} setThreats={setThreats} />}
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;