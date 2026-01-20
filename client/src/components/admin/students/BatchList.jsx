import React, { useState } from 'react';
import { Upload, Users, Trash2, BrainCircuit, Code } from 'lucide-react';

const BatchList = ({ batches, onUpload, onSelectBatch, onDeleteBatch }) => {
  const [activeTab, setActiveTab] = useState('aptitude'); // 'aptitude' or 'coding'

  // Filter batches by category
  const filteredBatches = batches.filter(b => (b.category || 'aptitude') === activeTab);

  // Helper for Upload (Injects category)
  const handleUploadWrapper = (e) => {
      // Create a fake event-like object or modify data before passing up
      // But since input is simple, we need to pass category separately or assume parent handles it.
      // Better: We pass the category to parent via onUpload(e, activeTab)
      onUpload(e, activeTab); 
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Database</h2>
        <label className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 cursor-pointer transition shadow-lg active:scale-95">
             <Upload size={18} /> Upload {activeTab === 'aptitude' ? 'Aptitude' : 'Coding'} CSV
             {/* Pass activeTab to handler */}
             <input type="file" accept=".csv" hidden onChange={(e) => handleUploadWrapper(e)} />
        </label>
      </div>

      {/* TABS */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-8 border border-slate-800 w-fit">
          <button 
            onClick={() => setActiveTab('aptitude')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'aptitude' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
              <BrainCircuit size={18} /> Aptitude Students
          </button>
          <button 
            onClick={() => setActiveTab('coding')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'coding' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
              <Code size={18} /> Coding Students
          </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No {activeTab} batches found. Upload a CSV.
            </div>
        ) : (
            filteredBatches.map(batch => (
              <div key={batch._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition group relative">
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${activeTab === 'aptitude' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {batch.batchName.charAt(0)}
                      </div>
                      <button onClick={() => onDeleteBatch(batch._id)} className="text-slate-600 hover:text-red-400 transition"><Trash2 size={18}/></button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{batch.batchName}</h3>
                  <div className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                      <Users size={14}/> {batch.studentCount} Students
                  </div>
                  <button onClick={() => onSelectBatch(batch._id, batch.batchName)} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition">View List</button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BatchList;