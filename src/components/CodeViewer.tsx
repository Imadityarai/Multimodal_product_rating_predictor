import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  children?: FileNode[];
}

export function CodeViewer() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/files')
      .then(r => r.json())
      .then(data => {
         setTree(data);
         const initOpen: Record<string, boolean> = {};
         data.forEach((n: FileNode) => {
            if (n.type === 'directory') initOpen[n.path] = true;
         });
         setOpenFolders(initOpen);
         
         const readme = data.find((n: FileNode) => n.name === 'README.md');
         if (readme) setSelectedFile(readme);
      })
      .catch(console.error);
  }, []);

  const toggleFolder = (path: string) => {
     setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes: FileNode[], padding = 12) => {
    return nodes.map(node => {
      const isOpen = openFolders[node.path];
      const isSelected = selectedFile?.path === node.path;
      
      if (node.type === 'directory') {
         return (
           <div key={node.path}>
             <button 
               onClick={() => toggleFolder(node.path)}
               className="w-full flex items-center text-xs py-1.5 hover:bg-slate-100 text-slate-700 transition-colors font-mono"
               style={{ paddingLeft: `${padding}px` }}
             >
                <div className="w-4 h-4 mr-1 flex items-center justify-center text-slate-400">
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <span className="text-slate-300 mr-2 text-sm">📁</span>
                <span className="font-semibold">{node.name}/</span>
             </button>
             <AnimatePresence>
                {isOpen && node.children && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                     {renderTree(node.children, padding + 16)}
                  </motion.div>
                )}
             </AnimatePresence>
           </div>
         )
      }

      return (
         <button
           key={node.path}
           onClick={() => setSelectedFile(node)}
           className={cn(
              "w-full flex items-center text-xs py-1.5 transition-colors font-mono",
              isSelected ? "text-indigo-600 font-bold bg-indigo-50/50" : "hover:bg-slate-100 text-slate-600"
           )}
           style={{ paddingLeft: `${padding + 24}px` }}
         >
           <span className="text-slate-300 mr-2 text-sm">📄</span>
           {node.name}
         </button>
      );
    });
  };

  const codeString = selectedFile?.content || "// Select a file to view its contents.";

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[600px] max-w-6xl mx-auto w-full">
       
       {/* File Explorer Sidebar */}
       <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Project Structure</span>
             <a href="#" className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-colors" title="Export available via AI Studio IDE Export Zip functionality">
                <Download size={14} />
             </a>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-2">
             {tree.length > 0 ? renderTree(tree) : (
                <div className="p-4 text-xs font-mono text-slate-400 text-center">Loading files...</div>
             )}
          </div>
       </div>

       {/* Code Editor View */}
       <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
          <div className="flex text-[10px] px-6 py-3 bg-slate-950 border-b border-slate-800 text-slate-300 items-center justify-between font-mono uppercase tracking-widest font-bold">
             <div className="flex items-center gap-2">
                <span>{selectedFile?.path || 'viewer'}</span>
             </div>
             {(selectedFile?.name.endsWith('.py') || selectedFile?.name.endsWith('.ts')) && (
                <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                   {selectedFile.name.split('.').pop()}
                </div>
             )}
          </div>
          <div className="flex-1 overflow-auto p-6">
             <pre className="text-sm font-mono leading-relaxed text-slate-300">
                <code>{codeString}</code>
             </pre>
          </div>
       </div>

    </div>
  );
}
