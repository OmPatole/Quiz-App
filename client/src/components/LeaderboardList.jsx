import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Calendar, ChevronRight, BarChart3, Medal } from 'lucide-react';

const LeaderboardList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/quizzes')
      .then(res => {
        setQuizzes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        Loading Leaderboards...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <Trophy className="text-yellow-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hall of Fame</h1>
            <p className="text-slate-400">Select a quiz to view the top performers.</p>
          </div>
        </div>

        {/* Grid */}
        {quizzes.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            No quizzes available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Link 
                to={`/leaderboard/${quiz.id}`} 
                key={quiz.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-900/10 block overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-900/20 group-hover:text-purple-400 transition-colors">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {quiz.questionCount} Qs
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        {quiz.title}
                    </h3>
                    
                    <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                        <Calendar size={14} /> 
                        {new Date(quiz.schedule.start).toLocaleDateString()}
                    </div>

                    <div className="flex items-center text-sm font-bold text-slate-300 group-hover:translate-x-1 transition-transform">
                        View Rankings <ChevronRight size={16} className="ml-1" />
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardList;