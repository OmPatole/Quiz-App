import React, { useState } from 'react';
import { Plus, Upload, Search, Filter, Trash2, Edit, Clock, AlertTriangle, X, BrainCircuit, Code } from 'lucide-react';

// FIX: Added activeCategory and setActiveCategory to props
const QuizList = ({ 
    quizzes, 
    onCreateNew, 
    onEditQuiz, 
    onDeleteQuiz, 
    onImportJson, 
    activeCategory, 
    setActiveCategory 
}) => {
    
  // --- STATE FOR FILTERS (Local) ---
  const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE FOR MODAL ---
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });

  // --- FILTERING LOGIC ---
  const filteredQuizzes = quizzes.filter(q => {
      // 1. Filter by Category (Prop)
      // Safety check: ensure q.category exists, default to aptitude
      const quizCat = q.category || 'aptitude';
      const matchesCategory = quizCat === activeCategory;
      
      // 2. Filter by Search
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 3. Filter by Type
      const matchesType = filterType === 'all' || q.quizType === filterType;

      return matchesCategory && matchesSearch && matchesType;
  });

  // --- DELETE HANDLERS ---
  const initiateDelete = (id, title) => setDeleteModal({ show: true, id, title });
  const confirmDelete = () => {
      if (deleteModal.id) {
          onDeleteQuiz(deleteModal.id);
          setDeleteModal({ show: false, id: null, title: '' });
      }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">Quiz Library</h2>
            <p className="text-slate-400 text-sm mt-1">Manage assessments and coding challenges.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <label className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 hover:text-white transition cursor-pointer shadow-lg active:scale-95 text-sm">
                <Upload size={16} /> <span className="hidden sm:inline">Import JSON</span>
                <input type="file" accept=".json" hidden onChange={onImportJson} />
            </label>
            <button onClick={onCreateNew} className="px-4 py-2 bg-purple-600 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 text-white transition shadow-lg shadow-purple-900/20 active:scale-95 text-sm">
                <Plus size={16} /> <span className="hidden sm:inline">Create Quiz</span><span className="sm:hidden">New</span>
            </button>
        </div>
      </div>

      {/* --- LEVEL 1: CATEGORY TABS (CONTROLLED BY PARENT) --- */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800 w-full md:w-fit">
          <button 
            onClick={() => setActiveCategory('aptitude')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${activeCategory === 'aptitude' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
              <BrainCircuit size={18} /> Aptitude
          </button>
          <button 
            onClick={() => setActiveCategory('coding')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${activeCategory === 'coding' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
              <Code size={18} /> Coding
          </button>
      </div>

      {/* --- LEVEL 2: SEARCH & TYPE FILTER --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition" size={18} />
              <input 
                  type="text" 
                  placeholder={`Search ${activeCategory} quizzes...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 outline-none focus:border-purple-500 transition shadow-sm"
              />
          </div>

          <div className="md:col-span-4 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 outline-none focus:border-purple-500 transition shadow-sm appearance-none cursor-pointer capitalize"
              >
                  <option value="all">All Types</option>
                  <option value="mock">Mock Tests</option>
                  <option value="weekly">Weekly Exams</option>
              </select>
          </div>
      </div>
      
      {/* QUIZ GRID */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
            <div className="flex justify-center mb-4"><Search size={48} className="text-slate-700"/></div>
            <p className="text-lg font-medium">No {activeCategory} quizzes found.</p>
            <p className="text-sm">Try changing filters or creating a new one.</p>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map(q => (
                  <div key={q.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-900/10 flex flex-col relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1 ${q.quizType === 'mock' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      
                      <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                              q.quizType === 'mock' 
                              ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' 
                              : 'bg-purple-900/30 text-purple-400 border-purple-500/30'
                          }`}>
                              {q.quizType}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{q.questions?.length || 0} Qs</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 h-14" title={q.title}>{q.title}</h3>
                      
                      <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock size={14} /> 
                              <span>{Math.floor((q.duration || 60)/60)}h {(q.duration || 60)%60}m</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                              <UsersIcon size={14} />
                              <span className="truncate max-w-[200px]">{q.targetYears?.join(', ') || 'All Years'}</span>
                          </div>
                      </div>

                      <div className="mt-auto flex gap-3 pt-4 border-t border-slate-800">
                          <button 
                            onClick={() => onEditQuiz(q.id)} 
                            className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
                          >
                              <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => initiateDelete(q.id, q.title)} 
                            className="px-3 py-2 rounded-lg bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 transition"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
                onClick={() => setDeleteModal({ show: false, id: null, title: '' })}
              />
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500 border border-red-500/20">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">Delete Quiz?</h3>
                  <p className="text-slate-400 text-center text-sm mb-6">
                      Are you sure you want to delete <span className="text-white font-bold">"{deleteModal.title}"</span>? 
                      <br/>This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setDeleteModal({ show: false, id: null, title: '' })}
                          className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-900/20 transition"
                      >
                          Yes, Delete
                      </button>
                  </div>
                  <button onClick={() => setDeleteModal({ show: false, id: null, title: '' })} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
              </div>
          </div>
      )}
    </div>
  );
};

const UsersIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default QuizList;