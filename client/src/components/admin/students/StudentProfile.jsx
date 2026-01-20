import React from 'react';
import { ArrowLeft, Code, GraduationCap, CheckSquare, BarChart2 } from 'lucide-react';

const StudentProfile = ({ student, stats, onBack }) => {
  if (!student || !stats) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"><ArrowLeft size={18}/></button>
            <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <div className="flex gap-3 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Code size={12}/> {student.prn}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><GraduationCap size={12}/> {student.branch}</span>
                </div>
            </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-900/20 flex items-center justify-center text-green-400"><CheckSquare size={24}/></div>
                <div>
                    <div className="text-2xl font-bold text-white">{stats.stats.weeklyCount}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Weekly Quizzes</div>
                </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400"><BarChart2 size={24}/></div>
                <div>
                    <div className="text-2xl font-bold text-white">{stats.stats.mockCount}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Mock Tests</div>
                </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-400"><GraduationCap size={24}/></div>
                <div>
                    <div className="text-2xl font-bold text-white">{stats.stats.avgScore}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Avg. Score</div>
                </div>
            </div>
        </div>

        {/* HISTORY TABLE */}
        <h3 className="text-lg font-bold mb-4">Quiz History</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                    <tr>
                        <th className="px-6 py-4">Quiz Title</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.history.map((h, i) => (
                        <tr key={i} className="border-b border-slate-800">
                            <td className="px-6 py-4 font-medium text-white">{h.quizTitle}</td>
                            <td className="px-6 py-4"><span className="uppercase text-[10px] font-bold px-2 py-1 rounded bg-slate-800">{h.quizType}</span></td>
                            <td className="px-6 py-4">{new Date(h.submittedAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-400">{h.score}</td>
                        </tr>
                    ))}
                    {stats.history.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-500">No quizzes attempted yet.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StudentProfile;