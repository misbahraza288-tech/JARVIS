
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { LogEntry } from '../types';

const OSControl: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [sysInfo, setSysInfo] = useState({ battery: '0%', cpu: '0%', ram: '0%', os: 'Unknown' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch('http://localhost:5000/status');
        if (res.ok) {
          const data = await res.json();
          setBridgeStatus('ONLINE');
          setSysInfo({ battery: data.battery, cpu: data.cpu, ram: data.ram, os: data.os });
        } else {
          setBridgeStatus('OFFLINE');
        }
      } catch {
        setBridgeStatus('OFFLINE');
      }
    };
    const interval = setInterval(checkBridge, 3000);
    checkBridge();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'system', action?: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), message, type, action }]);
  };

  const handleCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input;
    setInput('');
    addLog(cmd, 'user');
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const functions: FunctionDeclaration[] = [{
        name: 'execute_os_command',
        parameters: {
          type: Type.OBJECT,
          properties: { 
            command_type: { type: Type.STRING, enum: ['open_app', 'sys_control', 'browser'] },
            target: { type: Type.STRING, description: 'The app name, website, or search query' },
            action: { type: Type.STRING, description: 'The specific action like lock, screenshot, volume_up, search' }
          },
          required: ['command_type']
        },
        description: 'Command JARVIS to control your physical laptop hardware and software environment.'
      }];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: cmd,
        config: {
          systemInstruction: `You are JARVIS (V.I.S.I.O.N. protocol). Your creator is Misbah Boss. 
          Bridge Status: ${bridgeStatus}. 
          If the bridge is ONLINE, use execute_os_command tool to fulfill requests like opening apps, locking PC, volume control, etc.
          Be precise, witty, and loyal.`,
          tools: [{ functionDeclarations: functions }]
        }
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (bridgeStatus === 'ONLINE') {
            try {
              const bridgeRes = await fetch('http://localhost:5000/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(call.args)
              });
              const result = await bridgeRes.json();
              addLog(result.message, 'ai', `SUCCESS: ${call.args.command_type}`);
            } catch (err) {
              addLog("Network error reaching the bridge, Misbah Boss.", "system");
            }
          } else {
            addLog("System Bridge is currently OFFLINE. Please run bridge.py on your terminal to allow hardware control.", "system");
          }
        }
      } else {
        addLog(response.text || 'Command processed in neural core.', 'ai');
      }
    } catch (err) { 
      addLog('Neural Link Interrupted.', 'system'); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="glass p-3 rounded-xl border-l-2 border-cyan-500">
            <p className="text-[8px] text-slate-500 uppercase font-bold">Battery</p>
            <p className="text-sm font-mono text-cyan-400">{sysInfo.battery}</p>
         </div>
         <div className="glass p-3 rounded-xl border-l-2 border-emerald-500">
            <p className="text-[8px] text-slate-500 uppercase font-bold">CPU Load</p>
            <p className="text-sm font-mono text-emerald-400">{sysInfo.cpu}</p>
         </div>
         <div className="glass p-3 rounded-xl border-l-2 border-blue-500">
            <p className="text-[8px] text-slate-500 uppercase font-bold">RAM Usage</p>
            <p className="text-sm font-mono text-blue-400">{sysInfo.ram}</p>
         </div>
         <div className="glass p-3 rounded-xl border-l-2 border-purple-500 hidden md:block">
            <p className="text-[8px] text-slate-500 uppercase font-bold">OS Platform</p>
            <p className="text-[10px] font-mono text-purple-400 truncate">{sysInfo.os}</p>
         </div>
      </div>

      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden relative shadow-2xl border-cyan-500/10">
        <div className="bg-cyan-950/20 p-2 border-b border-white/5 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bridgeStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Neural Bridge: {bridgeStatus}</span>
          </div>
          <span className="text-[8px] font-mono text-cyan-600">PROTOCOL_V3.1.2</span>
        </div>
        
        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-4 bg-black/40">
           {logs.length === 0 && (
             <div className="h-full flex items-center justify-center opacity-20">
               <p className="text-center text-[10px] uppercase tracking-[0.4em]">Listening for hardware directives...</p>
             </div>
           )}
           {logs.map(log => (
             <div key={log.id} className={`pl-4 py-2 border-l-2 ${log.type === 'user' ? 'border-blue-500 bg-blue-500/5' : log.type === 'ai' ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 bg-slate-900/20'} rounded-r-lg`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-black tracking-widest uppercase ${log.type === 'user' ? 'text-blue-500' : 'text-cyan-500'}`}>
                    {log.type === 'user' ? 'MISBAH BOSS' : 'V.I.S.I.O.N.'}
                  </span>
                  <span className="text-[8px] text-slate-600 italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className={`${log.type === 'user' ? 'text-blue-100' : 'text-slate-300'} text-xs leading-relaxed`}>{log.message}</p>
                {log.action && (
                  <span className="mt-2 block text-[8px] font-bold bg-white/5 px-2 py-0.5 rounded w-fit text-slate-500 uppercase tracking-tighter">
                    Action: {log.action}
                  </span>
                )}
             </div>
           ))}
        </div>
        
        <form onSubmit={handleCommand} className="p-4 bg-slate-900/80 flex gap-3 border-t border-white/5">
           <div className="flex-1 flex items-center gap-3 bg-black/40 px-4 rounded-xl border border-white/5 focus-within:border-cyan-500/50 transition-all">
              <i className="fa-solid fa-terminal text-[10px] text-cyan-700"></i>
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Type command (e.g. 'Take a screenshot' or 'Open Notepad')..." 
                className="flex-1 py-3 bg-transparent outline-none text-cyan-400 font-mono text-sm placeholder:text-slate-700" 
              />
           </div>
           <button disabled={isProcessing || !input.trim()} className="w-12 h-12 rounded-xl bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 active:scale-95 disabled:opacity-20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
           </button>
        </form>
      </div>
    </div>
  );
};

export default OSControl;
