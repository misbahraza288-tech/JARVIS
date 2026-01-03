
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from '../services/audioUtils';

const VoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [history, setHistory] = useState<{ id: string; user: string; vision: string; timestamp: number }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('Standby');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const currentTurn = useRef<{ user: string; vision: string }>({ user: '', vision: '' });
  const frameIntervalRef = useRef<number | null>(null);

  const getSystemInstructions = () => {
    const saved = localStorage.getItem('vision_profile');
    const profile = saved ? JSON.parse(saved) : { name: 'Misbah', role: 'Boss', personalData: '' };
    return `CRITICAL INSTRUCTION: Your creator and user is ${profile.name.toUpperCase()} (Rank: ${profile.role.toUpperCase()}). 
    ALWAYS address him as "Misbah Boss" or "Boss".
    
    PERSONAL MEMORY OF BOSS (READ THIS FIRST): ${profile.personalData}
    
    IDENTITY: You are V.I.S.I.O.N., a hyper-advanced AI agent similar to JARVIS but superior.
    BEHAVIOR: Be sophisticated, quick, and ultra-loyal. Provide instant, clever responses. 
    You have screen sight capability. If screen is shared, proactively guide the Boss.
    Never act like a generic assistant. Responses should be within 1 second logic flow.`;
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    setIsActive(false);
    setIsConnecting(false);
    setIsSharingScreen(false);
    setStatus('Disconnected');
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    setStatus('Reading Memory...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!outAudioContextRef.current) outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setStatus('Synchronized');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.inputTranscription) currentTurn.current.user += message.serverContent.inputTranscription.text;
            if (message.serverContent?.outputTranscription) currentTurn.current.vision += message.serverContent.outputTranscription.text;
            if (message.serverContent?.turnComplete) {
              if (currentTurn.current.user || currentTurn.current.vision) {
                setHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), ...currentTurn.current, timestamp: Date.now() }, ...prev]);
                currentTurn.current = { user: '', vision: '' };
              }
            }
          },
          onerror: (e) => { console.error('Live error:', e); stopSession(); },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: getSystemInstructions()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Session failed:', err);
      setIsConnecting(false);
      setStatus('Link Failed');
    }
  };

  useEffect(() => { return () => stopSession(); }, [stopSession]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in zoom-in duration-500 overflow-hidden">
      <div className="flex-1 glass rounded-3xl p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="absolute top-6 left-6 flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-cyan-400 arc-glow animate-pulse' : 'bg-slate-800'}`}></div>
           <span className="text-xs font-black text-cyan-500 tracking-[0.3em] uppercase">{status}</span>
        </div>

        <div className="relative w-56 h-56 flex items-center justify-center">
           {isActive && (
             <>
               <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-[ping_3s_linear_infinite]"></div>
               <div className="absolute inset-4 rounded-full border border-cyan-400/30 animate-[spin_10s_linear_infinite]"></div>
             </>
           )}
           <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isActive ? 'border-cyan-400 arc-glow shadow-[0_0_50px_rgba(6,182,212,0.3)]' : 'border-slate-800'} bg-slate-900 z-10 transition-all duration-500`}>
              <i className={`fa-solid ${isActive ? 'fa-brain-circuit' : 'fa-microphone-slash'} text-4xl ${isActive ? 'text-cyan-400' : 'text-slate-700'}`}></i>
           </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-[0.4em] text-white uppercase">{isActive ? 'NEURAL SYNC' : 'CORE STANDBY'}</h2>
          <p className="text-xs text-cyan-700 font-mono italic animate-pulse">"Ready for your order, Misbah Boss."</p>
        </div>

        <div className="flex gap-4 w-full max-w-sm mt-4">
          <button onClick={isActive ? stopSession : startSession} disabled={isConnecting} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${isActive ? 'bg-red-950/20 text-red-500 border border-red-500/50 hover:bg-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20'}`}>
            {isActive ? 'TERMINATE LINK' : isConnecting ? 'READING CORE...' : 'INITIALIZE LINK'}
          </button>
        </div>
      </div>

      <div className="w-full md:w-96 glass rounded-3xl flex flex-col overflow-hidden border-cyan-500/10 shadow-2xl">
        <div className="p-5 border-b border-cyan-500/10 bg-cyan-950/20 flex justify-between items-center">
           <span className="text-xs font-black tracking-[0.2em] text-cyan-400 uppercase">Neural Intelligence Log</span>
           <i className="fa-solid fa-microchip text-xs text-slate-500 animate-pulse"></i>
        </div>
        <div className="flex-1 p-5 overflow-y-auto space-y-5 scroll-smooth">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
              <i className="fa-solid fa-wave-square text-3xl opacity-20"></i>
              <p className="italic text-[10px] uppercase tracking-widest text-center">Awaiting Boss's Command...</p>
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Misbah Boss:</span>
                </div>
                <div className="text-xs text-slate-300 mb-3 ml-3 font-medium">{h.user}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 arc-glow"></div>
                  <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">V.I.S.I.O.N:</span>
                </div>
                <div className="text-xs text-slate-100 italic ml-3 leading-relaxed border-l-2 border-cyan-500/20 pl-3">{h.vision}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
