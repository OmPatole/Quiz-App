import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Clock, CheckCircle, Briefcase, TrendingUp, BrainCircuit, LayoutDashboard } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'Admin' ? '/admin' : '/student';

    return (
        <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative overflow-hidden pt-40 pb-40">
                    {/* Single Centered Glowing Circle - Background Layer (z-0) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-3xl pointer-events-none z-0"></div>

                    {/* Text Content - Foreground Layer (z-10) with TRANSPARENT background */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center bg-transparent">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-10 leading-tight text-white">
                            The Ultimate <span className="text-yellow-400">Aptitude Quiz</span> Portal
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
                            Master quantitative, logical, and verbal reasoning. An initiative by the Training & Placement Cell, School of Engineering & Technology.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <Link to={dashboardLink} className="bg-yellow-500 hover:bg-yellow-400 text-black text-lg px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center min-w-[200px] shadow-xl shadow-yellow-900/20 hover:scale-105 flex items-center justify-center gap-2">
                                    <LayoutDashboard className="w-5 h-5" />
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="bg-yellow-500 hover:bg-yellow-400 text-black text-lg px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center min-w-[200px] shadow-xl shadow-yellow-900/20 hover:scale-105">
                                    Start Practice Quiz
                                </Link>
                            )}

                            <a href="#features" className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-lg px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center min-w-[200px]">
                                Explore Features
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 text-white">Start Your Journey</h2>
                            <p className="text-neutral-400">Comprehensive tools designed to boost your placement readiness.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 gap-y-6 h-auto md:h-[600px]">
                            {/* Feature 1: Large Left - Live Quizzes */}
                            <div className="col-span-1 md:col-span-2 row-span-2 bg-neutral-900 rounded-3xl p-10 border border-neutral-800 hover:border-yellow-900/50 transition-all duration-300 group relative overflow-hidden shadow-2xl shadow-black/50">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Clock className="w-64 h-64 text-yellow-400" />
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="w-16 h-16 bg-neutral-950 rounded-2xl flex items-center justify-center mb-8 text-yellow-400 border border-neutral-800 group-hover:border-yellow-900/50 transition-colors">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-yellow-400 transition-colors">Live Quizzes & Mocks</h3>
                                        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                                            Participate in scheduled weekly assessments and full-length mock exams. Experience real exam conditions with strict timers.
                                        </p>
                                        <ul className="space-y-4">
                                            {['Chapter-wise Tests', 'Weekly Leaderboards', 'Real-time Ranking'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-neutral-300 font-medium">
                                                    <div className="bg-yellow-900/30 p-1 rounded-full">
                                                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2: Top Right - Analysis */}
                            <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 hover:border-yellow-900/50 transition-all duration-300 group shadow-xl">
                                <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center mb-6 text-yellow-400 border border-neutral-800 group-hover:border-yellow-900/50 transition-colors">
                                    <BarChart2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">Instant Results</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Get detailed performance analysis immediately. Visualize your growth curve and identify topics that need improvement.
                                </p>
                            </div>

                            {/* Feature 3: Bottom Right - Library */}
                            <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 hover:border-yellow-900/50 transition-all duration-300 group shadow-xl">
                                <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center mb-6 text-yellow-400 border border-neutral-800 group-hover:border-yellow-900/50 transition-colors">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">Study Library</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Access a curated central repository of PDF notes, cheat sheets, and previous year papers organized systematically.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Section: Why Upgrade Aptitude? */}
                <section className="py-24 bg-neutral-900 border-t border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                                Why Aptitude Matters for Your Career?
                            </h2>
                            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-6">
                            {/* Card 1 */}
                            <div className="flex flex-col items-center group">
                                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6 border border-neutral-700 group-hover:border-yellow-500 group-hover:scale-110 transition-all duration-300 shadow-xl">
                                    <Briefcase className="w-10 h-10 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Placement Ready</h3>
                                <p className="text-neutral-400 leading-relaxed max-w-sm mx-auto">
                                    80% of top companies (TCS, Infosys, Wipro) use aptitude tests as their first elimination round. Master it here.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="flex flex-col items-center group">
                                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6 border border-neutral-700 group-hover:border-yellow-500 group-hover:scale-110 transition-all duration-300 shadow-xl">
                                    <TrendingUp className="w-10 h-10 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Competitive Edge</h3>
                                <p className="text-neutral-400 leading-relaxed max-w-sm mx-auto">
                                    Ace exams like GATE, CAT, and GRE with sharp logical reasoning and quantitative skills.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="flex flex-col items-center group">
                                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6 border border-neutral-700 group-hover:border-yellow-500 group-hover:scale-110 transition-all duration-300 shadow-xl">
                                    <BrainCircuit className="w-10 h-10 text-yellow-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Real-World Logic</h3>
                                <p className="text-neutral-400 leading-relaxed max-w-sm mx-auto">
                                    Enhance your problem-solving speed and accuracy—skills that define great engineers.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
