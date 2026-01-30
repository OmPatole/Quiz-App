import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { Trophy, Calendar, ArrowRight, Medal, Search, BarChart3, Clock, ArrowLeft, ArrowUpDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const LeaderboardList = () => {
  const navigate = useNavigate(); // Initialize hook
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('newest'); 

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get('http://localhost:3001/api/quizzes', { headers });
      setQuizzes(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leaderboards");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes
    .filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || quiz.quizType === filterType;
        return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const toggleSort = () => {
      setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Trophy size={18} className="text-white" />
            </div>
            <span>Quizzer<span className="text-slate-500">.io</span></span>
          </Link>
          
          {/* UPDATED: Functional Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition bg-slate-900/50 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400">
                Hall of Fame
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                See who's topping the charts in Aptitude & Reasoning. Compete with your peers and improve your rank!
            </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search for a challenge..." 
                    className="w-full pl-12 p-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 outline-none transition text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 shrink-0">
                <button 
                    onClick={toggleSort}
                    className="px-4 py-2 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2"
                >
                    <ArrowUpDown size={16} />
                    {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </button>

                {['all', 'weekly', 'mock'].map(type => (
                    <button 
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-xl font-bold capitalize transition border ${
                            filterType === type 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        {/* LIST */}
        <div className="grid gap-4">
            {filteredQuizzes.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                    <Trophy size={48} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-500 font-medium">No leaderboards found matching your criteria.</p>
                </div>
            ) : (
                filteredQuizzes.map(quiz => (
                    <div key={quiz.id} className="group bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-purple-500/40 transition-all flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                            quiz.quizType === 'weekly' ? 'bg-purple-900/20 text-purple-400' : 'bg-blue-900/20 text-blue-400'
                        }`}>
                            {quiz.quizType === 'weekly' ? <Calendar size={32} /> : <Medal size={32} />}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                    quiz.quizType === 'weekly' ? 'border-purple-500/30 text-purple-400' : 'border-blue-500/30 text-blue-400'
                                }`}>
                                    {quiz.quizType}
                                </span>
                                {quiz.questions && (
                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                        <BarChart3 size={10} /> {quiz.questions.length} Qs
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                            
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                                {quiz.quizType === 'weekly' && quiz.schedule?.start ? (
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> 
                                        {new Date(quiz.schedule.start).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} /> Created: {new Date(quiz.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link 
                            to={`/leaderboard/${quiz.id}`}
                            className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition group-hover:scale-105"
                        >
                            View Rankings <ArrowRight size={18} />
                        </Link>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardList;