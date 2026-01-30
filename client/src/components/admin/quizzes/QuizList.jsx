import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Clock, Calendar, ChevronRight, BrainCircuit, FileText, AlertCircle, Layers, ChevronDown, BarChart3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- UI STATES ---
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // --- FILTER STATES ---
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'mock'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No token");

        const storedStudent = JSON.parse(localStorage.getItem('student_data') || '{}');
        setStudent(storedStudent);

        const res = await axios.get('http://localhost:3001/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setQuizzes(res.data);
      } catch (error) {
        console.error(error);
        localStorage.clear();
        if(setIsAuth) setIsAuth(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, setIsAuth]);

  const handleLogout = () => {
    localStorage.clear();
    if(setIsAuth) setIsAuth(false);
    navigate('/login');
  };

  const handleStartQuiz = async (quizId) => {
    try {
        const token = localStorage.getItem('token');
        const prn = student?.prn;
        const check = await axios.post('http://localhost:3001/api/check-attempt', 
            { quizId, prn },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (check.data.attempted) {
            toast.error("Already attempted.");
        } else {
            navigate(`/quiz/${quizId}`);
        }
    } catch (e) {
        toast.error("Unable to start.");
    }
  };

  // --- STRICT FILTERING LOGIC (REMOVED CATEGORY CHECK) ---
  const filteredQuizzes = quizzes.filter(q => q.quizType === activeTab);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      <Toaster position="top-right" />
      
      {/* NAVBAR */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* BRANDING */}
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <BrainCircuit size={18} className="text-white rotate-90" />
                </div>
                <span>Quizzer<span className="text-slate-500">.io</span></span>
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 hover:bg-slate-800/50 p-1.5 pr-3 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-700/50"
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-purple-600 to-blue-600">
                        <span className="font-bold text-sm">{student?.name?.charAt(0)}</span>
                    </div>
                    <div className="text-left hidden sm:block">
                        <div className="font-bold text-sm leading-tight text-white">{student?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                            {student?.prn}
                        </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}/>
                </button>

                {/* DROPDOWN MENU */}
                {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-sm font-bold text-white truncate">{student?.name}</p>
                        </div>
                        <div className="p-2">
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                            >
                                <BarChart3 size={16} className="text-purple-400"/>
                                My Statistics
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 hover:text-red-300 transition"
                            >
                                <LogOut size={16}/>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* EXAM TYPE TABS */}
        <div className="flex gap-6 mb-8 border-b border-slate-800/50 pb-1">
            <button 
                onClick={() => setActiveTab('weekly')}
                className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'weekly' 
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
                <Calendar size={16}/> Weekly Exams
            </button>
            <button 
                onClick={() => setActiveTab('mock')}
                className={`pb-3 px-1 text-sm font-bold flex items-center gap-2 transition border-b-2 ${
                    activeTab === 'mock' 
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
                <FileText size={16}/> Mock Tests
            </button>
        </div>

        {/* QUIZ GRID */}
        {filteredQuizzes.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 animate-in fade-in duration-500">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                    <Layers size={28}/>
                </div>
                <h3 className="text-lg font-bold text-slate-300">No {activeTab} tests found</h3>
                <p className="text-slate-500 text-sm mt-1">Check back later for new assignments.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map(quiz => (
                    <div key={quiz.id} className="group bg-slate-900 border border-slate-800/80 rounded-3xl p-6 hover:border-slate-600 transition-all flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />
                        
                        <div className="flex justify-between items-start mb-5">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                {quiz.quizType}
                            </span>
                            <div className="text-slate-500 text-xs font-mono bg-slate-950 px-2 py-1 rounded-md">{quiz.questions.length} Qs</div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-300">
                            {quiz.title}
                        </h3>
                        
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                <Clock size={14} className="text-slate-600"/> 
                                <span>{Math.floor(quiz.duration / 60)}h {quiz.duration % 60}m limit</span>
                            </div>
                            {quiz.quizType === 'weekly' && quiz.schedule && (
                                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                    <AlertCircle size={14} className="text-slate-600"/>
                                    <span className="truncate">Deadline: {new Date(quiz.schedule.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20"
                        >
                            Start Assessment <ChevronRight size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;