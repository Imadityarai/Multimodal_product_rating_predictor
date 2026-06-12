import React, { useState } from 'react';
import { Layers, Activity, Code, Star } from 'lucide-react';
import { Demo } from './components/Demo';
import { Metrics } from './components/Metrics';
import { CodeViewer } from './components/CodeViewer';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'metrics' | 'code'>('demo');

  const tabs = [
    { id: 'demo', label: 'Live Inference' },
    { id: 'metrics', label: 'Evaluation Metrics' },
    { id: 'code', label: 'Project Source Code' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Navigation / Status Bar */}
      <header className="h-20 sm:h-16 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-lg font-bold tracking-tight uppercase truncate">Multimodal Predictor <span className="text-slate-400 font-light">v1.2</span></h1>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-3 sm:pb-0 mt-3 sm:mt-0 hide-scrollbar scroll-smooth">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-sm transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
           <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-6xl mx-auto"
           >
              {activeTab === 'demo' && <Demo />}
              {activeTab === 'metrics' && <Metrics />}
              {activeTab === 'code' && <CodeViewer />}
           </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / System Log */}
      <footer className="h-12 bg-slate-900 text-slate-400 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 text-[10px] font-mono shrink-0">
        <div className="flex gap-4 sm:gap-6 items-center h-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400 uppercase tracking-widest">[SYSTEM] Inference node active</span>
          </div>
          <span className="hidden sm:inline uppercase tracking-widest">[BACKEND] FastAPI / Worker: 04</span>
        </div>
        <div className="gap-4 hidden sm:flex items-center h-full tracking-widest">
          <span>PyTorch 2.1.0</span>
          <span>CLIP-ViT-B/32</span>
        </div>
      </footer>
    </div>
  );
}
