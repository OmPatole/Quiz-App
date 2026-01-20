import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, AlertCircle, Play, Trophy, ArrowLeft, Lock, TimerReset, User, Users } from 'lucide-react';

const QuizDashboard = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Fetch Quizzes
    axios.get('http://localhost:3001/api/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Live Timer
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatus = (schedule) => {
    // Safety check for missing schedule
    if (!schedule || !schedule.start || !schedule.end) {
        return { status: 'ERROR', color: 'text-red-500', bg: 'bg-red-500/10', canJoin: false, label: 'Invalid Date' };
    }

    const start = new Date(schedule.start);
    const end = new Date(schedule.end);

    if (now.getTime() < start.getTime()) {
      return { 
        status: 'UPCOMING', 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-400/10',
        canJoin: false,
        label: `Starts ${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
      };
    }
    
    if (now.getTime() > end.getTime()) {
      return { 
        status: 'EXPIRED', 
        color: 'text-red-400', 
        bg: 'bg-red-400/10',
        canJoin: false,
        label: 'Exam Ended'
      };
    }

    return { 
      status: 'LIVE', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10',
      canJoin: true,
      label: 'Join Exam Now'
    };
  };

  const handleJoin = (quiz) => {
    if (!quiz.id) {
        alert("Error: Invalid Quiz ID");
        return;
    }
    navigate(`/quiz/${quiz.id}`); 
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Student Dashboard</h1>
            <p className="text-slate-400">Select an active quiz to begin.</p>
          </div>
          <Link to="/" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-bold text-slate-300 transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-20 animate-pulse">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl text-slate-300 font-bold">No Quizzes Scheduled</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const { status, color, bg, canJoin, label } = getStatus(quiz.schedule);
              
              return (
                <div key={quiz.id} className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all shadow-lg flex flex-col group ${canJoin ? 'hover:border-purple-500/50 hover:shadow-purple-900/10' : 'opacity-70'}`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 ${bg} ${color}`}>
                      {status === 'LIVE' && <span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                      {status}
                    </span>
                    <Link to={`/leaderboard/${quiz.id}`} className="text-slate-600 hover:text-yellow-400 transition p-1 hover:bg-slate-800 rounded-full">
                      <Trophy size={18} />
                    </Link>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{quiz.title}</h3>
                  
                  {/* --- NEW: CREATOR & YEAR INFO --- */}
                  <div className="flex gap-2 mb-4">
                     <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center gap-1 border border-slate-700">
                        <User size={10}/> {quiz.createdBy || 'Admin'}
                     </span>
                     <span className="text-[10px] bg-purple-900/20 px-2 py-1 rounded text-purple-300 flex items-center gap-1 border border-purple-500/20">
                        <Users size={10}/> {quiz.targetYears && quiz.targetYears.length > 0 ? quiz.targetYears.join(', ') : 'All Years'}
                     </span>
                  </div>

                  <div className="space-y-3 mt-4 text-sm text-slate-400 mb-8 flex-1 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={14} className="text-purple-500" />
                      <span>{new Date(quiz.schedule.start).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={14} className="text-purple-500" />
                      <span className="text-xs">
                        {new Date(quiz.schedule.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                        {new Date(quiz.schedule.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleJoin(quiz)}
                    disabled={!canJoin}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      canJoin 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transform hover:-translate-y-1' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {canJoin ? <Play size={18} fill="currentColor"/> : (status === 'EXPIRED' ? <Lock size={16}/> : <TimerReset size={16}/>)}
                    {label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;