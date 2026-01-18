import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Code2, GraduationCap, Github, Linkedin, Cpu, ShieldBan } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar (Simple Brand) */}
      <nav className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Code2 size={20} className="text-white" />
            </div>
            <span>Qizzer</span>
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            Est. 2025
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10">
        
        <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-bold text-purple-400 mb-8 backdrop-blur-sm shadow-xl">
          <GraduationCap size={14} /> School of Engineering & Technology
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-4xl">
          Master Coding. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
            One Week at a Time.
          </span>
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          The official weekly assessment portal for Computer Science students at Shivaji University. 
          Compete in real-time, solve practical challenges, and climb the leaderboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md sm:max-w-none">
          <Link to="/quizzes" className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 transform hover:-translate-y-1">
            <Play className="w-5 h-5 fill-current" /> 
            Start Assessment
          </Link>

          <Link to="/leaderboards" className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1">
            <Trophy className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" /> 
            Hall of Fame
          </Link>
        </div>

        {/* Features Grid (Mini) */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
            {[
                { icon: <Cpu size={20}/>, title: "Real-time Compiler", desc: "Run Python, Java, C++, C, JS instantly." },
                { icon: <ShieldBan size={20}/>, title: "Secure Environment", desc: "Fullscreen enforcement & tab monitoring." },
                { icon: <Trophy size={20}/>, title: "Instant Ranking", desc: "Live leaderboards with tie-breaking logic." }
            ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-900 transition">
                    <div className="text-purple-400 mb-3">{item.icon}</div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
            ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto p-8 border-t border-slate-900 mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
        
        <div className="flex flex-col gap-1 text-center md:text-left">
            <p>&copy; 2025 SET Programmers Club. All rights reserved.</p>
            <p className="text-slate-600 text-xs">
                Built with <span className="text-slate-400">Vite</span>, <span className="text-slate-400">Tailwind</span> & <span className="text-slate-400">Next.js</span>
            </p>
        </div>

        <div className="flex items-center gap-6">
            <a href="https://github.com/ompatole" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2 group">
                <Github size={18} className="group-hover:text-purple-400 transition-colors"/>
                <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="https://linkedin.com/in/om-patole" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2 group">
                <Linkedin size={18} className="group-hover:text-blue-400 transition-colors"/>
                <span className="hidden sm:inline">LinkedIn</span>
            </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;