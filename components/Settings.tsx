import React, { useState } from 'react';
import { Bell, Shield, Moon, User, Lock, Mail, Globe, Save, Server, Link } from 'lucide-react';

const SettingsSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
        <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

const Toggle = ({ label, desc, checked }: any) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="text-sm font-medium text-slate-200">{label}</div>
            <div className="text-xs text-slate-500 mt-1">{desc}</div>
        </div>
        <button className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-primary-600' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${checked ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

const Settings: React.FC = () => {
  const [middlewareUrl, setMiddlewareUrl] = useState('http://localhost:3001');

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-2xl font-bold text-white mb-6">Settings & Preferences</h2>
      
      <SettingsSection title="Profile & Account" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" defaultValue="Admin User" className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" defaultValue="admin@nettans.io" className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" />
                  </div>
              </div>
          </div>
      </SettingsSection>

      <SettingsSection title="Backend Connection" icon={Server}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Node.js Middleware URL</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        value={middlewareUrl} 
                        onChange={(e) => setMiddlewareUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none" 
                    />
                </div>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600">Test Connection</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                This URL connects to the `server.js` running node-routeros to communicate with MikroTik devices via API (Port 8728).
            </p>
          </div>
      </SettingsSection>

      <SettingsSection title="Appearance & Notifications" icon={Bell}>
          <div className="space-y-6">
              <Toggle label="Email Notifications" desc="Receive alerts for Critical severity events" checked={true} />
              <Toggle label="Push Notifications" desc="Browser notifications for real-time alerts" checked={false} />
              <div className="h-px bg-slate-700"></div>
              <Toggle label="Dark Mode" desc="Forced dark mode for system interface" checked={true} />
              <Toggle label="Compact View" desc="Reduce padding in tables and lists" checked={false} />
          </div>
      </SettingsSection>

      <SettingsSection title="Security & API" icon={Lock}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Gemini API Key</label>
            <div className="flex gap-2">
                <input type="password" value="************************" readOnly className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-500" />
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600">Change</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Used for AI Assistant and Configuration Auditing.</p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700">
             <Toggle label="Two-Factor Authentication" desc="Require OTP code during login" checked={true} />
          </div>
      </SettingsSection>

      <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">Cancel</button>
          <button className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-lg flex items-center gap-2">
              <Save size={18} /> Save Changes
          </button>
      </div>
    </div>
  );
};

export default Settings;