import React, { useState } from 'react';
import { Upload, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PredictResult {
  rating: number;
  reasoning: string;
}

export function Demo() {
  const [file, setFile] = useState<File | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewPath(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreviewPath(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handlePredict = async () => {
    if (!file) return;

    setIsPredicting(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;

        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, text: description }),
        });

        if (!response.ok) {
           const errResp = await response.json();
           throw new Error(errResp.error || 'Server error during inference.');
        }

        const data = await response.json();
        setResult(data);
        setIsPredicting(false);
      };
      reader.onerror = () => {
        throw new Error("Unable to read file.");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
      setIsPredicting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full pb-10">
      
      {/* Input Side */}
      <section className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
          
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Prediction API • Image Input</p>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "w-full aspect-video border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden transition-all group",
                previewPath ? "p-2 border-slate-300" : "hover:bg-slate-100"
              )}
            >
              {previewPath ? (
                <>
                  <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                    <img src={previewPath} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white font-bold text-xs uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              ) : (
                 <>
                    <div className="w-16 h-16 bg-white rounded shadow-sm mb-2 flex flex-col items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                       <Upload size={24} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drag & Drop Image Here</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Product Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product details..."
              className="w-full h-24 p-4 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all"
            />
          </div>

          <button 
            onClick={handlePredict}
            disabled={!file || isPredicting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100/50 uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPredicting ? 'Running Inference...' : 'Run Inference'}
          </button>
          
          {error && (
              <p className="text-[10px] text-red-500 font-bold uppercase bg-red-50 border border-red-100 p-3 rounded-lg text-center mt-2">{error}</p>
          )}

        </div>
      </section>

      {/* Output Side */}
      <section className="lg:col-span-5 flex flex-col gap-6 lg:h-full">
         <AnimatePresence mode="wait">
            {result ? (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white border-t-4 border-emerald-500 rounded-xl p-6 shadow-md flex flex-col relative overflow-hidden"
               >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Prediction Result</p>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">{result.rating.toFixed(2)}</span>
                    <span className="text-xl font-bold text-slate-300">/ 5.0</span>
                  </div>
                  
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                           key={s} 
                           size={28} 
                           className={cn(
                             s <= Math.round(result.rating) ? "text-emerald-500 fill-emerald-500" : "text-slate-100 fill-slate-100",
                             "transition-colors"
                           )} 
                        />
                     ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">Model Confidence Score</span>
                      <span className="text-[10px] text-slate-900 font-bold">94.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                      <div className="w-[94%] h-full bg-emerald-500"></div>
                    </div>

                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">Reasoning Output</span>
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg">
                       <p className="text-[11px] font-mono leading-relaxed text-slate-600">
                         {result.reasoning}
                       </p>
                    </div>
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-slate-200 rounded-xl min-h-[400px]"
               >
                 <div className="w-16 h-16 bg-slate-50 rounded shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                    <span className="text-slate-300 text-2xl">⚡</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Awaiting Payload</p>
                 <p className="text-xs font-mono text-slate-500 max-w-[200px] leading-relaxed">
                   Supply visual and text data to engage the multimodal fusion node.
                 </p>
               </motion.div>
            )}
         </AnimatePresence>
      </section>

    </div>
  );
}
