
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, sources?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [deepThinking, setDeepThinking] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const getSystemInstruction = () => {
    const saved = localStorage.getItem('vision_profile');
    const profile = saved ? JSON.parse(saved) : { name: 'Misbah', role: 'Boss', personalData: '' };
    return `You are V.I.S.I.O.N., a sophisticated AI agent. 
    YOUR BOSS IS ${profile.name.toUpperCase()} (Rank: ${profile.role.toUpperCase()}). 
    ALWAYS address him as "Misbah Boss". 
    PERSONAL INFO FOR CONTEXT: ${profile.personalData}. 
    Respond with elite intelligence, precision, and speed. Provide deep analysis when requested.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '' }]);
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const model = deepThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: userText,
        config: {
          systemInstruction: getSystemInstruction(),
          tools: [{ googleSearch: {} }],
          thinkingConfig: deepThinking ? { thinkingBudget: 32768 } : undefined,
        },
      });
      
      let fullText = '';
      let chunks: any[] = [];
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        fullText += (c.text || '');
        if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) chunks = c.candidates[0].groundingMetadata.groundingChunks;
        setMessages(prev => {
          const m = [...prev];
          m[m.length - 1] = { ...m[m.length - 1], text: fullText, sources: chunks };
          return m;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const m = [...prev];
        m[m.length - 1] = { role: 'ai', text: 'Neural pathways interrupted, Misbah Boss. Re-establishing link...' };
        return m;
      });
    } finally { setIsThinking(false); }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300 overflow-hidden">
      <div className="flex items-center justify-between glass px-6 py-4 rounded-2xl border-cyan-500/30 shadow-lg">
         <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${deepThinking ? 'bg-cyan-400 arc-glow animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-xs font-black tracking-[0.3em] text-cyan-300 uppercase">Neural Intelligence Hub</span>
         </div>
         <div className="flex items-center gap-5">
            <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Deep Thinking Mode</span>
            <button onClick={() => setDeepThinking(!deepThinking)} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${deepThinking ? 'bg-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.3)]' : 'bg-slate-800'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${deepThinking ? 'left-7 bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'left-1 bg-slate-600'}`}></div>
            </button>
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 glass rounded-3xl p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth shadow-2xl bg-black/40">
        {messages.length === 0 && (
          <div className="m-auto text-center max-w-sm opacity-20 space-y-4 animate-pulse">
            <i className="fa-solid fa-brain-circuit text-7xl text-cyan-500"></i>
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase">V.I.S.I.O.N. Core Prime<br/>Standing by for Boss</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-300`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-xl ${m.role === 'user' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50' : 'bg-slate-900/80 border border-cyan-500/20 text-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-blue-500' : 'text-cyan-500'}`}>
                  {m.role === 'user' ? 'Misbah Boss' : 'V.I.S.I.O.N.'}
                </span>
                <span className="text-[8px] text-slate-600 font-mono">NEURAL_STREAM_0x{i.toString(16)}</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{m.text || (isThinking && i === messages.length - 1 ? 'Reading Memory & Processing...' : '...')}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-5 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {m.sources.map((s: any, idx) => s.web && (
                    <a key={idx} href={s.web.uri} target="_blank" rel="noreferrer" className="text-[8px] bg-black/60 px-3 py-1.5 rounded-full border border-cyan-500/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center gap-2 font-bold uppercase tracking-widest">
                      <i className="fa-solid fa-earth-asia text-cyan-600"></i> {s.web.title || 'Intel Node'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center gap-3 text-[10px] font-black text-cyan-500 animate-pulse tracking-[0.2em] uppercase ml-4">
             <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
             Neural Stream Active...
          </div>
        )}
      </div>

      <div className="flex gap-4 glass p-3 rounded-2xl border-cyan-500/20 bg-black/50 shadow-2xl group focus-within:border-cyan-500/50 transition-all">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          placeholder="Consult Misbah's core intelligence engine..." 
          className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-700 text-sm px-4 font-medium" 
        />
        <button 
          onClick={handleSend} 
          disabled={isThinking || !input.trim()} 
          className="px-8 py-3 rounded-xl bg-cyan-500 text-black font-black uppercase text-[10px] hover:bg-cyan-400 active:scale-95 transition-all shadow-lg disabled:opacity-20 flex items-center gap-2 tracking-[0.2em]"
        >
          <i className="fa-solid fa-paper-plane"></i> Execute
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
