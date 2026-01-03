
import React, { useState, useEffect } from 'react';

interface ActivationScreenProps {
  onActivate: (key: string) => void;
}

const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivate }) => {
  const [inputKey, setInputKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Generate a unique device signature based on user agent and screen
    const signature = btoa(navigator.userAgent + screen.width).substring(0, 12).toUpperCase();
    setDeviceId(signature);
  }, []);

  const handleActivate = () => {
    // Security logic: Key must contain the DeviceID + "BOSS" or match the master key
    const masterKey = 'MISBAH_ADMIN_2025';
    if (inputKey === masterKey || inputKey.includes(deviceId)) {
      onActivate(inputKey);
    } else {
      setError('INVALID NEURAL KEY. ACCESS DENIED.');
    }
  };

  const whatsappLink = `https://wa.me/917488484114?text=Hello%20Misbah%20Boss,%20I%20want%20to%20activate%20VISION.%20My%20Device%20ID%20is:%20${deviceId}`;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md glass p-8 rounded-3xl border-red-500/30 flex flex-col items-center gap-6 text-center animate-in zoom-in duration-500 my-auto">
        <div className="w-20 h-20 rounded-full border-2 border-red-500 arc-glow flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]">
           <i className="fa-solid fa-shield-lock text-3xl text-red-500"></i>
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-[0.3em] text-white uppercase">System Lockdown</h1>
          <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-tighter">Unauthorized Access Detected</p>
        </div>

        <div className="w-full bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-left">
           <p className="text-[10px] text-slate-500 uppercase mb-1">Neural Device Identity:</p>
           <p className="text-sm text-cyan-400 font-bold tracking-widest break-all">{deviceId}</p>
        </div>

        <div className="w-full space-y-4">
          <input 
            type="text" 
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="ENTER LICENSE KEY"
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-center text-cyan-400 font-bold tracking-widest outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700"
          />
          {error && <p className="text-red-500 text-[10px] font-bold animate-bounce uppercase">{error}</p>}
          
          <button 
            onClick={handleActivate}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95"
          >
            INITIALIZE CORE
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 w-full">
           <p className="text-[10px] text-slate-500 mb-4 font-bold uppercase tracking-widest">To purchase your permanent key:</p>
           <a 
             href={whatsappLink} 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center justify-center gap-3 py-4 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/50 rounded-xl text-emerald-400 font-black text-xs transition-all uppercase tracking-widest"
           >
             <i className="fa-brands fa-whatsapp text-lg"></i> Contact Misbah Boss
           </a>
        </div>
      </div>
    </div>
  );
};

export default ActivationScreen;
