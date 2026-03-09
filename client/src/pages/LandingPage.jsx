import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Clock, Briefcase, TrendingUp, BrainCircuit, LayoutDashboard, Target, Award, Zap, CheckCircle2 } from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'Admin' ? '/admin' : '/student';

    return (
        <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-600 bg-blue-600/10 mb-8">
                                <span className="text-sm font-medium text-blue-400">Official Aptitude Enhancement Portal</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
                                Turn practice into
                                <span className="block mt-2 text-blue-500">placement success</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                                The aptitude platform for students. Master quantitative, logical, and verbal reasoning with real-time analytics, curated materials, and competitive leaderboards.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                                {user ? (
                                    <Link
                                        to={dashboardLink}
                                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-semibold transition-colors w-full sm:w-auto"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-semibold transition-colors w-full sm:w-auto"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <a
                                    href="#features"
                                    className="px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-base rounded-lg font-semibold transition-colors w-full sm:w-auto text-center"
                                >
                                    Explore Features
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>100% Free for Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Official T&P Initiative</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Real-time Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">Features</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Everything you need to ace placements
                            </h2>
                            <p className="text-neutral-400 max-w-2xl mx-auto">
                                Comprehensive tools designed to boost your placement readiness.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Feature 1 - Span 2 */}
                            <div className="lg:col-span-2 bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">Live Quizzes &amp; Mock Tests</h3>
                                <p className="text-neutral-400 mb-6 leading-relaxed">
                                    Participate in scheduled weekly assessments and full-length mock exams. Experience real exam conditions with strict timers and instant results.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Target, text: 'Chapter-wise Tests' },
                                        { icon: Award, text: 'Weekly Leaderboards' },
                                        { icon: Zap, text: 'Real-time Ranking' },
                                        { icon: BarChart2, text: 'Performance Tracking' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-neutral-300">
                                            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <item.icon className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
                                    <BarChart2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">Instant Results</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Get detailed performance analysis immediately. Visualize your growth curve and identify topics that need improvement.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">Study Library</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Access a curated central repository of PDF notes, cheat sheets, and previous year papers organized systematically.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="lg:col-span-2 bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-5">
                                    <BrainCircuit className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">Adaptive Learning</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Track your streak, monitor chapter-wise accuracy, and improve on weak areas with targeted practice sets. Built to help you grow consistently.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Aptitude Section */}
                <section className="py-20 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-500 mb-3">Why It Matters</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Build skills that define great engineers
                            </h2>
                            <p className="text-neutral-400 max-w-2xl mx-auto">
                                Master the aptitude skills that top companies use to identify exceptional talent.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors text-center">
                                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-5 mx-auto">
                                    <Briefcase className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Placement Ready</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    80% of top companies (TCS, Infosys, Wipro) use aptitude tests as their first elimination round. Master it here.
                                </p>
                            </div>

                            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors text-center">
                                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-5 mx-auto">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Competitive Edge</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Ace exams like GATE, CAT, and GRE with sharp logical reasoning and quantitative skills.
                                </p>
                            </div>

                            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors text-center">
                                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-5 mx-auto">
                                    <BrainCircuit className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Real-World Logic</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Enhance your problem-solving speed and accuracy — skills that define great engineers.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Start your placement journey today
                        </h2>
                        <p className="text-neutral-400 text-lg mb-10">
                            Join students who are already mastering aptitude skills and landing their dream jobs.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <Link
                                    to={dashboardLink}
                                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-semibold transition-colors w-full sm:w-auto"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-semibold transition-colors w-full sm:w-auto"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-base rounded-lg font-semibold transition-colors w-full sm:w-auto text-center"
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
