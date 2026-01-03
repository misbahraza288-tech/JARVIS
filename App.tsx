
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import VoiceInterface from './components/VoiceInterface';
import ImageGen from './components/ImageGen';
import VideoGen from './components/VideoGen';
import OSControl from './components/OSControl';
import ChatInterface from './components/ChatInterface';
import VideoAnalysis from './components/VideoAnalysis';
import ActivationScreen from './components/ActivationScreen';
import Settings from './components/Settings';
import Blueprint from './components/Blueprint';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isAuth, setIsAuth] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('vision_license_key');
    if (savedKey) setIsActivated(true);

    const checkAuth = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAuth(hasKey);
      }
    };
    checkAuth();
  }, []);

  const handleActivation = (key: string) => {
    localStorage.setItem('vision_license_key', key);
    setIsActivated(true);
  };

  const handleAuth = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsAuth(true);
    }
  };

  const navItems = [
    { view: AppView.DASHBOARD, icon: 'fa-house-chimney', label: 'HUB' },
    { view: AppView.VOICE, icon: 'fa-microphone-lines', label: 'VOICE' },
    { view: AppView.CHAT, icon: 'fa-comment-dots', label: 'INTEL' },
    { view: AppView.IMAGE_GEN, icon: 'fa-palette', label: 'VISUAL' },
    { view: AppView.BLUEPRINT, icon: 'fa-diagram-project', label: 'PLAN' },
    { view: AppView.OS_CONTROL, icon: 'fa-terminal', label: 'OS' },
    { view: AppView.SETTINGS, icon: 'fa-gear', label: 'CORE' },
  ];

  if (!isActivated) {
    return <ActivationScreen onActivate={handleActivation} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-cyan-50 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Header - Fixed Top */}
      <header className="h-14 md:h-16 border-b border-cyan-500/20 glass flex items-center justify-between px-4 md:px-6 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-500 arc-glow animate-pulse flex items-center justify-center">
             <div className="w-4 h-4 md:w-6 md:h-6 rounded-full border border-cyan-300"></div>
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-black tracking-[0.2em] text-cyan-400">V.I.S.I.O.N.</h1>
            <p className="hidden md:block text-[8px] uppercase tracking-tighter text-cyan-600 font-mono">Status: Connected to Misbah Boss</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
           {!isAuth && (
              <button 
                onClick={handleAuth}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-3 py-1 rounded-full text-[9px] md:text-xs font-bold transition-all"
              >
                PRO CORE
              </button>
           )}
           <div className="flex flex-col items-end">
              <span className="text-[8px] md:text-xs font-mono text-cyan-500 uppercase tracking-tighter">OS: Prime</span>
              <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="bg-cyan-500 h-full w-3/4 animate-pulse"></div>
              </div>
           </div>
        </div>
      </header>

      {/* Main Layout - Responsiveness */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row pb-16 md:pb-0">
        {/* Navigation - Sidebar on Desktop, Bottom bar on Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-24 glass border-t md:border-t-0 md:border-r border-cyan-500/10 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-6 gap-0 md:gap-6 z-40 overflow-x-auto md:overflow-y-auto shadow-[0_-10px_20px_rgba(0,0,0,0.5)] md:shadow-none">
           {navItems.map((item) => (
             <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex flex-col items-center group transition-all px-3 md:px-0 md:w-full py-1 md:py-2 ${
                  activeView === item.view ? 'text-cyan-400 scale-110 md:scale-100' : 'text-slate-500 hover:text-cyan-600'
                }`}
             >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-1 transition-all ${
                  activeView === item.view ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-800/20 border border-transparent group-hover:bg-slate-800/40'
                }`}>
                  <i className={`fa-solid ${item.icon} text-sm md:text-lg`}></i>
                </div>
                <span className="text-[7px] md:text-[9px] font-bold tracking-widest uppercase">{item.label}</span>
             </button>
           ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative p-4 md:p-6 pb-20 md:pb-6">
          {activeView === AppView.DASHBOARD && <Dashboard onNavigate={setActiveView} />}
          {activeView === AppView.VOICE && <VoiceInterface />}
          {activeView === AppView.IMAGE_GEN && <ImageGen />}
          {activeView === AppView.VIDEO_GEN && <VideoGen isAuth={isAuth} onAuth={handleAuth} />}
          {activeView === AppView.OS_CONTROL && <OSControl />}
          {activeView === AppView.CHAT && <ChatInterface />}
          {activeView === AppView.SETTINGS && <Settings />}
          {activeView === AppView.BLUEPRINT && <Blueprint />}
        </div>
      </main>

      {/* Global Aesthetics */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>
    </div>
  );
};

export default App;
