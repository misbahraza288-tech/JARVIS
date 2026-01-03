
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { VideoConfig } from '../types';

interface VideoGenProps {
  isAuth: boolean;
  onAuth: () => void;
}

const VideoGen: React.FC<VideoGenProps> = ({ isAuth, onAuth }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Standby...');
  const [config, setConfig] = useState<VideoConfig>({ aspectRatio: '16:9', resolution: '720p' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refImage, setRefImage] = useState<string | null>(null);

  const generateVideo = async () => {
    if (!isAuth) return;
    setIsGenerating(true);
    setVideoUrl(null);
    setLoadingMsg('Allocating GPU resources...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image in a cinematic way.',
        config: { numberOfVideos: 1, resolution: config.resolution, aspectRatio: config.aspectRatio }
      };

      if (refImage) {
        payload.image = { imageBytes: refImage.split(',')[1], mimeType: 'image/png' };
      }

      let operation = await ai.models.generateVideos(payload);
      while (!operation.done) {
        setLoadingMsg("Rendering temporal frames...");
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        setVideoUrl(URL.createObjectURL(await fetchRes.blob()));
      }
    } catch (err) { console.error(err); } finally { setIsGenerating(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!isAuth) return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="glass p-10 rounded-3xl max-w-lg text-center border-orange-500/20 shadow-2xl">
        <i className="fa-solid fa-lock text-5xl text-orange-400 mb-6"></i>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Access Restricted</h2>
        <button onClick={onAuth} className="mt-6 w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold">AUTHORIZE CORE</button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-1 glass p-6 rounded-2xl flex flex-col gap-6 overflow-y-auto">
           <h2 className="text-xl font-bold tracking-widest text-blue-300 flex items-center gap-3"><i className="fa-solid fa-film"></i> MOTION CORE</h2>
           <div className="space-y-4 flex-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">IMAGE REFERENCE (OPTIONAL)</label>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-slate-900/50 border-2 border-dashed border-blue-500/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-all overflow-hidden">
                  {refImage ? <img src={refImage} className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-blue-900/40 text-2xl"></i>}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">MOTION DESCRIPTION</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Cinematic pan across..." className="w-full h-24 bg-slate-900/50 border border-blue-500/20 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['16:9', '9:16'].map(ratio => (
                  <button key={ratio} onClick={() => setConfig({...config, aspectRatio: ratio as any})} className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${config.aspectRatio === ratio ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                    {ratio === '16:9' ? 'WIDE' : 'MOBILE'}
                  </button>
                ))}
              </div>
           </div>
           <button onClick={generateVideo} disabled={isGenerating || (!prompt && !refImage)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded-xl font-bold tracking-widest transition-all">
             {isGenerating ? 'SYNCING...' : 'START SYNTHESIS'}
           </button>
        </div>
        <div className="lg:col-span-3 glass rounded-2xl overflow-hidden relative flex items-center justify-center bg-black/40 p-4">
           {isGenerating ? (
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 animate-spin mx-auto mb-4"></div>
                <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.2em]">{loadingMsg}</p>
              </div>
           ) : videoUrl ? <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-2xl" /> : (
             <div className="text-center opacity-10"><i className="fa-solid fa-clapperboard text-8xl mb-4"></i><p className="text-lg font-bold uppercase tracking-[0.5em]">No Temporal Link</p></div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoGen;
