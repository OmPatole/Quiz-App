import { useNavigate } from 'react-router-dom';
import { Users, Target, Shield, Users as UsersIcon } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black font-sans text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* About Content */}

            <main className="flex-grow max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="inline-block px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-medium mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Empowering <span className="text-blue-400">Engineers.</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        An initiative by the Training and Placement Cell, School of Engineering and Technology, dedicated to bridging the gap between academic learning and industry requirements.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To provide a robust, accessible, and data-driven platform that helps engineering students master aptitude skills, critical thinking, and problem-solving abilities essential for modern recruitment processes.
                        </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-neutral-700 transition-colors">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To ensure every student graduating from our institution is "Placement Ready"—confident, skilled, and prepared to tackle the challenges of competitive exams and corporate interviews.
                        </p>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center hover:border-neutral-700 transition-colors">
                            <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-400">
                                <UsersIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Faculty Coordinator</h3>
                            <p className="text-blue-400 text-sm font-medium mb-3">T&P Cell</p>
                            <p className="text-gray-400 text-sm">Guiding the strategic vision and curriculum alignment.</p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center hover:border-neutral-700 transition-colors">
                            <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-400">
                                <UsersIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Student Developers</h3>
                            <p className="text-cyan-400 text-sm font-medium mb-3">Development Team</p>
                            <p className="text-gray-400 text-sm">Building and maintaining the platform architecture.</p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center hover:border-neutral-700 transition-colors">
                            <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 rounded-full mx-auto mb-4 flex items-center justify-center text-neutral-400">
                                <UsersIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Content Team</h3>
                            <p className="text-indigo-400 text-sm font-medium mb-3">Curriculum</p>
                            <p className="text-gray-400 text-sm">Curating high-quality questions and study materials.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
