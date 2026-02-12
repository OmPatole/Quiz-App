import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, Clock, Award, Library, Menu, X, User, ArrowRight, Play, FileText, CheckCircle2, Flame, Calendar, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StudentLibrary from './StudentLibrary';
import WeeklyQuizzes from './WeeklyQuizzes';
import StudentProfile from '../components/StudentProfile';
import Logo from '../components/common/Logo';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [chapters, setChapters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, library, profile
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [profileStats, setProfileStats] = useState(null);
    const [recentMaterials, setRecentMaterials] = useState([]);

    const navigate = useNavigate();

    // Motivational Quotes
    const quotes = [
        "Success is the sum of small efforts repeated.",
        "The expert in anything was once a beginner.",
        "Don't wish for it. Work for it.",
        "Your only limit is your mind.",
        "Logic will get you from A to B. Imagination will take you everywhere."
    ];
    const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Parallel Fetching for Dashboard
            const [chaptersRes, statsRes, materialRes] = await Promise.all([
                api.get('/chapters'),
                api.get(`/admin/student-stats/${user.id}`).catch(() => ({ data: { stats: {} } })), // Fail gracefully if stats error
                api.get('/material').catch(() => ({ data: [] }))
            ]);

            setChapters(chaptersRes.data);
            setProfileStats(statsRes.data);
            setRecentMaterials(materialRes.data.slice(0, 5)); // Top 5
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        console.log('Starting quiz with ID:', quizId);
        if (!quizId) {
            console.error("Quiz ID is missing!");
            return;
        }
        navigate(`/student/quiz/${quizId}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const filteredChapters = chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
                            { id: 'weekly', label: 'Weekly Quizzes', icon: Calendar },
                            { id: 'library', label: 'Library', icon: Library },
                            { id: 'profile', label: 'Profile', icon: User },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-neutral-800 text-white shadow-sm'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white hover:bg-neutral-800 rounded-lg"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`md:hidden absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 transition-all duration-300 ease-in-out shadow-2xl ${isMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <div className="px-4 py-4 space-y-2">
                        <button onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                            <BookOpen className="w-5 h-5" /> Dashboard
                        </button>
                        <button onClick={() => { setActiveTab('weekly'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'weekly' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                            <Calendar className="w-5 h-5" /> Weekly Quizzes
                        </button>
                        <button onClick={() => { setActiveTab('library'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                            <Library className="w-5 h-5" /> Library
                        </button>
                        <button onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                            <User className="w-5 h-5" /> Profile
                        </button>
                        <div className="pt-2 border-t border-neutral-800">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-neutral-800">
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-32 animate-in fade-in duration-500">
                {activeTab === 'dashboard' && (
                    <>
                        {/* 1. Welcome Hero Section */}
                        <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-900/20 transition-all duration-700"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">
                                        <Flame className="w-4 h-4" /> Daily Motivation
                                        {(profileStats?.student?.currentStreak > 0 || user?.currentStreak > 0) && (
                                            <span className="ml-4 flex items-center gap-1 text-blue-500">
                                                <Flame className="w-4 h-4 fill-current" />
                                                {profileStats?.student?.currentStreak || user.currentStreak} Day Streak
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                                        Welcome back, {user?.name.split(' ')[0]}!
                                    </h2>
                                    <p className="text-neutral-400 italic font-medium max-w-xl">
                                        "{dailyQuote}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Continue Learning
                                </button>
                            </div>
                        </div>

                        {/* 2. "Your Progress" Strip */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                            {/* Card 1 */}
                            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-blue-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-neutral-500 text-xs font-bold uppercase">Quizzes Crushed</p>
                                    <h3 className="text-2xl font-bold text-white">{profileStats?.stats?.totalTests || 0}</h3>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-blue-400">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-neutral-500 text-xs font-bold uppercase">Avg. Accuracy</p>
                                    <h3 className="text-2xl font-bold text-white">{profileStats?.stats?.accuracy || 0}%</h3>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-blue-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-neutral-500 text-xs font-bold uppercase">Batch Rank</p>
                                    <h3 className="text-2xl font-bold text-white">#--</h3>
                                </div>
                            </div>
                        </div>

                        {/* 3. Curriculum Grid */}
                        <div id="curriculum" className="mb-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-blue-400" />
                                        Learning Modules
                                    </h3>
                                    <p className="text-sm text-neutral-500 mt-1">Select a module to practice</p>
                                </div>

                                <div className="relative group max-w-md w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search modules (e.g. Quantitative, Logical...)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredChapters.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredChapters.map((chapter) => {
                                        const completedCount = chapter.quizzes?.filter(q => profileStats?.completedQuizIds?.includes(q._id)).length || 0;
                                        const totalCount = chapter.quizzes?.length || 0;
                                        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                                        return (
                                            <div
                                                key={chapter._id}
                                                className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer relative overflow-hidden"
                                                onClick={() => navigate(`/student/chapter/${chapter._id}`)}
                                            >
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                                    <BookOpen className="w-32 h-32 text-blue-400" />
                                                </div>

                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <BookOpen className="w-6 h-6" />
                                                    </div>

                                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                        {chapter.title}
                                                    </h4>

                                                    <p className="text-neutral-500 text-sm mb-6">
                                                        {chapter.quizzes?.length || 0} Quizzes Available
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between text-xs text-neutral-400 mb-2">
                                                            <span>Progress</span>
                                                            <span>{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-full rounded-full group-hover:bg-blue-500 transition-all duration-1000"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex items-center text-sm font-medium text-blue-400 group-hover:translate-x-2 transition-transform duration-300">
                                                        Start Learning <ArrowRight className="w-4 h-4 ml-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-neutral-900 rounded-3xl border border-neutral-800 border-dashed">
                                    <p className="text-neutral-500">No learning modules assigned yet.</p>
                                </div>
                            )}
                        </div>

                        {/* 4. Study Library Preview */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Library className="w-5 h-5 text-blue-400" />
                                    New in Library
                                </h3>
                                <button onClick={() => setActiveTab('library')} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {recentMaterials.length > 0 ? (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                    {recentMaterials.map((mat) => (
                                        <div key={mat._id} className="min-w-[240px] bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-blue-500/30 transition-all group cursor-pointer">
                                            <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 mb-3 group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1 truncate">{mat.title}</h4>
                                            <p className="text-xs text-neutral-500 mb-3">{mat.category}</p>
                                            <a
                                                href={`http://localhost:5000/${mat.filePath}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-blue-400 group-hover:underline"
                                            >
                                                Read PDF
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-neutral-500 italic">No study materials available.</div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'weekly' && <WeeklyQuizzes completedQuizIds={profileStats?.completedQuizIds} />}

                {activeTab === 'library' && <StudentLibrary />}

                {activeTab === 'profile' && (
                    <StudentProfile
                        student={user}
                        stats={profileStats}
                        onBack={() => setActiveTab('dashboard')}
                    />
                )}
            </main>
        </div >
    );
};

export default StudentDashboard;
