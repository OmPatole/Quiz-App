import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, ArrowRight, User, BookOpen, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '', prn: '', year: 'FY' });
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    // If already logged in, skip to dashboard
    const savedStudent = localStorage.getItem('quiz_student_info');
    if (savedStudent) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (data.prn.length !== 10) return toast.error("PRN must be 10 digits");
    if (!data.name.trim()) return toast.error("Name is required");
    
    try {
      const res = await axios.post('http://localhost:3001/api/student/login', data);
      if (res.data.success) {
        // Save to LocalStorage (Persist) or SessionStorage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('student_token', res.data.token);
        storage.setItem('quiz_student_info', JSON.stringify(res.data.student));
        
        toast.success("Login Successful");
        navigate('/dashboard');
      }
    } catch (e) { toast.error("Login failed. Try again."); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{style: {background: '#1e293b', color: '#fff'}}}/>
      
      {/* Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-500 shadow-inner">
                <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Student Login</h1>
            <p className="text-slate-400 text-sm mt-1">Enter your details to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={18}/>
                    <input className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition" 
                    placeholder="Enter Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">PRN</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-3 text-slate-500" size={18}/>
                        <input className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition" 
                        placeholder="10 Digits" value={data.prn} onChange={e => setData({...data, prn: e.target.value})} maxLength={10} />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Year</label>
                    <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition text-center"
                    value={data.year} onChange={e => setData({...data, year: e.target.value})}>
                        {['FY', 'SY', 'TY', 'BE'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setRemember(!remember)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${remember ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                    {remember && <Check size={12} className="text-white"/>}
                </div>
                <span className="text-sm text-slate-400 select-none group-hover:text-slate-300">Remember me</span>
            </div>

            <button className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2">
                Continue <ArrowRight size={18}/>
            </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;