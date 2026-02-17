import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  WARNING = 'WARNING',
  MAINTENANCE = 'MAINTENANCE'
}

export enum DeviceType {
  ROUTER = 'ROUTER',
  SWITCH = 'SWITCH',
  SERVER = 'SERVER',
  ACCESS_POINT = 'ACCESS_POINT',
  FIREWALL = 'FIREWALL',
  WORKSTATION = 'WORKSTATION',
  OLT = 'OLT' // Added for ISP
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: DeviceType;
  status: DeviceStatus;
  uptime: string;
  location: string;
  lastSeen: string;
  config?: string;
  cpu: number; // Real-time CPU %
  ram: number; // Real-time RAM %
  temp: number; // Temperature
  // Credentials for API
  apiUser?: string;
  apiPort?: number;
}

export interface RouterOSResource {
  uptime: string;
  version: string;
  "cpu-load": string;
  "total-memory": string;
  "free-memory": string;
  "board-name": string;
}

export interface RouterOSInterface {
  name: string;
  type: string;
  mtu: string;
  "mac-address": string;
  running: string;
  disabled: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  deviceId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
  process?: string;
}

export interface Subnet {
  id: string;
  name: string;
  network: string;
  cidr: number;
  gateway: string;
  vlan: number;
  usage: number; 
  totalIps: number;
  usedIps: number;
  location: string;
}

export interface FirewallRule {
  id: string;
  sequence: number;
  action: 'ALLOW' | 'DENY';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY';
  source: string;
  destination: string;
  port: string;
  description: string;
}

export interface SwitchPort {
  id: number;
  name: string;
  status: 'UP' | 'DOWN' | 'ERR_DISABLE' | 'ADMIN_DOWN';
  speed: '100M' | '1G' | '10G';
  duplex: 'Full' | 'Half';
  vlan: number;
  poe: boolean;
  neighbor?: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: 'BACKUP' | 'SCRIPT' | 'FIRMWARE' | 'COMPLIANCE';
  targetGroup: string;
  schedule: string;
  lastRun: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RUNNING';
  nextRun: string;
}

export interface TerminalSession {
  id: string;
  deviceId: string;
  deviceName: string;
  history: string[];
}

export interface NetworkNode extends SimulationNodeDatum {
  id: string;
  group: number;
  type: DeviceType;
  status: DeviceStatus;
}

export interface NetworkLink extends SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface NetworkSnapshot {
  timestamp: number;
  timeLabel: string;
  trafficLoad: number;
  activeAlerts: number;
  deviceStates: Record<string, DeviceStatus>;
  logs: LogEntry[];
}

export interface HotspotUser {
  id: string;
  username: string;
  profile: 'Guest' | 'Employee' | 'VIP';
  status: 'Active' | 'Expired' | 'Suspended';
  ip: string;
  mac: string;
  uptime: string;
  download: number; // MB
  upload: number; // MB
  quota: number; // MB
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Network Admin' | 'NOC Operator' | 'Viewer';
  lastLogin: string;
  status: 'Active' | 'Locked';
  twoFactor: boolean;
}

export interface BackupFile {
  id: string;
  deviceId: string;
  deviceName: string;
  filename: string;
  size: string;
  date: string;
  type: 'Auto' | 'Manual';
}

export interface SecurityEvent {
  id: string;
  type: 'DDoS' | 'Brute Force' | 'Malware' | 'Port Scan';
  sourceIp: string;
  targetIp: string;
  location: string; // GeoIP
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Blocked' | 'Detected';
  timestamp: string;
}

// --- ISP Specific Types ---

export interface Subscriber {
  id: string;
  name: string;
  accountNumber: string;
  serviceType: 'PPPoE' | 'Static IP' | 'Hotspot';
  planName: string;
  status: 'Active' | 'Suspended' | 'Installation';
  ip: string;
  mac: string;
  address: string;
  balance: number;
  monthlyFee: number;
  signalStrength?: string; // e.g., -20dBm for fiber
}

export interface BandwidthPlan {
  id: string;
  name: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  price: number;
  subscribers: number;
}

export interface OnuDevice {
  id: string;
  serialNumber: string;
  name: string;
  oltPort: string; // e.g., PON 1/2
  signalRx: number; // dBm
  distance: number; // meters
  status: 'Online' | 'Offline' | 'Power Fail';
  linkedSubscriberId?: string;
}

export interface SupportTicket {
  id: string;
  subscriberId?: string;
  subscriberName: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'No Internet' | 'Slow Connection' | 'Billing' | 'Installation';
  created: string;
  assignedTo?: string;
  messages: { sender: string; text: string; time: string }[];
}

export interface Invoice {
  id: string;
  subscriberId: string;
  subscriberName: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';
  dueDate: string;
  issueDate: string;
  items: string[]; // Simple description e.g., "Internet Oct 2023"
}