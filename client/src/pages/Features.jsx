import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    MessageSquareText,
    Sparkles,
    Trophy,
    WandSparkles,
    BarChart2,
    Calendar,
    ArrowRight,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Features = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);

    const features = [
        {
            icon: Sparkles,
            title: 'Custom Quiz Builder',
            description: 'Admins can easily build and manage practice sessions, adding questions naturally without AI fluff.',
        },
        {
            icon: Calendar,
            title: 'Weekly Assessments',
            description: 'Run chapter-wise and weekly quiz sessions with timers, scoring, and auto feedback.',
        },
        {
            icon: BarChart2,
            title: 'Performance Analytics',
            description: 'Provide students with real-time feedback and visual breakdowns of their aptitude scores.',
        },
        {
            icon: WandSparkles,
            title: 'Targeted Practice',
            description: 'Allow learners to hone their skills directly on specific topics and difficulty levels.',
        },
        {
            icon: MessageSquareText,
            title: 'Study Materials',
            description: 'Upload and manage PDFs and necessary reference materials for every related chapter.',
        },
        {
            icon: Trophy,
            title: 'Competitive Leaderboards',
            description: 'Boost student engagement and motivation through transparent scores and healthy rankings.',
        },
    ];

    const faqItems = [
        {
            question: 'What is an interactive quiz?',
            answer: 'An interactive quiz provides immediate responses and explanations so students learn while attempting questions.',
        },
        {
            question: 'How do quizzes help learning?',
            answer: 'Regular low-stakes testing improves memory retention, highlights weak areas, and increases confidence over time.',
        },
        {
            question: 'Can I create custom quizzes?',
            answer: 'Yes. You can build quizzes manually or import questions from the bank and previous tests.',
        },
        {
            question: 'Is scoring optional?',
            answer: 'Yes. You can run quizzes with marks for assessments or without marks for practice-only sessions.',
        },
        {
            question: 'Can quizzes be used for corporate training?',
            answer: 'Yes. The same format works for team training, onboarding checks, and workshop engagement.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#ece8e3] text-[#171a22] relative overflow-hidden flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 py-28 sm:py-32 sm:px-6 lg:px-8">
                <div className="text-center mb-14 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-5 tracking-tight uppercase leading-[0.95]">
                        More Than Just Quizzes
                    </h1>
                    <p className="text-[#51596a] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        With structured chapters, leaderboards, and detailed analytics, Aptitude Portal equips students effectively for placement training.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {features.map((feature, index) => (
                        <article
                            key={feature.title}
                            className="rounded-3xl border border-[#d7cec3] bg-[#f8f6f2] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c3bccb]"
                            style={{ animation: `fadeIn 0.25s ease-out ${index * 0.05}s both` }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#ebe7ff] text-[#5f6eea] flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-semibold mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-[#51596a] leading-relaxed mb-8">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>

                <section className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-5xl font-extrabold uppercase tracking-tight leading-none">
                            Questions,
                            <span className="text-[#5f6eea]"> Meet Answers.</span>
                        </h2>
                        <p className="text-[#51596a] text-lg mt-4">
                            Curiosity happens. We have answered the most frequent questions in one place.
                        </p>
                    </div>

                    <div className="rounded-3xl overflow-hidden border border-[#d7cec3] bg-[#f7f4ef]">
                        {faqItems.map((item, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div key={item.question} className="border-b last:border-b-0 border-[#ddd4c9]">
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                        className="w-full px-6 sm:px-8 py-6 flex items-center justify-between text-left hover:bg-[#f1ece4] transition-colors"
                                    >
                                        <span className={`text-2xl font-semibold ${isOpen ? 'text-[#5f6eea]' : 'text-[#171a22]'}`}>{item.question}</span>
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
                </section>

                <div className="text-center rounded-3xl border border-[#d7cec3] bg-[#f7f4ef] p-12">
                    <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-4">Ready to run better sessions?</h2>
                    <p className="text-[#51596a] mb-8 max-w-2xl mx-auto text-lg">
                        Start creating quizzes and interactive learning experiences that students actually enjoy.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2"
                    >
                        Get Started Now <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Features;
