import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, ArrowRight, User, BookOpen, Check, Layers, UserCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentLogin = () => {
  const navigate = useNavigate();
  // Default year set to 'First Year' (Matching Database Format)
  const [data, setData] = useState({ name: '', prn: '', year: 'First Year', branch: 'Computer Science' });
  const [remember, setRemember] = useState(true);

  // MAPPING: Display Label -> Database Value
  // We show "TY" to user, but send "Third Year" to database
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (data.prn.length < 8) return toast.error("Invalid PRN");
    if (!data.name.trim()) return toast.error("Name is required");
    
    const loading = toast.loading("Verifying credentials...");
    try {
      const res = await axios.post('http://localhost:3001/api/student/login', data);
      
      if (res.data.success) {
        toast.dismiss(loading);
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        storage.setItem('quiz_student_info', JSON.stringify(res.data.student));
        toast.success("Login Successful!");
        navigate('/dashboard');
      }
    } catch (e) { 
        toast.dismiss(loading);
        const errMsg = e.response?.data?.error || "Login failed";
        toast.error(errMsg); 
        
        // Helpful debugging toast for you
        if(errMsg.includes('mismatch')) {
            console.error("Mismatch Debug:", { sent: data });
        }
    }
  };

  const handleGuestLogin = async () => {
      const loading = toast.loading("Creating Guest Session...");
      try {
          const res = await axios.post('http://localhost:3001/api/guest/login');
          if(res.data.success) {
              toast.dismiss(loading);
              sessionStorage.setItem('token', res.data.token);
              sessionStorage.setItem('quiz_student_info', JSON.stringify(res.data.student));
              toast.success(`Logged in as ${res.data.student.name}`);
              navigate('/dashboard');
          }
      } catch (e) {
          toast.dismiss(loading);
          toast.error("Guest login failed");
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{style: {background: '#1e293b', color: '#fff'}}}/>
      
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-500 shadow-inner">
                <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Student Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Strict Verification Enabled</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            {/* FULL NAME */}
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Full Name (As per Records)</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={18}/>
                    <input className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition" 
                    placeholder="e.g. Om Patole" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                </div>
            </div>

            {/* PRN & YEAR */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">PRN</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-3 text-slate-500" size={18}/>
                        <input className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition" 
                        placeholder="PRN Number" value={data.prn} onChange={e => setData({...data, prn: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Year</label>
                    <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition text-center appearance-none"
                    value={data.year} onChange={e => setData({...data, year: e.target.value})}>
                        {yearOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {/* BRANCH */}
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Branch</label>
                <div className="relative">
                    <Layers className="absolute left-3 top-3 text-slate-500" size={18}/>
                    <select className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none transition appearance-none"
                    value={data.branch} onChange={e => setData({...data, branch: e.target.value})}>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setRemember(!remember)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${remember ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                    {remember && <Check size={12} className="text-white"/>}
                </div>
                <span className="text-sm text-slate-400 select-none group-hover:text-slate-300">Remember me</span>
            </div>

            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2">
                Login Securely <ArrowRight size={18}/>
            </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue as</span></div>
        </div>

        <button onClick={handleGuestLogin} className="w-full py-3 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
            <UserCircle size={18}/> Login as Guest
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;