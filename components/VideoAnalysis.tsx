
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

const VideoAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const analyzeVideo = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    setResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
              parts: [
                { inlineData: { data: base64Data, mimeType: 'video/mp4' } },
                { text: 'Analyze this video for key information, actions, and events. Provide a detailed summary.' }
              ]
            }
          });
          setResult(response.text || 'Analysis failed to return text data.');
        } catch (innerErr) {
          console.error(innerErr);
          setResult('Pro core rejected this specific video payload. The video might be too large or incompatible.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(videoFile);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      setResult('Critical failure in analysis pipeline.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-left duration-500 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="glass p-6 rounded-2xl flex flex-col gap-6 overflow-y-auto">
          <h2 className="text-xl font-bold tracking-widest text-cyan-300 flex items-center gap-3"><i className="fa-solid fa-eye"></i> SIGHT ANALYTICS</h2>
          <div className="space-y-4">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="video/mp4" />
             <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-900/50 border-2 border-dashed border-cyan-500/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-all overflow-hidden group">
               {videoPreview ? (
                 <video src={videoPreview} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center group-hover:scale-110 transition-transform">
                   <i className="fa-solid fa-cloud-arrow-up text-cyan-900/40 text-4xl mb-2"></i>
                   <p className="text-[10px] text-cyan-700 font-bold uppercase">Upload MP4 Payload</p>
                 </div>
               )}
             </div>
             <button onClick={analyzeVideo} disabled={isAnalyzing || !videoFile} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 rounded-xl font-bold tracking-widest transition-all">
               {isAnalyzing ? 'DECODING...' : 'INITIATE ANALYSIS'}
             </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 overflow-y-auto bg-black/40 border border-white/5">
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-xs font-bold tracking-widest text-cyan-400">ANALYSIS REPORT</span>
              <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                 <div className="w-2 h-2 rounded-full bg-cyan-500/30"></div>
              </div>
           </div>
           {isAnalyzing ? (
             <div className="space-y-4">
                <div className="h-3 bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-3 bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-3 bg-slate-800 rounded-full w-1/2 animate-pulse"></div>
             </div>
           ) : result ? (
             <div className="text-sm font-sans leading-relaxed text-slate-300 whitespace-pre-wrap">{result}</div>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-700 italic text-xs uppercase tracking-[0.2em]">Awaiting Data Input</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;
