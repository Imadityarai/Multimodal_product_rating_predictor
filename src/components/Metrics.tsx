import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const trainingData = [
  { epoch: 1, train_loss: 1.84, val_loss: 1.62 },
  { epoch: 2, train_loss: 1.45, val_loss: 1.30 },
  { epoch: 3, train_loss: 1.25, val_loss: 1.15 },
  { epoch: 4, train_loss: 1.10, val_loss: 1.02 },
  { epoch: 5, train_loss: 0.98, val_loss: 0.95 },
  { epoch: 6, train_loss: 0.88, val_loss: 0.90 },
  { epoch: 7, train_loss: 0.81, val_loss: 0.87 },
  { epoch: 8, train_loss: 0.75, val_loss: 0.84 },
  { epoch: 9, train_loss: 0.70, val_loss: 0.82 },
  { epoch: 10, train_loss: 0.65, val_loss: 0.81 },
];

const baselineData = [
  { model: 'Image Only (ViT)', mae: 0.75, r2: 0.32 },
  { model: 'Text Only (Transformer)', mae: 0.68, r2: 0.45 },
  { model: 'Multimodal Fusion', mae: 0.52, r2: 0.68 },
];

export function Metrics() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      
      {/* Evaluation Results Card styled like Benchmark Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="bg-slate-900 p-3 flex justify-between px-6 items-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Benchmark Comparison</span>
            <span className="text-[10px] font-mono text-slate-400">Epoch 10/10</span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
               <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <th className="p-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">Model Variant</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">MAE</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">RMSE (Simulated)</th>
                   <th className="p-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">R² Score</th>
                 </tr>
               </thead>
               <tbody className="text-xs font-mono">
                 <tr className="border-b border-slate-100">
                   <td className="p-4 font-semibold text-slate-700">Image-Only (CLIP ResNet/ViT)</td>
                   <td className="p-4 text-slate-500">0.750</td>
                   <td className="p-4 text-slate-500">0.920</td>
                   <td className="p-4 text-slate-500">0.320</td>
                 </tr>
                 <tr className="border-b border-slate-100">
                   <td className="p-4 font-semibold text-slate-700">Text-Only (CLIP Transformer)</td>
                   <td className="p-4 text-slate-500">0.680</td>
                   <td className="p-4 text-slate-500">0.840</td>
                   <td className="p-4 text-slate-500">0.450</td>
                 </tr>
                 <tr className="bg-indigo-50/50">
                   <td className="p-4 font-bold text-indigo-700">Multimodal Fusion (Proposed)</td>
                   <td className="p-4 font-bold text-indigo-700">0.520</td>
                   <td className="p-4 font-bold text-indigo-700">0.650</td>
                   <td className="p-4 font-bold text-indigo-700">0.680</td>
                 </tr>
               </tbody>
             </table>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Learning Curves */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Training Loss (MSE)</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="epoch" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
                <Line type="stepAfter" dataKey="train_loss" name="Train Loss" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3, fill: "#4F46E5", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="stepAfter" dataKey="val_loss" name="Validation Loss" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Baseline Comparisons */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Baseline Evaluation (R² Score)</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={baselineData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 1]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false}/>
                <YAxis dataKey="model" type="category" width={140} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                <RechartsTooltip 
                   cursor={{fill: '#F8FAFC'}}
                   contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="r2" name="R² Score" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
