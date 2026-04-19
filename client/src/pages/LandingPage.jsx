import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BarChart2,
    Briefcase,
    BrainCircuit,
    Calendar,
    CheckCircle2,
    ChevronDown,
    LayoutDashboard,
    MessageSquareText,
    Sparkles,
    Trophy,
    WandSparkles,
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'Admin' ? '/admin' : '/student';
    const [openFaq, setOpenFaq] = useState(0);

    const featureCards = [
        {
            icon: Sparkles,
            title: 'Interactive Presentations',
            description: 'Turn concepts into active sessions where everyone participates and remembers more.',
        },
        {
            icon: WandSparkles,
            title: 'AI Quiz Creator',
            description: 'Generate structured practice quizzes in seconds from topics, difficulty, and learning goals.',
        },
        {
            icon: MessageSquareText,
            title: 'Live Polls',
            description: 'Capture instant understanding checks and keep classes engaged through every section.',
        },
        {
            icon: Calendar,
            title: 'Weekly Assessments',
            description: 'Run scheduled chapter tests with deadlines, timers, and auto scoring for consistency.',
        },
        {
            icon: BarChart2,
            title: 'Surveys & Insights',
            description: 'Collect feedback and performance signals to improve future sessions and outcomes.',
        },
        {
            icon: Trophy,
            title: 'Competitive Leaderboards',
            description: 'Motivate students through rankings, streaks, and visibility into measurable progress.',
        },
    ];

    const faqs = [
        {
            question: 'What is an interactive quiz?',
            answer: 'An interactive quiz is a live or self-paced assessment where students answer in real time and get immediate feedback, explanations, and scores.',
        },
        {
            question: 'How do quizzes help learning?',
            answer: 'Frequent quizzes strengthen recall, identify weak topics early, and improve confidence through low-risk, repeated practice.',
        },
        {
            question: 'Can I create custom quizzes?',
            answer: 'Yes. Admins can create custom quizzes, import questions from bank or existing quizzes, and schedule weekly tests.',
        },
        {
            question: 'Is scoring optional?',
            answer: 'Yes. You can use quizzes for formal scoring or for formative checks where the focus is only on participation and feedback.',
        },
        {
            question: 'Can this be used for placement training?',
            answer: 'Absolutely. The platform is designed for aptitude readiness with chapter-wise practice, timed assessments, and analytics.',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#ece8e3] text-[#171a22] font-sans">
            <Navbar />

            <main className="flex-grow">
                <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-24 border-b border-[#d8d0c6] bg-[#ece8e3]">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#5f6eea]/10 blur-3xl animate-float-slow"></div>
                        <div className="absolute top-24 right-8 w-40 h-40 rounded-full bg-[#a9b1ff]/20 blur-3xl animate-float"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-24 rounded-full bg-white/30 blur-3xl animate-pulse-soft"></div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative text-center max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#cfc6ba] bg-[#f4f0ea] mb-8 text-sm font-medium text-[#4e5568] animate-fade-in">
                                Official Aptitude Enhancement Portal
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[0.95] uppercase animate-slide-up">
                                Make  Learning  Fun
                                <span className="block mt-3 text-[#5f6eea]">With  Quizzes</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-[#4f5668] max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '120ms' }}>
                                Turn sessions into interactive competitions. Boost participation, sharpen aptitude skills, and make every practice round memorable.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in" style={{ animationDelay: '180ms' }}>
                                {user ? (
                                    <Link
                                        to={dashboardLink}
                                        className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base rounded-full w-full sm:w-auto"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base rounded-full w-full sm:w-auto"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                                <a
                                    href="#features"
                                    className="btn-secondary px-8 py-3.5 text-base rounded-full w-full sm:w-auto text-center"
                                >
                                    Explore Features
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#5e6678] animate-fade-in" style={{ animationDelay: '240ms' }}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#5f6eea]" />
                                    <span>100% Free for Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#5f6eea]" />
                                    <span>Official T&P Initiative</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#5f6eea]" />
                                    <span>Real-time Analytics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 border-b border-[#d8d0c6] bg-[#ece8e3]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5f6eea] mb-3">More Than Just Quizzes</span>
                            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight mb-4">
                                Competition Meets Collaboration
                            </h2>
                            <p className="text-[#4f5668] max-w-2xl mx-auto">
                                Everything from instant polls and weekly tests to AI-powered quiz creation and performance insights.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featureCards.map((feature, idx) => (
                                <article
                                    key={feature.title}
                                    className="rounded-3xl border border-[#d7cec3] bg-[#f8f6f2] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#c4bece] hover:shadow-[0_14px_34px_rgba(95,110,234,0.08)] animate-fade-in"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#ebe7ff] text-[#5f6eea] flex items-center justify-center mb-6 animate-pulse-soft">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-[#50586a] leading-relaxed mb-6">{feature.description}</p>
                                    <button className="px-5 py-2 rounded-full border border-[#d7cec3] bg-[#f1ece4] text-sm font-semibold text-[#252938] hover:bg-[#e8e1d8] transition-colors">
                                        Learn more
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 border-b border-[#d8d0c6] bg-[#f7f4ef]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5f6eea] mb-3">Why It Matters</span>
                            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight mb-4">
                                Build Skills That Define Engineers
                            </h2>
                            <p className="text-[#4f5668] max-w-2xl mx-auto">
                                Master the aptitude abilities companies test first: speed, accuracy, and real-world logic.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-3xl border border-[#d7cec3] bg-[#fbf9f6] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(95,110,234,0.06)] animate-fade-in" style={{ animationDelay: '40ms' }}>
                                <div className="w-14 h-14 rounded-xl bg-[#ebe7ff] text-[#5f6eea] flex items-center justify-center mb-5 mx-auto">
                                    <Briefcase className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Placement Ready</h3>
                                <p className="text-[#5b6272] text-sm leading-relaxed">
                                    Train for the aptitude rounds used by top recruiters before technical and interview stages.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-[#d7cec3] bg-[#fbf9f6] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(95,110,234,0.06)] animate-fade-in" style={{ animationDelay: '100ms' }}>
                                <div className="w-14 h-14 rounded-xl bg-[#ebe7ff] text-[#5f6eea] flex items-center justify-center mb-5 mx-auto">
                                    <BarChart2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Measurable Progress</h3>
                                <p className="text-[#5b6272] text-sm leading-relaxed">
                                    Track weak chapters, compare performance over time, and focus on what moves your score fastest.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-[#d7cec3] bg-[#fbf9f6] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(95,110,234,0.06)] animate-fade-in" style={{ animationDelay: '160ms' }}>
                                <div className="w-14 h-14 rounded-xl bg-[#ebe7ff] text-[#5f6eea] flex items-center justify-center mb-5 mx-auto">
                                    <BrainCircuit className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Problem-Solving Mindset</h3>
                                <p className="text-[#5b6272] text-sm leading-relaxed">
                                    Build speed and logic together so you solve questions confidently under real test pressure.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 border-b border-[#d8d0c6] bg-[#ece8e3]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight">
                                Questions,
                                <span className="text-[#5f6eea]"> Meet Answers.</span>
                            </h2>
                            <p className="text-[#4f5668] mt-4 text-lg">
                                Everything you need to know in one place.
                            </p>
                        </div>

                        <div className="rounded-3xl overflow-hidden border border-[#d7cec3] bg-[#f7f4ef]">
                            {faqs.map((item, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div key={item.question} className="border-b last:border-b-0 border-[#ddd4c9]">
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                            className="w-full px-6 sm:px-8 py-6 flex items-center justify-between text-left hover:bg-[#f1ece4] transition-colors"
                                        >
                                            <span className={`text-xl font-semibold ${isOpen ? 'text-[#5f6eea]' : 'text-[#171a22]'}`}>{item.question}</span>
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#5f6eea]' : ''}`} />
                                        </button>
                                        <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                            <div className="overflow-hidden">
                                                <p className="px-6 sm:px-8 pb-6 text-[#5c6374] leading-relaxed">{item.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-[#f7f4ef]">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight mb-4 animate-fade-in">
                            Start Your Journey Today
                        </h2>
                        <p className="text-[#4f5668] text-lg mb-10 animate-fade-in" style={{ animationDelay: '80ms' }}>
                            Join students already improving aptitude scores with weekly practice and real-time insights.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '140ms' }}>
                            {user ? (
                                <Link
                                    to={dashboardLink}
                                    className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base rounded-full w-full sm:w-auto"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base rounded-full w-full sm:w-auto"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="btn-secondary px-8 py-3.5 text-base rounded-full w-full sm:w-auto text-center"
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
