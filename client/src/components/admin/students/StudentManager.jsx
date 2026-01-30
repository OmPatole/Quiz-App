import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Layers, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentManager = ({ onSelectStudent }) => {
  
  // Sidebar Data
  const [gradYears, setGradYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  
  // Filter Data
  const [academicYear, setAcademicYear] = useState('First Year'); // Default
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGradYears();
  }, []);

  // Fetch students when year or academic filter changes
  useEffect(() => {
    if (selectedYear) {
        fetchStudents({ gradYear: selectedYear, academicYear });
    }
  }, [selectedYear, academicYear]);

  const fetchGradYears = async () => {
      try {
          const res = await axios.get('http://localhost:3001/api/admin/grad-years', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setGradYears(res.data);
          // Auto-select latest year if available
          if (res.data.length > 0 && !selectedYear) {
              setSelectedYear(res.data[res.data.length - 1]);
          }
      } catch (e) { console.error(e); }
  };

  const fetchStudents = async (filters) => {
      setLoading(true);
      try {
          const res = await axios.post('http://localhost:3001/api/admin/students/filter', filters, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setStudents(res.data);
      } catch (e) { toast.error("Failed to load students"); }
      finally { setLoading(false); }
  };

  // Group Students by Branch for Display
  const studentsByBranch = students.reduce((acc, student) => {
      const branch = student.branch || 'Unassigned';
      if (!acc[branch]) acc[branch] = [];
      acc[branch].push(student);
      return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in">
        
        {/* SIDEBAR (Years) */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14}/> Graduation Years
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {gradYears.length === 0 && <div className="p-4 text-slate-600 text-sm text-center">No classes found. Upload students or wait for signups.</div>}
                {gradYears.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition ${
                            selectedYear === year 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                    >
                        Class of {year}
                        {selectedYear === year && <ChevronRight size={14}/>}
                    </button>
                ))}
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
            
            {/* Header / Tabs */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {selectedYear ? `Class of ${selectedYear}` : 'Select a Class'}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        {students.length} Students found
                    </p>
                </div>

                {/* Academic Year Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {['First Year', 'Second Year', 'Third Year', 'Fourth Year'].map(yr => (
                        <button
                            key={yr}
                            onClick={() => setAcademicYear(yr)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                                academicYear === yr ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {yr.split(' ')[0]} {/* Show "First", "Second"... */}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-slate-500">Loading...</div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <Users size={48} className="mb-4 opacity-50"/>
                        <p>No students found for this selection.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.keys(studentsByBranch).map(branch => (
                            <div key={branch} className="animate-in slide-in-from-bottom-2">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Layers size={14}/> {branch}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {studentsByBranch[branch].map(s => (
                                        <div 
                                            key={s.prn} 
                                            onClick={() => onSelectStudent(s)}
                                            className="group p-4 bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-xl cursor-pointer transition hover:shadow-lg hover:shadow-purple-900/10"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition">
                                                    {s.name.charAt(0)}
                                                </div>
                                                {/* Optional: Indicator for self-signup if you still want to see it, but it's part of the main list now */}
                                                {s.registrationType === 'self-signup' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800">Self</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-white truncate">{s.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{s.prn}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default StudentManager;