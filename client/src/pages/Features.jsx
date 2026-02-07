import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, BookOpen, Flame, Smartphone, Calendar } from 'lucide-react';
import Logo from '../components/common/Logo';

const Features = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Calendar,
            title: "Mock & Weekly Tests",
            description: "Simulate real exam environments with timed quizzes. Weekly challenges keep you consistent and exam-ready.",
            colSpan: "md:col-span-2"
        },
        {
            icon: TrendingUp,
            title: "Instant Analytics",
            description: "Deep dive into your performance with detailed heatmaps, accuracy graphs, and question-wise breakdowns.",
            colSpan: "md:col-span-1"
        },
        {
            icon: BookOpen,
            title: "Study Library",
            description: "Access a curated collection of learning materials, PDFs, and previous year questions to strengthen your concepts.",
            colSpan: "md:col-span-1"
        },
        {
            icon: Flame,
            title: "Gamified Streak",
            description: "Build a habit of daily learning. maintain your streak to unlock achievements and stay on top of the leaderboard.",
            colSpan: "md:col-span-2"
        },
        {
            icon: Smartphone,
            title: "Mobile Optimized",
            description: "Learn on the go. Our responsive design ensures a seamless experience on phones, tablets, and desktops.",
            colSpan: "md:col-span-3"
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Navbar Placeholder - In a real app this would be a shared component */}
            <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                    <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-emerald-500 transition-colors">
                        Login
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Tools to <span className="text-emerald-500">Build Your Future.</span>
                    </h1>
                    <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        A comprehensive suite of features designed to transform how you prepare for placements and competitive exams.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${feature.colSpan} group bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 cursor-default relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <feature.icon className="w-32 h-32 text-emerald-500" />
                            </div>

                            <div className="relative z-10 h-full flex flex-col items-start">
                                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <feature.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-neutral-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Call to Action */}
                <div className="text-center bg-gradient-to-br from-emerald-900/20 to-neutral-900 border border-emerald-900/30 rounded-3xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to start your journey?</h2>
                    <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
                        Join thousands of students mastering their aptitude skills today.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all inline-flex items-center gap-2"
                    >
                        Get Started Now <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </main>

            <footer className="border-t border-neutral-800 bg-neutral-950 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-neutral-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. Built for students, by students.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Features;
