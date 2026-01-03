
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Misbah',
    role: 'Boss',
    personalData: '',
    activated: true,
    licenseKey: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('vision_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('vision_profile', JSON.stringify(profile));
    alert('NEURAL MEMORY UPDATED, MISBAH BOSS.');
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="glass p-8 rounded-3xl border-cyan-500/20">
        <h2 className="text-2xl font-black tracking-widest text-cyan-400 mb-8 flex items-center gap-4">
          <i className="fa-solid fa-sliders"></i> CORE PREFERENCES
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">IDENTIFIER</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">RANK/TITLE</label>
              <input 
                type="text" 
                value={profile.role} 
                onChange={(e) => setProfile({...profile, role: e.target.value})}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">PERSONAL KNOWLEDGE BASE (NEURAL MEMORY)</label>
            <textarea 
              value={profile.personalData} 
              onChange={(e) => setProfile({...profile, personalData: e.target.value})}
              placeholder="Tell V.I.S.I.O.N. your secrets, habits, or things you want it to remember forever..."
              className="w-full h-48 bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-cyan-500 resize-none font-mono"
            />
          </div>

          <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
             <p className="text-[10px] text-cyan-500 font-bold uppercase mb-1">Status Report:</p>
             <p className="text-xs text-slate-400 italic">V.I.S.I.O.N. will synthesize this data before every interaction to ensure the highest level of personalization for Misbah Boss.</p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl tracking-widest transition-all"
          >
            UPDATE MEMORY CORE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
