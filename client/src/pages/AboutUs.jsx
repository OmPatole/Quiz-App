import { useNavigate } from 'react-router-dom';
import { Users, Target, Shield, ChevronLeft, Award } from 'lucide-react';
import Logo from '../components/common/Logo';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="inline-block px-4 py-1 rounded-full bg-emerald-900/30 border border-emerald-900 text-emerald-500 text-sm font-bold mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Empowering <span className="text-emerald-500">Engineers.</span>
                    </h1>
                    <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        An initiative by the Training and Placement Cell, School of Engineering and Technology, dedicated to bridging the gap between academic learning and industry requirements.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="card bg-neutral-900 border-neutral-800 p-8 rounded-3xl">
                        <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-emerald-500 mb-6">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-neutral-400 leading-relaxed text-lg">
                            To provide a robust, accessible, and data-driven platform that helps engineering students master aptitude skills, critical thinking, and problem-solving abilities essential for modern recruitment processes.
                        </p>
                    </div>

                    <div className="card bg-neutral-900 border-neutral-800 p-8 rounded-3xl">
                        <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-emerald-500 mb-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                        <p className="text-neutral-400 leading-relaxed text-lg">
                            To ensure every student graduating from our institution is "Placement Ready"—confident, skilled, and prepared to tackle the challenges of competitive exams and corporate interviews.
                        </p>
                    </div>
                </div>

                {/* Team Section Placeholder */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Faculty Coordinator */}
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-600">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Faculty Coordinator</h3>
                            <p className="text-emerald-500 text-sm font-medium mb-3">T&P Cell</p>
                            <p className="text-neutral-400 text-sm">Guiding the strategic vision and curriculum alignment.</p>
                        </div>

                        {/* Student Lead */}
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-600">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Student Developers</h3>
                            <p className="text-emerald-500 text-sm font-medium mb-3">Development Team</p>
                            <p className="text-neutral-400 text-sm">Building and maintaining the platform architecture.</p>
                        </div>

                        {/* Content Team */}
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-600">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Content Team</h3>
                            <p className="text-emerald-500 text-sm font-medium mb-3">Curriculum</p>
                            <p className="text-neutral-400 text-sm">Curating high-quality questions and study materials.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-neutral-800 bg-neutral-950 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-neutral-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. School of Engineering and Technology.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
