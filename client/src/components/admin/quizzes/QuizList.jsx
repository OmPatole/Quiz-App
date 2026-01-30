import React from 'react';
import { Plus, FileJson, Edit, Trash2, Clock, HelpCircle, FileText } from 'lucide-react';

const QuizList = ({ quizzes, onCreateNew, onEditQuiz, onDeleteQuiz, onImportJson }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION WITH ACTION BUTTONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Quiz Dashboard</h2>
          <p className="text-slate-400 mt-1">Manage assessments and track performance</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* OPTION 1: UPLOAD JSON */}
          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer transition border border-slate-700 font-medium group">
            <FileJson size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Import JSON</span>
            {/* Hidden Input for File Upload */}
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={onImportJson} 
            />
          </label>

          {/* OPTION 2: CREATE MANUALLY */}
          <button 
            onClick={onCreateNew}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition font-bold shadow-lg shadow-purple-900/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* --- QUIZ GRID DISPLAY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-600" />
            </div>
            <p className="text-lg font-medium">No quizzes found</p>
            <p className="text-sm">Get started by creating a new quiz or importing one.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="group relative bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="pr-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">{quiz.title}</h3>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                           ID: {quiz.id}
                        </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        quiz.quizType === 'mock' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                        {quiz.quizType}
                    </span>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <HelpCircle size={14} className="text-purple-500"/>
                        <span className="text-slate-200 font-medium">{quiz.questions ? quiz.questions.length : 0}</span> Qs
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500"/>
                        <span className="text-slate-200 font-medium">{quiz.duration}</span> mins
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button 
                        onClick={() => onEditQuiz(quiz.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition group-hover:bg-slate-800/80"
                    >
                        <Edit size={14} /> Edit
                    </button>
                    <button 
                        onClick={() => onDeleteQuiz(quiz.id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 rounded-lg transition"
                        title="Delete Quiz"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;