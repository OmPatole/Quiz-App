import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Fingerprint, ArrowRight, User, BookOpen, Check, Layers, UserCircle, ArrowLeft, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false); // TOGGLE STATE
  const [data, setData] = useState({ name: '', prn: '', year: 'First Year', branch: 'Computer Science' });
  const [remember, setRemember] = useState(true);

  // Mappings
  const yearOptions = [
    { label: 'FY (First Year)', value: 'First Year' },
    { label: 'SY (Second Year)', value: 'Second Year' },
    { label: 'TY (Third Year)', value: 'Third Year' },
    { label: 'BE (Fourth Year)', value: 'Fourth Year' }
  ];

  const branches = [
    "Computer Science",
    "Electronics and Telecommunication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering", 
    "Food and Technology"
  ];

  useEffect(() => {
    const savedStudent = localStorage.getItem('quiz_student_info');
    if (savedStudent) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.prn.length < 8) return toast.error("Invalid PRN");
    if (!data.name.trim()) return toast.error("Name is required");
    
    const loading = toast.loading(isSignup ? "Registering..." : "Verifying...");
    const endpoint = isSignup ? 'http://localhost:3001/api/student/signup' : 'http://localhost:3001/api/student/login';

    try {
      const res = await axios.post(endpoint, data);
      
      if (res.data.success) {
        toast.dismiss(loading);
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        storage.setItem('quiz_student_info', JSON.stringify(res.data.student));
        toast.success(isSignup ? "Registration Successful!" : "Login Successful!");
        navigate('/dashboard');
      }
    } catch (e) { 
        toast.dismiss(loading);
        const errMsg = e.response?.data?.error || "Operation failed";
        toast.error(errMsg); 
    }
  };

  const handlePrnChange = (e) => {
      const value = e.target.value.replace(/\D/g, ''); 
      if (value.length <= 10) setData({ ...data, prn: value });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{style: {background: '#1e293b', color: '#fff'}}}/>
      
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 transition z-20 font-bold text-sm bg-transparent border-none cursor-pointer">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg"><ArrowLeft size={18} /></div>
          <span className="hidden sm:inline">Back</span>
      </button>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-6">
            <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl relative group">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
                <Fingerprint size={40} className="text-purple-400 relative z-10" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Portal</h1>
            
            {/* TOGGLE TABS */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4">
                <button 
                    onClick={() => setIsSignup(false)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${!isSignup ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Log In
                </button>
                <button 
                    onClick={() => setIsSignup(true)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${isSignup ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Sign Up
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">PRN Number</label>
                <div className="relative">
                    <BookOpen className="absolute left-3 top-3 text-slate-500" size={18}/>
                    <input 
                        className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition font-mono tracking-wide" 
                        placeholder="10-Digit ID" value={data.prn} onChange={handlePrnChange} type="text" inputMode="numeric"
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={18}/>
                    <input className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition font-medium" 
                    placeholder="Enter your full name" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                </div>
            </div>

            {/* SHOW EXTRA FIELDS ONLY ON SIGNUP */}
            {isSignup && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Year</label>
                        <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition text-sm font-bold"
                        value={data.year} onChange={e => setData({...data, year: e.target.value})}>
                            {yearOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Branch</label>
                        <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition text-sm"
                        value={data.branch} onChange={e => setData({...data, branch: e.target.value})}>
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
                {isSignup ? "Create Account" : "Access Portal"} <ArrowRight size={18}/>
            </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;