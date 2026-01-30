import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, User, ArrowLeft } from 'lucide-react';

const LoginActivity = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/login-activity', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(res.data);
    } catch (e) {
      console.error("Failed to load activity:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-white">
                  <ArrowLeft size={20}/>
              </button>
              <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Clock className="text-blue-400" size={24}/> Login Activity
                  </h2>
                  <p className="text-slate-400 text-sm">Real-time monitoring of student access.</p>
              </div>
          </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-950/50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                          <th className="p-5">Student</th>
                          <th className="p-5">PRN</th>
                          <th className="p-5">Details</th>
                          <th className="p-5 text-right">Last Active</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {loading ? (
                          <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading logs...</td></tr>
                      ) : students.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-slate-500">No login activity recorded yet.</td></tr>
                      ) : (
                          students.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-800/50 transition">
                                  <td className="p-5 font-bold text-white flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                                          <User size={16}/>
                                      </div>
                                      {s.name}
                                  </td>
                                  <td className="p-5 text-slate-400 font-mono text-sm">{s.prn}</td>
                                  <td className="p-5 text-sm text-slate-400">
                                      <span className="px-2 py-1 bg-slate-800 rounded text-xs mr-2 border border-slate-700">{s.year}</span>
                                      {s.branch}
                                  </td>
                                  <td className="p-5 text-right text-sm font-mono text-green-400">
                                      {new Date(s.lastLogin).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default LoginActivity;