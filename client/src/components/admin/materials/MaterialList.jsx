import React from 'react';
import { Layers } from 'lucide-react';

const MaterialList = () => {
  return (
    <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl animate-in fade-in duration-300">
        <Layers size={48} className="mx-auto text-slate-700 mb-4"/>
        <h3 className="text-xl font-bold text-white">Study Materials</h3>
        <p className="text-slate-500 mb-6">Manage notes, PDFs, and video links here.</p>
        <button className="px-6 py-2 bg-purple-600 rounded-lg text-white font-bold hover:bg-purple-700">Add Material</button>
    </div>
  );
};

export default MaterialList;