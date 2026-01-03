
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats = [
    { label: 'Latency', value: '4ms', color: 'text-cyan-400' },
    { label: 'Neural Throughput', value: '1.2 PB/s', color: 'text-blue-400' },
    { label: 'Active Links', value: 'GLOBAL', color: 'text-indigo-400' },
    { label: 'Response Engine', value: 'TURBO', color: 'text-emerald-400' }
  ];

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-4 rounded-xl border-l-4 border-l-cyan-500 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className="fa-solid fa-bolt-lightning text-4xl"></i>
            </div>
            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-mono ${s.color} tracking-tighter`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Core Control */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-atom text-9xl text-cyan-400"></i>
          </div>
          <h2 className="text-xl font-bold tracking-widest text-cyan-300 mb-6 flex items-center gap-3">
             <i className="fa-solid fa-hand-sparkles"></i> WELCOME BACK, MISBAH BOSS
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-500/10">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold uppercase">System Authority</span>
                 <span className="text-xs text-cyan-500">MISBAH (ROOT)</span>
               </div>
               <div className="w-full bg-slate-900 rounded-full h-1">
                 <div className="bg-cyan-500 h-1 rounded-full w-[100%] shadow-[0_0_10px_#06b6d4]"></div>
               </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              V.I.S.I.O.N. is fully synchronized to your neural pattern. All subsystems are online. I have updated my memory with your latest personal info from the Core settings. How shall we proceed today, <strong>Boss</strong>?
            </p>
            <div className="flex gap-4 pt-4">
               <button 
                 onClick={() => onNavigate(AppView.VOICE)}
                 className="flex-1 py-3 px-6 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold transition-all text-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]"
               >
                 VOICE COMMAND
               </button>
               <button 
                 onClick={() => onNavigate(AppView.SETTINGS)}
                 className="flex-1 py-3 px-6 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-indigo-400 font-bold transition-all text-sm"
               >
                 UPDATE PROFILE
               </button>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="glass rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 border-b border-white/10 pb-2">TURBO DIAGNOSTICS</h3>
          <div className="flex-1 space-y-4">
             {[
               { icon: 'fa-shield-check', label: 'License Status', status: 'VERIFIED' },
               { icon: 'fa-user-crown', label: 'Authority', status: 'MISBAH BOSS' },
               { icon: 'fa-lock', label: 'Anti-Theft', status: 'ACTIVE' },
               { icon: 'fa-signal-stream', label: 'Neural Link', status: '100%' }
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-white/5">
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-cyan-500 w-4`}></i>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">{item.status}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
