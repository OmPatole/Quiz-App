import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

const StudentList = ({ batchName, students, onBack, onSelectStudent, onDeleteStudent }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition"><ArrowLeft size={18}/></button>
            <div>
                <h2 className="text-2xl font-bold">{batchName}</h2>
                <p className="text-slate-400 text-sm">Total Students: {students.length}</p>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">PRN</th>
                            <th className="px-6 py-4">Branch</th>
                            <th className="px-6 py-4">Year</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                                <td className="px-6 py-4 font-medium text-white">
                                    <button onClick={() => onSelectStudent(student)} className="hover:text-purple-400 hover:underline flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-[10px] text-purple-200">{student.name.charAt(0)}</div>
                                        {student.name}
                                    </button>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-500">{student.prn}</td>
                                <td className="px-6 py-4">{student.branch}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${student.year.includes('Third')?'bg-yellow-900/20 text-yellow-400':'bg-slate-800 text-slate-400'}`}>{student.year}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onDeleteStudent(student._id)} className="text-slate-600 hover:text-red-400 transition"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default StudentList;