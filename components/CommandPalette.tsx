import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Terminal, FileText, Settings, LayoutDashboard, Network, Server, ArrowRight } from 'lucide-react';
import { Device } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  devices: Device[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, devices }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navigationItems = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, type: 'NAV' },
    { id: 'devices', label: 'Go to Device Inventory', icon: Server, type: 'NAV' },
    { id: 'topology', label: 'Go to Topology Map', icon: Network, type: 'NAV' },
    { id: 'terminal', label: 'Open Web Terminal', icon: Terminal, type: 'NAV' },
    { id: 'logs', label: 'View System Logs', icon: FileText, type: 'NAV' },
    { id: 'settings', label: 'Open Settings', icon: Settings, type: 'NAV' },
  ];

  const deviceItems = devices.map(d => ({
    id: `device-${d.id}`,
    label: `Configure ${d.name} (${d.ip})`,
    icon: Monitor,
    type: 'DEVICE',
    deviceId: d.id
  }));

  const filteredItems = [...navigationItems, ...deviceItems].filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Limit to 8 items

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: any) => {
    if (!item) return;
    if (item.type === 'NAV') {
      onNavigate(item.id);
    } else if (item.type === 'DEVICE') {
      onNavigate('config'); // Or handle specific device selection context if app supports it
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <Search className="text-slate-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
             <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">ESC</span>
          </div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
           {filteredItems.length > 0 ? (
             <div className="space-y-1">
               {filteredItems.map((item, index) => (
                 <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                 >
                    <div className="flex items-center gap-3">
                        <item.icon size={18} className={index === selectedIndex ? 'text-white' : 'text-slate-500'} />
                        <span className="font-medium">{item.label}</span>
                    </div>
                    {index === selectedIndex && <ArrowRight size={16} />}
                 </button>
               ))}
             </div>
           ) : (
             <div className="p-8 text-center text-slate-500">
               No results found for "{query}"
             </div>
           )}
        </div>
        
        <div className="p-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex justify-between px-4">
            <span>ProTip: Use arrow keys to navigate</span>
            <span>NetTans Command Line</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;