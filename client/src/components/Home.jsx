import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, BookOpen, ArrowRight, Github, Linkedin, Target, Code, Trophy, Zap, Cpu, BarChart } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative selection:bg-purple-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar (Admin Link Removed) */}
      <nav className="border-b border-slate-900/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Terminal size={18} className="text-white" />
            </div>
            <span>Quizzer<span className="text-slate-500">.io</span></span>
          </div>
          {/* Admin link removed. Access via URL '/login' */}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-purple-400 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Live Weekly Challenges Available
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">Technical Career</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          The ultimate platform for engineering students to master Aptitude Reasoning and Coding Algorithms through daily practice and live competitions.
        </p>
        
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <Link to="/student-login" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
            Start Practicing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="px-6 py-20 relative z-10 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to crack placements</h2>
            <p className="text-slate-400">Comprehensive tools tailored for computer science students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target className="text-blue-400"/>}
              title="Aptitude Mastery"
              desc="Practice quantitative aptitude, logical reasoning, and verbal ability with our extensive mock test library."
            />
            <FeatureCard 
              icon={<Code className="text-purple-400"/>}
              title="Coding Arena"
              desc="Solve algorithmic problems with our built-in compiler supporting C, C++, Java, Python, and JS."
            />
            <FeatureCard 
              icon={<Trophy className="text-yellow-400"/>}
              title="Global Leaderboards"
              desc="Compete with peers in weekly challenges and showcase your rank to potential recruiters."
            />
            <FeatureCard 
              icon={<Zap className="text-orange-400"/>}
              title="Mock Drills"
              desc="Unlimited practice attempts with instant feedback to improve your speed and accuracy."
            />
            <FeatureCard 
              icon={<Cpu className="text-green-400"/>}
              title="Real-time Execution"
              desc="Run your code against multiple test cases instantly with our high-performance execution engine."
            />
            <FeatureCard 
              icon={<BarChart className="text-pink-400"/>}
              title="Performance Analysis"
              desc="Track your progress over time and identify weak areas that need more focus."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 px-6 z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg mb-1">Quiz Portal</h4>
            <p className="text-slate-500 text-sm">Empowering students for the future.</p>
          </div>
          <div className="flex gap-6">
            <SocialLink href="https://github.com/ompatole" icon={<Github size={20} />} />
            <SocialLink href="https://linkedin.com/in/ompatole" icon={<Linkedin size={20} />} />
          </div>
        </div>
        <div className="mt-12 text-center text-slate-700 text-xs">
          © 2026 Om Patole. Built with React & Node.js.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition hover:-translate-y-1 duration-300">
    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const SocialLink = ({ href, icon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition">
    {icon}
  </a>
);

export default Home;