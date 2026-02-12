import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, BookOpen, Flame, Smartphone, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

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
        <div className="min-h-screen bg-black font-sans text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Tools to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Build Your Future.</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        A comprehensive suite of features designed to transform how you prepare for placements and competitive exams.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${feature.colSpan} group bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300 cursor-default relative overflow-hidden backdrop-blur-sm`}
                        >
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

                            <div className="relative z-10 h-full flex flex-col items-start">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-md">
                                    <feature.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Call to Action */}
                <div className="text-center bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to start your journey?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Join thousands of students mastering their aptitude skills today.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/30 hover:scale-105 transition-all inline-flex items-center gap-2"
                    >
                        Get Started Now <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Features;
