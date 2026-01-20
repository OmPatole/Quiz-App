import React from 'react';
import { Edit, Trash2, Clock, Layers } from 'lucide-react';

const QuizCard = ({ quiz, onEdit, onDelete }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition flex flex-col group hover:shadow-xl hover:shadow-purple-900/10">
        <div className="flex justify-between mb-4">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${quiz.quizType==='mock'?'bg-blue-900/30 text-blue-400':'bg-green-900/30 text-green-400'}`}>{quiz.quizType}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => onEdit(quiz.id)} className="text-slate-400 hover:text-white"><Edit size={16}/></button>
                <button onClick={() => onDelete(quiz.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{quiz.title}</h3>
        <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Clock size={12}/> {quiz.duration > 0 ? `${quiz.duration}m` : 'Unlimited'}</span>
            <span className="flex items-center gap-1"><Layers size={12}/> {quiz.questionCount} Qs</span>
        </div>
    </div>
  );
};

export default QuizCard;