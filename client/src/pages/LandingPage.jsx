import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Clock, CheckCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
            {/* Navbar */}
            <nav className="border-b border-emerald-900/20 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="text-emerald-500">Aptitude</span>Portal
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-neutral-400 hover:text-emerald-400 font-medium transition-colors">
                            Login
                        </Link>
                        <Link to="/login" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 text-sm shadow-lg shadow-emerald-900/20">
                            Get Started <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative overflow-hidden pt-32 pb-32">
                    {/* Background Bloom */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-white">
                            The Ultimate <span className="text-emerald-500">Aptitude Quiz</span> Portal
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                            Master quantitative, logical, and verbal reasoning. An initiative by the Training & Placement Cell, School of Engineering & Technology.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center min-w-[200px] shadow-xl shadow-emerald-900/20 hover:scale-105">
                                Start Practice Quiz
                            </Link>
                            <a href="#features" className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-lg px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto text-center min-w-[200px]">
                                Explore Features
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-24 bg-neutral-950 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4 text-white">Start Your Journey</h2>
                            <p className="text-neutral-400">Comprehensive tools designed to boost your placement readiness.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                            {/* Feature 1: Large Left - Live Quizzes */}
                            <div className="col-span-1 md:col-span-2 row-span-2 bg-neutral-900 rounded-3xl p-10 border border-neutral-800 hover:border-emerald-900/50 transition-all duration-300 group relative overflow-hidden shadow-2xl shadow-black/50">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Clock className="w-64 h-64 text-emerald-500" />
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="w-16 h-16 bg-neutral-950 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 border border-neutral-800 group-hover:border-emerald-900/50 transition-colors">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">Live Quizzes & Mocks</h3>
                                        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                                            Participate in scheduled weekly assessments and full-length mock exams. Experience real exam conditions with strict timers.
                                        </p>
                                        <ul className="space-y-4">
                                            {['Chapter-wise Tests', 'Weekly Leaderboards', 'Real-time Ranking'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-neutral-300 font-medium">
                                                    <div className="bg-emerald-900/30 p-1 rounded-full">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2: Top Right - Analysis */}
                            <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 hover:border-emerald-900/50 transition-all duration-300 group shadow-xl">
                                <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 border border-neutral-800 group-hover:border-emerald-900/50 transition-colors">
                                    <BarChart2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">Instant Results</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Get detailed performance analysis immediately. Visualize your growth curve and identify topics that need improvement.
                                </p>
                            </div>

                            {/* Feature 3: Bottom Right - Library */}
                            <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 hover:border-emerald-900/50 transition-all duration-300 group shadow-xl">
                                <div className="w-14 h-14 bg-neutral-950 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 border border-neutral-800 group-hover:border-emerald-900/50 transition-colors">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">Study Library</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Access a curated central repository of PDF notes, cheat sheets, and previous year papers organized systematically.
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
