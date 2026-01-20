import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Brain, Code, Clock, ArrowLeft, LogOut, FileText, Trophy, Play } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [selectedType, setSelectedType] = useState(null); 

  useEffect(() => {
    const stored = localStorage.getItem('quiz_student_info') || sessionStorage.getItem('quiz_student_info');
    if (!stored) {
        navigate('/student-login');
        return;
    }
    setUserInfo(JSON.parse(stored));
    
    axios.get('http://localhost:3001/api/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(() => toast.error("Failed to load quizzes"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const getFilteredQuizzes = () => {
    return quizzes.filter(q => {
        if (q.category !== selectedCategory) return false;
        if (selectedCategory === 'aptitude' && q.quizType !== selectedType) return false;
        if (selectedCategory === 'coding') return true; 
        return true;
    });
  };

  // --- FIXED NAVIGATION LOGIC ---
  const handleReset = () => {
    if (selectedType && selectedCategory === 'aptitude') {
        // If in Mock/Weekly menu, go back to Category selection is WRONG based on user request.
        // User said: "if i press back... it should take me back to mock or weekly"
        // WAIT: User said "if i am in mock quiz menu... takes me back to main menu... instead it should take me back to mock or weekly".
        // This implies they are in the QUIZ LIST.
        
        // My Logic:
        // Level 1: Category Selection (Apti/Coding)
        // Level 2: Type Selection (Mock/Weekly) -> Only for Aptitude
        // Level 3: Quiz List
        
        // If I am at Level 3 (Quiz List), back should go to Level 2.
        setSelectedType(null);
    } else {
        // If I am at Level 2 or Coding List, go back to Level 1
        setSelectedCategory(null);
        setSelectedType(null);
    }
  };

  const OptionCard = ({ icon, title, desc, onClick, color }) => (
    <div onClick={onClick} className={`group bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-${color}-500/50 flex flex-col items-center text-center h-full justify-center min-h-[250px]`}>
        <div className={`mb-6 w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center text-${color}-500 group-hover:scale-110 transition border border-slate-800 group-hover:border-${color}-500/30 shadow-lg`}>
            {icon}
        </div>
        <h3 className="text-3xl font-extrabold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        <Toaster position="top-right" toastOptions={{style: {background: '#1e293b', color: '#fff'}}}/>
        
        {/* Navbar */}
        <header className="px-8 py-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    {(selectedCategory) && (
                        <button onClick={handleReset} className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 border border-slate-800 transition text-slate-400 hover:text-white group" title="Go Back">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                        </button>
                    )}
                    <div>
                        {/* BOLDER AND BIGGER PROFILE INFO */}
                        <h1 className="text-3xl font-black text-white tracking-tight">Hi, {userInfo?.name?.split(' ')[0]} 👋</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-500/30 rounded text-purple-300 text-xs font-bold uppercase tracking-wider">
                                {userInfo?.year}
                            </span>
                            <span className="text-slate-500 font-mono text-sm font-bold tracking-wider">
                                {userInfo?.prn}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/study" className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:text-white text-slate-400 hover:border-slate-700 transition flex items-center gap-2">
                        <FileText size={18}/> Study Material
                    </Link>
                    <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition border border-transparent hover:border-red-900/50">
                        <LogOut size={24}/>
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
            <div className="max-w-6xl w-full">
                
                {/* 1. CATEGORY SELECTION */}
                {!selectedCategory && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                        <h2 className="text-4xl font-black text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">What do you want to practice?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <OptionCard icon={<Brain size={48}/>} title="Aptitude" color="purple" desc="Quantitative, Logical & Verbal Reasoning" onClick={() => setSelectedCategory('aptitude')} />
                            <OptionCard icon={<Code size={48}/>} title="Coding Club" color="blue" desc="Algorithms, Data Structures & Competitive Coding" onClick={() => { setSelectedCategory('coding'); setSelectedType('weekly'); }} />
                        </div>
                    </div>
                )}

                {/* 2. TYPE SELECTION (Aptitude Only) */}
                {selectedCategory === 'aptitude' && !selectedType && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                        <h2 className="text-4xl font-black text-center mb-12 text-white">Select Mode</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <OptionCard icon={<Clock size={48}/>} title="Mock Tests" color="blue" desc="Unlimited attempts • No Timer Enforcement • Practice" onClick={() => setSelectedType('mock')} />
                            <OptionCard icon={<Trophy size={48}/>} title="Weekly Live" color="yellow" desc="One Attempt • Strict Timer • Global Ranking" onClick={() => setSelectedType('weekly')} />
                        </div>
                    </div>
                )}

                {/* 3. QUIZ LIST */}
                {(selectedType || selectedCategory === 'coding') && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto w-full">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black flex items-center justify-center gap-3">
                                {selectedCategory === 'coding' ? <Code className="text-blue-500" size={32}/> : (selectedType === 'mock' ? <Clock className="text-blue-400" size={32}/> : <Trophy className="text-yellow-500" size={32}/>)}
                                {selectedCategory === 'coding' ? "Coding Challenges" : (selectedType === 'mock' ? "Practice Mock Tests" : "Weekly Competitions")}
                            </h2>
                            <p className="text-slate-500 mt-2 font-medium">Select an exam to begin. Good luck!</p>
                        </div>

                        <div className="grid gap-5">
                            {getFilteredQuizzes().map(q => (
                                <div key={q.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-slate-600 transition group hover:shadow-xl hover:shadow-purple-900/5">
                                    <div className="text-center sm:text-left w-full">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition">{q.title}</h3>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                            <Badge icon={<FileText size={12}/>} text={`${q.questionCount} Questions`} />
                                            <Badge icon={<Clock size={12}/>} text={q.duration > 0 ? `${q.duration} Mins` : 'Unlimited Time'} />
                                            {q.quizType !== 'mock' && <Badge text={new Date(q.schedule.start).toLocaleDateString()} />}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full sm:w-auto shrink-0">
                                        <Link to={`/leaderboard/${q.id}`} className="flex-1 sm:flex-none px-6 py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition flex items-center justify-center gap-2">
                                            <Trophy size={18}/> Rank
                                        </Link>
                                        <Link to={`/quiz/${q.id}`} className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 hover:scale-105 transform">
                                            <Play size={18}/> Start
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {getFilteredQuizzes().length === 0 && (
                                <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 text-slate-500 font-medium">
                                    No active quizzes found in this category right now.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
};

const Badge = ({ icon, text }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wide">
        {icon} {text}
    </span>
);

export default StudentDashboard;