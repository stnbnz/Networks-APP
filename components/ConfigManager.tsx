import React, { useState, useEffect, useMemo } from 'react';
import { Device, DeviceType } from '../types';
import { Save, RotateCcw, ShieldCheck, Terminal, CheckCircle, AlertTriangle, Play, FileCode, Loader2, Layers, CheckSquare, Square, XCircle, Variable, Eye, AlertOctagon, Wand2 } from 'lucide-react';
import { auditConfiguration } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ConfigManagerProps {
  devices: Device[];
  selectedDeviceId?: string | null;
  onUpdateConfig: (deviceId: string, newConfig: string) => void;
}

type DeploymentStatus = 'IDLE' | 'PENDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILURE';

// Interface for Bulk Variables
interface DeviceVariables {
  [key: string]: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ devices, selectedDeviceId, onUpdateConfig }) => {
  // Mode: SINGLE or BULK
  const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

  // --- Single Mode State ---
  const [activeDevice, setActiveDevice] = useState<Device | undefined>(
    devices.find(d => d.id === selectedDeviceId) || devices[0]
  );
  const [editorContent, setEditorContent] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  // --- Bulk Mode State ---
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [bulkStep, setBulkStep] = useState<'TEMPLATE' | 'VARIABLES' | 'PREVIEW'>('TEMPLATE');
  const [templateContent, setTemplateContent] = useState<string>(
    `hostname {{hostname}}
!
interface GigabitEthernet0/1
 description LAN Uplink
 ip address {{ip}} 255.255.255.0
 no shutdown
!
ntp server 1.pool.ntp.org`
  );
  
  // Stores variables for each device ID: { "dev1": { hostname: "R1", ip: "1.1.1.1" } }
  const [variableMap, setVariableMap] = useState<Record<string, DeviceVariables>>({});
  const [bulkStatus, setBulkStatus] = useState<Record<string, DeploymentStatus>>({});
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState<string[]>([]);

  // Sync Single Mode Device
  useEffect(() => {
    if (selectedDeviceId && mode === 'SINGLE') {
      const dev = devices.find(d => d.id === selectedDeviceId);
      if (dev) setActiveDevice(dev);
    }
  }, [selectedDeviceId, devices, mode]);

  useEffect(() => {
    if (activeDevice && mode === 'SINGLE') {
      setEditorContent(activeDevice.config || '# No configuration loaded');
      setLogs([`> Connected to ${activeDevice.name} (${activeDevice.ip})...`, '> Session established.']);
      setAuditResult(null);
    }
  }, [activeDevice, mode]);

  // Initialize variables when devices are selected in Bulk Mode
  useEffect(() => {
    const newVarMap = { ...variableMap };
    let hasChanges = false;
    
    selectedBulkIds.forEach(id => {
        if (!newVarMap[id]) {
            const dev = devices.find(d => d.id === id);
            newVarMap[id] = {
                hostname: dev?.name || `Device-${id}`,
                ip: dev?.ip || '0.0.0.0',
                vlan: '1'
            };
            hasChanges = true;
        }
    });
    
    if (hasChanges) setVariableMap(newVarMap);
  }, [selectedBulkIds, devices]);

  // --- Helpers ---
  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  // --- Single Mode Handlers ---
  const handleDeploy = () => {
    if (!activeDevice) return;
    setIsDeploying(true);
    addLog('Initiating deployment sequence...');
    setTimeout(() => {
      addLog('Pushing config to startup-config...');
      onUpdateConfig(activeDevice.id, editorContent);
      addLog('Success: Configuration applied and saved.');
      setIsDeploying(false);
    }, 1500);
  };

  const handleAudit = async () => {
    if (!activeDevice) return;
    setIsAuditing(true);
    setAuditResult(null);
    addLog('Sending configuration to AI Audit Engine...');
    try {
      const result = await auditConfiguration(editorContent);
      setAuditResult(result);
      addLog('Audit complete.');
    } catch (e) {
      addLog('Error: Audit failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  // --- Bulk Mode Handlers ---
  const toggleBulkSelection = (id: string) => {
      if (selectedBulkIds.includes(id)) {
          setSelectedBulkIds(prev => prev.filter(i => i !== id));
      } else {
          setSelectedBulkIds(prev => [...prev, id]);
      }
  };

  const toggleSelectAll = () => {
      setSelectedBulkIds(selectedBulkIds.length === devices.length ? [] : devices.map(d => d.id));
  };

  // Logic to resolve template {{key}} -> value
  const resolveTemplate = (template: string, vars: DeviceVariables) => {
      return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `<<MISSING:${key}>>`);
  };

  // Extract keys from template
  const getTemplateKeys = () => {
      const matches = templateContent.matchAll(/\{\{(\w+)\}\}/g);
      return Array.from(new Set(Array.from(matches).map(m => m[1])));
  };

  const handleAutoFill = (key: string) => {
      const newMap = { ...variableMap };
      let counter = 10;
      selectedBulkIds.forEach((id, idx) => {
          if (key === 'ip') {
              newMap[id][key] = `192.168.10.${counter + idx}`;
          } else if (key === 'hostname') {
              const dev = devices.find(d => d.id === id);
              newMap[id][key] = dev?.name || `Device-${idx}`;
          } else {
              newMap[id][key] = '10'; // Default value
          }
      });
      setVariableMap(newMap);
  };

  const validateConflicts = () => {
      const usedIPs = new Set();
      const usedHostnames = new Set();
      const conflicts: string[] = [];

      selectedBulkIds.forEach(id => {
          const vars = variableMap[id];
          const devName = devices.find(d => d.id === id)?.name || id;

          if (usedIPs.has(vars.ip)) conflicts.push(`Duplicate IP Address: ${vars.ip} (Device: ${devName})`);
          usedIPs.add(vars.ip);

          if (usedHostnames.has(vars.hostname)) conflicts.push(`Duplicate Hostname: ${vars.hostname} (Device: ${devName})`);
          usedHostnames.add(vars.hostname);

          // Check for missing variables
          getTemplateKeys().forEach(key => {
              if (!vars[key]) conflicts.push(`Missing variable '${key}' for device ${devName}`);
          });
      });

      setDetectedConflicts(conflicts);
      return conflicts.length === 0;
  };

  const handleBulkDeploy = async () => {
      if (!validateConflicts()) {
          setBulkStep('PREVIEW'); // Force user to see errors
          return;
      }
      
      setIsBulkRunning(true);
      const initialStatus: Record<string, DeploymentStatus> = {};
      selectedBulkIds.forEach(id => initialStatus[id] = 'PENDING');
      setBulkStatus(initialStatus);

      for (const id of selectedBulkIds) {
          setBulkStatus(prev => ({ ...prev, [id]: 'DEPLOYING' }));
          await new Promise(r => setTimeout(r, 600)); // Delay
          
          const resolvedConfig = resolveTemplate(templateContent, variableMap[id]);
          
          // 90% Success rate simulation
          if (Math.random() > 0.1) {
              setBulkStatus(prev => ({ ...prev, [id]: 'SUCCESS' }));
              onUpdateConfig(id, resolvedConfig);
          } else {
              setBulkStatus(prev => ({ ...prev, [id]: 'FAILURE' }));
          }
      }
      setIsBulkRunning(false);
  };

  if (!devices.length) return <div className="p-8 text-center text-slate-500">No devices available.</div>;

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar - Device Selection */}
      <div className="w-72 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden transition-all duration-300">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 mb-4">
              <button 
                onClick={() => setMode('SINGLE')} 
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'SINGLE' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                  <Terminal size={14}/> Single
              </button>
              <button 
                onClick={() => setMode('BULK')} 
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'BULK' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                  <Layers size={14}/> Mass Config
              </button>
          </div>
          
          {mode === 'BULK' && (
              <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">{selectedBulkIds.length} Selected</span>
                  <button onClick={toggleSelectAll} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                      {selectedBulkIds.length === devices.length ? <CheckSquare size={14}/> : <Square size={14}/>}
                      {selectedBulkIds.length === devices.length ? 'Deselect All' : 'Select All'}
                  </button>
              </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {devices.map(dev => (
            mode === 'SINGLE' ? (
                <button
                key={dev.id}
                onClick={() => setActiveDevice(dev)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    activeDevice?.id === dev.id 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                }`}
                >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${dev.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{dev.name}</span>
                </div>
                </button>
            ) : (
                <div 
                    key={dev.id}
                    onClick={() => toggleBulkSelection(dev.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer border ${
                        selectedBulkIds.includes(dev.id)
                        ? 'bg-purple-600/20 border-purple-500/50' 
                        : 'bg-slate-800/50 border-transparent hover:bg-slate-700/50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedBulkIds.includes(dev.id) ? 'bg-purple-600 border-purple-600' : 'border-slate-500'}`}>
                             {selectedBulkIds.includes(dev.id) && <CheckSquare size={10} className="text-white"/>}
                        </div>
                        <span className={`font-medium ${selectedBulkIds.includes(dev.id) ? 'text-white' : 'text-slate-400'}`}>{dev.name}</span>
                    </div>
                    {/* Status Indicator for Bulk Run */}
                    {(isBulkRunning || bulkStatus[dev.id]) ? (
                        <div className="text-xs">
                            {bulkStatus[dev.id] === 'PENDING' && <span className="text-slate-500">Wait</span>}
                            {bulkStatus[dev.id] === 'DEPLOYING' && <Loader2 size={14} className="animate-spin text-blue-400"/>}
                            {bulkStatus[dev.id] === 'SUCCESS' && <CheckCircle size={14} className="text-green-500"/>}
                            {bulkStatus[dev.id] === 'FAILURE' && <XCircle size={14} className="text-red-500"/>}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-600">{dev.ip}</span>
                    )}
                </div>
            )
          ))}
        </div>
      </div>

      {/* Main Area */}
      {mode === 'SINGLE' && activeDevice ? (
          <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
            {/* Single Mode Toolbar */}
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-4">
                <div>
                <h2 className="text-lg font-bold text-white">{activeDevice.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{activeDevice.ip} • {activeDevice.type}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                onClick={handleAudit}
                disabled={isAuditing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                {isAuditing ? <Loader2 size={18} className="animate-spin"/> : <ShieldCheck size={18} />}
                AI Audit
                </button>
                <button 
                onClick={() => setEditorContent(activeDevice.config || '')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium border border-slate-600"
                >
                <RotateCcw size={18} />
                Reset
                </button>
                <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-900/20 disabled:opacity-50"
                >
                {isDeploying ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                Deploy Config
                </button>
            </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
            {/* Editor */}
            <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">running-config</span>
                <span className="text-xs text-slate-500 font-mono">UTF-8</span>
                </div>
                <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="flex-1 w-full bg-slate-900 text-green-400 font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed selection:bg-slate-700"
                spellCheck={false}
                />
                
                {/* Terminal Logs */}
                <div className="h-32 bg-slate-950 border-t border-slate-800 p-3 overflow-y-auto font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-500 mb-2 sticky top-0 bg-slate-950 pb-2 border-b border-slate-800/50">
                    <Terminal size={12} />
                    <span className="uppercase tracking-wider">Console Output</span>
                </div>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                    <div key={i} className="text-slate-300">{log}</div>
                    ))}
                    {isDeploying && <div className="text-green-500 animate-pulse">_</div>}
                </div>
                </div>
            </div>

            {/* Audit Result Panel */}
            {auditResult && (
                <div className="w-80 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-xl animate-in slide-in-from-right-10 duration-300">
                <div className="p-4 bg-indigo-900/20 border-b border-indigo-500/20">
                    <h3 className="font-semibold text-indigo-300 flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Audit Findings
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-300 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{auditResult}</ReactMarkdown>
                </div>
                </div>
            )}
            </div>
          </div>
      ) : (
          <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
               {/* Bulk Wizard Header */}
               <div className="bg-gradient-to-r from-purple-900/80 to-slate-800 p-6 rounded-xl border border-purple-500/30 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-purple-400"/> Mass Configuration Wizard
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 max-w-xl">
                            Deploy configuration templates to multiple devices with variable injection. Checks for IP conflicts and syntax errors before deployment.
                        </p>
                    </div>
                    
                    {/* Steps Indicator */}
                    <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                        <button onClick={() => setBulkStep('TEMPLATE')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${bulkStep === 'TEMPLATE' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>1. Template</button>
                        <button onClick={() => setBulkStep('VARIABLES')} disabled={selectedBulkIds.length === 0} className={`px-4 py-2 rounded text-xs font-bold transition-all ${bulkStep === 'VARIABLES' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>2. Variables</button>
                        <button onClick={() => { setBulkStep('PREVIEW'); validateConflicts(); }} disabled={selectedBulkIds.length === 0} className={`px-4 py-2 rounded text-xs font-bold transition-all ${bulkStep === 'PREVIEW' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>3. Verify & Deploy</button>
                    </div>
               </div>

               <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner flex flex-col">
                   {/* STEP 1: TEMPLATE EDITOR */}
                   {bulkStep === 'TEMPLATE' && (
                       <>
                            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                <span className="text-xs text-purple-400 font-bold uppercase flex items-center gap-2"><FileCode size={14}/> Template Editor (Jinja-style)</span>
                                <div className="text-xs text-slate-500">Use {'{{variable}}'} for dynamic values</div>
                            </div>
                            <textarea
                                value={templateContent}
                                onChange={(e) => setTemplateContent(e.target.value)}
                                className="flex-1 w-full bg-slate-900 text-purple-200 font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed selection:bg-purple-900/30 placeholder-slate-700"
                                spellCheck={false}
                                placeholder="Enter configuration template..."
                            />
                       </>
                   )}

                   {/* STEP 2: VARIABLE TABLE */}
                   {bulkStep === 'VARIABLES' && (
                       <div className="flex-1 flex flex-col">
                           <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                                <span className="text-xs text-purple-400 font-bold uppercase flex items-center gap-2"><Variable size={14}/> Variable Mapping</span>
                                <div className="flex gap-2">
                                    {getTemplateKeys().map(key => (
                                        <button 
                                            key={key} 
                                            onClick={() => handleAutoFill(key)} 
                                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 flex items-center gap-1"
                                        >
                                            <Wand2 size={12}/> Autofill {key}
                                        </button>
                                    ))}
                                </div>
                           </div>
                           <div className="flex-1 overflow-auto p-0">
                               <table className="w-full text-left border-collapse text-sm">
                                   <thead className="bg-slate-900 sticky top-0 z-10">
                                       <tr>
                                           <th className="p-3 text-slate-400 border-b border-slate-700 font-medium w-40">Device</th>
                                           {getTemplateKeys().map(key => (
                                               <th key={key} className="p-3 text-slate-400 border-b border-slate-700 font-medium font-mono text-xs">{`{{${key}}}`}</th>
                                           ))}
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {selectedBulkIds.map(id => {
                                           const devName = devices.find(d => d.id === id)?.name;
                                           return (
                                               <tr key={id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                                   <td className="p-3 text-slate-300 font-medium">{devName}</td>
                                                   {getTemplateKeys().map(key => (
                                                       <td key={key} className="p-2">
                                                           <input 
                                                               type="text" 
                                                               value={variableMap[id]?.[key] || ''}
                                                               onChange={(e) => setVariableMap({
                                                                   ...variableMap,
                                                                   [id]: { ...variableMap[id], [key]: e.target.value }
                                                               })}
                                                               className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                                           />
                                                       </td>
                                                   ))}
                                               </tr>
                                           );
                                       })}
                                   </tbody>
                               </table>
                           </div>
                       </div>
                   )}

                   {/* STEP 3: PREVIEW & DEPLOY */}
                   {bulkStep === 'PREVIEW' && (
                       <div className="flex-1 flex flex-col">
                           <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                                <span className="text-xs text-purple-400 font-bold uppercase flex items-center gap-2"><Eye size={14}/> Preview & Validation</span>
                           </div>
                           
                           {/* Conflict Report */}
                           {detectedConflicts.length > 0 ? (
                               <div className="p-4 bg-red-900/10 border-b border-red-900/30">
                                   <h4 className="text-red-400 font-bold text-sm flex items-center gap-2 mb-2">
                                       <AlertOctagon size={16}/> Conflicts Detected
                                   </h4>
                                   <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                                       {detectedConflicts.map((c, i) => <li key={i}>{c}</li>)}
                                   </ul>
                               </div>
                           ) : (
                               <div className="p-3 bg-green-900/10 border-b border-green-900/30 text-green-400 text-xs font-bold flex items-center gap-2">
                                   <CheckCircle size={16}/> Validation Passed: No IP or Hostname conflicts detected.
                               </div>
                           )}

                           <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                               {selectedBulkIds.slice(0, 4).map(id => (
                                   <div key={id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                                       <div className="text-xs text-slate-500 mb-2 font-bold">{devices.find(d => d.id === id)?.name}</div>
                                       <pre className="text-[10px] text-purple-200 font-mono whitespace-pre-wrap">
                                           {resolveTemplate(templateContent, variableMap[id] || {})}
                                       </pre>
                                   </div>
                               ))}
                               {selectedBulkIds.length > 4 && <div className="text-center text-slate-500 text-xs italic p-4">...and {selectedBulkIds.length - 4} more devices</div>}
                           </div>
                           
                           <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                                <button 
                                    onClick={handleBulkDeploy}
                                    disabled={isBulkRunning || detectedConflicts.length > 0}
                                    className="flex items-center gap-3 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-xl shadow-purple-900/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBulkRunning ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin"/>
                                            Deploying...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} fill="currentColor"/>
                                            Confirm & Deploy
                                        </>
                                    )}
                                </button>
                           </div>
                       </div>
                   )}
               </div>

               {/* Step Navigation Footer */}
               {bulkStep !== 'PREVIEW' && (
                    <div className="flex justify-end pt-4">
                         {bulkStep === 'TEMPLATE' && (
                             <button onClick={() => setBulkStep('VARIABLES')} disabled={selectedBulkIds.length === 0} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
                                 Next: Variables &rarr;
                             </button>
                         )}
                         {bulkStep === 'VARIABLES' && (
                             <div className="flex gap-3">
                                 <button onClick={() => setBulkStep('TEMPLATE')} className="text-slate-400 hover:text-white px-4 py-2 text-sm">Back</button>
                                 <button onClick={() => { validateConflicts(); setBulkStep('PREVIEW'); }} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors">
                                     Next: Preview &rarr;
                                 </button>
                             </div>
                         )}
                    </div>
               )}
          </div>
      )}
    </div>
  );
};

export default ConfigManager;