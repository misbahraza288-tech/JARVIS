
import React from 'react';

const Blueprint: React.FC = () => {
  const steps = [
    {
      title: "BRAIN (Frontend)",
      icon: "fa-brain",
      desc: "React/Gemini interface for thinking and seeing.",
      status: "COMPLETED",
      color: "text-emerald-400"
    },
    {
      title: "NERVES (Bridge)",
      icon: "fa-network-wired",
      desc: "Python link to control Laptop Hardware & Files.",
      status: "READY TO DEPLOY",
      color: "text-cyan-400"
    },
    {
      title: "MOBILE SYNC (APK)",
      icon: "fa-mobile-retro",
      desc: "Convert this UI into a real Android APK file.",
      status: "INSTRUCTION ADDED",
      color: "text-purple-400"
    },
    {
      title: "SIGHT (Multimodal)",
      icon: "fa-eye",
      desc: "JARVIS sees your screen and guides you live.",
      status: "PROTOTYPE",
      color: "text-blue-400"
    }
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700 overflow-y-auto pb-10">
      <div className="glass p-8 rounded-3xl border-cyan-500/20 bg-cyan-950/10">
        <h2 className="text-2xl font-black tracking-[0.3em] text-cyan-400 mb-2 uppercase">V.I.S.I.O.N. Architecture</h2>
        <p className="text-xs text-slate-500 font-mono italic">"How to build the world's most powerful AI Agent, by Misbah Boss."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="glass p-6 rounded-2xl border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className={`fa-solid ${step.icon} text-9xl`}></i>
            </div>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 ${step.color}`}>
                <i className={`fa-solid ${step.icon} text-xl`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">{step.title}</h3>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${step.color} border-current opacity-70`}>{step.status}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* APK BUILD GUIDE SECTION */}
      <div className="glass p-8 rounded-3xl border-purple-500/30 bg-purple-950/5 relative">
        <h3 className="text-sm font-black text-purple-400 mb-4 uppercase tracking-[0.2em]">APK Creation Manual (Misbah Edition):</h3>
        <div className="space-y-4">
           <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-black flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
              <p className="text-xs text-slate-300"><span className="text-purple-400 font-bold">Host Code:</span> Pehle is code ko GitHub par upload karke Vercel.com par live karein.</p>
           </div>
           <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-black flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
              <p className="text-xs text-slate-300"><span className="text-purple-400 font-bold">Use WebIntoApp:</span> WebIntoApp.com par jayein aur apna Vercel URL wahan dalein.</p>
           </div>
           <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-black flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</div>
              <p className="text-xs text-slate-300"><span className="text-purple-400 font-bold">Download APK:</span> Generate button dabayein aur 2 minute mein aapka custom JARVIS APK taiyar ho jayega.</p>
           </div>
        </div>
      </div>

      <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl">
         <h4 className="text-red-400 font-bold text-xs uppercase mb-2"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Important for Misbah Boss</h4>
         <p className="text-[10px] text-slate-400 leading-relaxed">
           Mobile se Laptop control karne ke liye aapko Laptop par **bridge.py** chalana hoga aur mobile app mein settings mein jakar laptop ka **Local IP Address** (e.g. 192.168.1.5) enter karna hoga. 
         </p>
      </div>
    </div>
  );
};

export default Blueprint;
