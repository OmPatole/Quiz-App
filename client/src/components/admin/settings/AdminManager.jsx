import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Trash2, UserPlus, Lock, User, BrainCircuit, Code } from 'lucide-react';

const AdminManager = ({ API_URL }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', scope: 'aptitude' });
  const [currentUserRole, setCurrentUserRole] = useState('');

  const fetchAdmins = async () => {
    try {
        const token = localStorage.getItem('token');
        // Decode token to see if I am superadmin
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserRole(payload.role);

        if (payload.role === 'superadmin') {
            const res = await axios.get(`${API_URL}/api/admins`, { headers: { Authorization: `Bearer ${token}` } });
            setAdmins(res.data);
        }
    } catch (e) { console.error("Not superadmin"); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
      if(!newAdmin.username || !newAdmin.password) return toast.error("Fill all fields");
      try {
          await axios.post(`${API_URL}/api/create-admin`, newAdmin, { 
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
          });
          toast.success("Admin Created");
          setNewAdmin({ username: '', password: '', scope: 'aptitude' });
          fetchAdmins();
      } catch (e) { toast.error(e.response?.data?.error || "Failed"); }
  };

  const handleDelete = async (id, role) => {
      if(role === 'superadmin') return toast.error("Cannot delete Root Admin");
      if(!window.confirm("Remove this admin access?")) return;
      try {
          await axios.delete(`${API_URL}/api/admin/${id}`, { 
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
          });
          toast.success("Admin Removed");
          fetchAdmins();
      } catch (e) { toast.error("Failed"); }
  };

  if (currentUserRole !== 'superadmin') {
      return (
          <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Shield size={48} className="mx-auto mb-4 text-slate-700"/>
              <h2 className="text-xl font-bold">Access Restricted</h2>
              <p>Only the Root SuperAdmin can manage other admins.</p>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Access Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Existing Admins</h3>
                {admins.map(admin => (
                    <div key={admin._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${admin.role === 'superadmin' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                                {admin.role === 'superadmin' ? <Shield size={20} className="text-white"/> : <User size={20} className="text-slate-300"/>}
                            </div>
                            <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    {admin.username}
                                    {admin.scope === 'aptitude' && <span className="text-[10px] bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 uppercase">Aptitude</span>}
                                    {admin.scope === 'coding' && <span className="text-[10px] bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">Coding</span>}
                                    {admin.scope === 'all' && admin.role !== 'superadmin' && <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 uppercase">Full Access</span>}
                                </div>
                                <div className="text-xs text-slate-500 uppercase">{admin.role}</div>
                            </div>
                        </div>
                        {admin.role !== 'superadmin' && (
                            <button onClick={() => handleDelete(admin._id, admin.role)} className="p-2 hover:bg-red-900/20 text-slate-500 hover:text-red-400 rounded-lg transition"><Trash2 size={18}/></button>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20}/> Create New Admin</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Username</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-purple-500" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3.5 text-slate-500"/>
                            <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 text-white outline-none focus:border-purple-500" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Access Scope</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={()=>setNewAdmin({...newAdmin, scope: 'aptitude'})} className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${newAdmin.scope === 'aptitude' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                                <BrainCircuit size={16}/> Aptitude Only
                            </button>
                            <button onClick={()=>setNewAdmin({...newAdmin, scope: 'coding'})} className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${newAdmin.scope === 'coding' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                                <Code size={16}/> Coding Only
                            </button>
                        </div>
                    </div>
                    <button onClick={handleCreate} className="w-full py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition shadow-lg mt-2">Create Admin Account</button>
                </div>
            </div>
        </div>
    </div>
  );
};
export default AdminManager;