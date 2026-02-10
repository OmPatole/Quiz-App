import { useNavigate } from 'react-router-dom';
import { Users, Target, Shield, ChevronLeft, Award } from 'lucide-react';
import Logo from '../components/common/Logo';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black font-sans text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
                {/* Hero */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Empowering <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Engineers.</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        An initiative by the Training and Placement Cell, School of Engineering and Technology, dedicated to bridging the gap between academic learning and industry requirements.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-white/20 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-6 shadow-md">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To provide a robust, accessible, and data-driven platform that helps engineering students master aptitude skills, critical thinking, and problem-solving abilities essential for modern recruitment processes.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:border-white/20 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white mb-6 shadow-md">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To ensure every student graduating from our institution is "Placement Ready"—confident, skilled, and prepared to tackle the challenges of competitive exams and corporate interviews.
                        </p>
                    </div>
                </div>

                {/* Team Section Placeholder */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Faculty Coordinator */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm hover:border-white/20 transition-all">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 border border-white/10">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Faculty Coordinator</h3>
                            <p className="text-blue-400 text-sm font-medium mb-3">T&P Cell</p>
                            <p className="text-gray-400 text-sm">Guiding the strategic vision and curriculum alignment.</p>
                        </div>

                        {/* Student Lead */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm hover:border-white/20 transition-all">
                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 border border-white/10">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Student Developers</h3>
                            <p className="text-cyan-400 text-sm font-medium mb-3">Development Team</p>
                            <p className="text-gray-400 text-sm">Building and maintaining the platform architecture.</p>
                        </div>

                        {/* Content Team */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm hover:border-white/20 transition-all">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 border border-white/10">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Content Team</h3>
                            <p className="text-indigo-400 text-sm font-medium mb-3">Curriculum</p>
                            <p className="text-gray-400 text-sm">Curating high-quality questions and study materials.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/10 bg-black py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. School of Engineering and Technology.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
