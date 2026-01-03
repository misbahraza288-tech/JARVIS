
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ImageConfig } from '../types';

const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<ImageConfig>({
    aspectRatio: "1:1",
    imageSize: "1K"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: config.aspectRatio, imageSize: config.imageSize } }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) { console.error('Gen error:', err); } finally { setIsGenerating(false); }
  };

  const editImage = async () => {
    const targetImage = generatedImageUrl || uploadedBase64;
    if (!targetImage || !editPrompt.trim()) return;
    setIsEditing(true);
    try {
      const base64Data = targetImage.split(',')[1];
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: editPrompt }
          ]
        }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          setEditPrompt('');
          break;
        }
      }
    } catch (err) { console.error('Edit error:', err); } finally { setIsEditing(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
        setGeneratedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        <div className="glass p-6 rounded-2xl flex flex-col gap-6 overflow-y-auto">
          <h2 className="text-xl font-bold tracking-widest text-cyan-300 flex items-center gap-3"><i className="fa-solid fa-palette"></i> VISUAL ENGINE</h2>
          
          <div className="space-y-4">
             <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">SYNTHESIS PROMPT</label>
               <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A cybernetic landscape..." className="w-full h-24 bg-slate-900/50 border border-cyan-500/20 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none transition-all resize-none" />
               <div className="grid grid-cols-2 gap-2 mt-2">
                 <select value={config.aspectRatio} onChange={(e) => setConfig({...config, aspectRatio: e.target.value as any})} className="bg-slate-900 border border-white/10 rounded-lg p-2 text-[10px] outline-none">
                    {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 <button onClick={generateImage} disabled={isGenerating || !prompt} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[10px] disabled:bg-slate-800">
                   {isGenerating ? 'SYNCING...' : 'GENERATE'}
                 </button>
               </div>
             </div>

             <div className="border-t border-white/5 pt-4">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">NEURAL MODIFICATION</label>
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
               <button onClick={() => fileInputRef.current?.click()} className="w-full mb-2 py-2 border border-dashed border-cyan-500/30 rounded-lg text-[10px] text-cyan-500 font-bold uppercase hover:bg-cyan-500/5 transition-all">
                 {uploadedBase64 ? 'CHANGE IMAGE' : 'UPLOAD REFERENCE'}
               </button>
               <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Add a retro filter, remove bg..." className="w-full h-24 bg-slate-900/50 border border-purple-500/20 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition-all resize-none" />
               <button onClick={editImage} disabled={isEditing || (!generatedImageUrl && !uploadedBase64) || !editPrompt} className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] disabled:bg-slate-800 transition-all">
                 {isEditing ? 'REFINING...' : 'APPLY EDITS'}
               </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden relative flex items-center justify-center p-4">
           {isGenerating || isEditing ? (
             <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mx-auto mb-4"></div>
                <p className="text-cyan-500 font-mono text-[10px] animate-pulse tracking-widest uppercase">Processing Neural Data...</p>
             </div>
           ) : (generatedImageUrl || uploadedBase64) ? (
             <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                <img src={generatedImageUrl || uploadedBase64!} alt="V.I.S.I.O.N. Output" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5" />
             </div>
           ) : (
             <div className="text-center opacity-10"><i className="fa-solid fa-atom text-8xl mb-4"></i><p className="text-lg font-bold uppercase tracking-[0.5em]">No Data Stream</p></div>
           )}
           <div className="absolute top-4 right-4 flex gap-2">
              {(generatedImageUrl || uploadedBase64) && (
                <button onClick={() => { setGeneratedImageUrl(null); setUploadedBase64(null); }} className="w-8 h-8 rounded-full glass flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all"><i className="fa-solid fa-trash-can"></i></button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGen;
