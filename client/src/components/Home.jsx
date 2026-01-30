import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ArrowRight, Github, Linkedin, Target, Code, Trophy, Zap, Cpu, BarChart, GraduationCap, Users, Heart } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-slate-900/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
              <BrainCircuit size={18} className="text-white rotate-90" />
            </div>
            <span>Quizzer<span className="text-slate-500">.io</span></span>
          </div>

          {/* College Name (Replaced Login Link) */}
          <div className="text-right">
             <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                School Of Engineering and Technology
             </div>
             <div className="text-xs md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Shivaji University, Kolhapur
             </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-20 px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-purple-400 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Placement Season 2026 Ready
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient">Technical Future</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          The comprehensive assessment platform designed to help students ace their Aptitude, Reasoning, and Technical interviews.
        </p>
        
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <Link to="/student-login" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
            Start Assessment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* CREDITS / INITIATIVE SECTION */}
      <section className="px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col items-center gap-4 mb-2">
               <div className="p-3 bg-slate-800 rounded-full text-purple-400">
                  <GraduationCap size={24} />
               </div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Under the Guidance of</h3>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Prof. Dum Sir <span className="text-slate-600 mx-2">&</span> Prof. Awati Sir
            </h2>
            
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              We extend our sincere gratitude to them for their visionary initiative in establishing this platform. 
              Their mentorship has been instrumental in creating a tool that bridges the gap between academic learning and industry requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-20 relative z-10 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Quizzer?</h2>
            <p className="text-slate-400">A unified platform for holistic skill development.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target className="text-blue-400"/>}
              title="Aptitude & Logic"
              desc="Sharpen your quantitative and logical reasoning skills with our curated question banks designed for placement exams."
            />
            <FeatureCard 
              icon={<Code className="text-purple-400"/>}
              title="Technical Concepts"
              desc="Deep dive into core computer science topics including Data Structures, Algorithms, DBMS, and OS."
            />
            <FeatureCard 
              icon={<Trophy className="text-yellow-400"/>}
              title="Performance Metrics"
              desc="Visualize your growth with GitHub-style activity graphs and detailed accuracy reports."
            />
            <FeatureCard 
              icon={<Zap className="text-orange-400"/>}
              title="Weekly Challenges"
              desc="Participate in scheduled weekly tests to benchmark your performance against your peers."
            />
            <FeatureCard 
              icon={<Cpu className="text-green-400"/>}
              title="Instant Evaluation"
              desc="Get immediate feedback on your answers with detailed explanations and solution steps."
            />
            <FeatureCard 
              icon={<BarChart className="text-pink-400"/>}
              title="Track Progress"
              desc="Monitor your consistency and improvement over time with our dedicated student profile analytics."
            />
          </div>
        </div>
      </section>

      {/* Footer & Maker Info */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 px-6 z-10 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-bold tracking-tight mb-4">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                  <BrainCircuit size={18} className="text-white rotate-90" />
               </div>
               <span>Quizzer<span className="text-slate-500">.io</span></span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm mx-auto md:mx-0 leading-relaxed">
              Empowering students to achieve their career goals through consistent practice and assessment.
            </p>
          </div>

          {/* Maker Info & Special Thanks */}
          <div className="flex flex-col items-center md:items-end justify-center gap-8">
             {/* Developer Card */}
             <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center md:text-right w-full md:w-auto">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Designed & Developed by</p>
                <h4 className="text-xl font-bold text-white mb-1">Om Patole</h4>
                <p className="text-slate-400 text-sm mb-4">Full Stack Developer</p>
                
                <div className="flex gap-4 justify-center md:justify-end">
                  <a href="https://github.com/ompatole" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition" title="GitHub">
                    <Github size={20} />
                  </a>
                  <a href="https://linkedin.com/in/ompatole" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition" title="LinkedIn">
                    <Linkedin size={20} />
                  </a>
                </div>
             </div>

             {/* Special Thanks Section */}
             <div className="text-center md:text-right">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Special Thanks to</p>
                 <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-2 justify-center md:justify-end">
                        <Users size={14} className="text-purple-500"/> Shantanu Patil
                    </span>
                    <span className="hidden md:inline text-slate-700">•</span>
                    <span className="flex items-center gap-2 justify-center md:justify-end">
                        <Users size={14} className="text-blue-500"/> Harshvardhan Patil
                    </span>
                 </div>
             </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900 text-center flex flex-col items-center gap-2">
          <p className="text-slate-600 text-xs">
            © 2026 Quizzer.io. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
            Made with <Heart size={10} className="text-red-900 fill-red-900" /> in Kolhapur
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition hover:-translate-y-1 duration-300">
    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-800 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Home;