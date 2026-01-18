import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, User, Check } from 'lucide-react';

const AdminLogin = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false); // NEW STATE
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:3001/api/admin/login', creds);
      
      if (res.data.success) {
        // LOGIC: LocalStorage (Permanent) vs SessionStorage (Temporary)
        if (remember) {
            localStorage.setItem('admin_session', 'true');
        } else {
            sessionStorage.setItem('admin_session', 'true');
        }
        
        setIsAuth(true);
        navigate('/admin');
      }
    } catch (err) {
      setError("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-purple-900/20 rounded-full text-purple-400 mb-3">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                  <input type="text" className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                    value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                  <input type="password" className="w-full pl-10 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none"
                    value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} />
                </div>
              </div>
          </div>

          {/* --- REMEMBER ME CHECKBOX --- */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setRemember(!remember)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${remember ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                  {remember && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm select-none ${remember ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  Remember this machine
              </span>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">{error}</div>}

          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition shadow-lg shadow-purple-900/20">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;