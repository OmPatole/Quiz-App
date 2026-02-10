import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Clock, CheckCircle, Briefcase, TrendingUp, BrainCircuit, LayoutDashboard, Sparkles, Target, Award, Zap } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'Admin' ? '/admin' : '/student';

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-glow"></div>
                        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }}></div>
                    </div>

                    {/* Hero Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-5xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8 animate-slide-up backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">Official Aptitude Enhancement Portal</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1] animate-fade-in">
                                Turn practice into
                                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                    placement success
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
                                The modern aptitude platform for students. Master quantitative, logical, and verbal reasoning with real-time analytics, curated materials, and competitive leaderboards.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                                {user ? (
                                    <Link
                                        to={dashboardLink}
                                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Go to Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        Start for free
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}

                                <a
                                    href="#features"
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center backdrop-blur-sm"
                                >
                                    Explore Features
                                </a>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>100% Free for Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Official T&P Initiative</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Real-time Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-24 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
                                <Target className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">Features</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Everything you need to ace placements
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Comprehensive tools designed to boost your placement readiness with real-world scenarios.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Feature 1 - Live Quizzes */}
                            <div className="group relative lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 sm:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                {/* Glow Effect */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                                        <Clock className="w-7 h-7 text-white" />
                                    </div>

                                    <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                        Live Quizzes & Mock Tests
                                    </h3>

                                    <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Participate in scheduled weekly assessments and full-length mock exams. Experience real exam conditions with strict timers and instant results.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: Target, text: 'Chapter-wise Tests' },
                                            { icon: Award, text: 'Weekly Leaderboards' },
                                            { icon: Zap, text: 'Real-time Ranking' },
                                            { icon: BarChart2, text: 'Performance Tracking' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-gray-300">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <item.icon className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <span className="font-medium">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 - Analytics */}
                            <div className="group relative bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                                        <BarChart2 className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-white">Instant Results</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Get detailed performance analysis immediately. Visualize your growth curve and identify topics that need improvement.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 - Library */}
                            <div className="group relative bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-white">Study Library</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Access a curated central repository of PDF notes, cheat sheets, and previous year papers organized systematically.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Aptitude Section */}
                <section className="py-24 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
                                <BrainCircuit className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">Why It Matters</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Build skills that define great engineers
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Master the aptitude skills that top companies use to identify exceptional talent.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="group relative bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden text-center">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-md">
                                        <Briefcase className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Placement Ready</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        80% of top companies (TCS, Infosys, Wipro) use aptitude tests as their first elimination round. Master it here.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="group relative bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden text-center">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-md">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Competitive Edge</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        Ace exams like GATE, CAT, and GRE with sharp logical reasoning and quantitative skills.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="group relative bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden text-center">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-md">
                                        <BrainCircuit className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Real-World Logic</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        Enhance your problem-solving speed and accuracy—skills that define great engineers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative border-t border-white/5">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Start your placement journey today
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of students who are already mastering aptitude skills and landing their dream jobs.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <Link
                                    to={dashboardLink}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        Start for free
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <a
                                        href="#features"
                                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-lg rounded-xl font-semibold transition-all w-full sm:w-auto text-center backdrop-blur-sm"
                                    >
                                        Learn More
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
