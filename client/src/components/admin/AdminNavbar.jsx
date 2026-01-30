import React from 'react';
import { FileText, Users, Layers, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminNavbar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if the current path matches the tab
  const isActive = (path) => {
      if (path === '') return location.pathname === '/admin' || location.pathname === '/admin/';
      return location.pathname.includes(`/admin/${path}`);
  };

  const NavTab = ({ path, label, icon: Icon }) => (
      <button 
        onClick={() => navigate(path === '' ? '/admin' : `/admin/${path}`)} 
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition text-sm ${
            isActive(path) 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
          <Icon size={16} /> {label}
      </button>
  );

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 w-48">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">Q</div>
            <span className="font-bold text-lg tracking-tight">Admin<span className="text-purple-500">Panel</span></span>
        </div>

        <div className="flex-1 flex justify-center gap-4">
            <NavTab path="" label="Quizzes" icon={FileText} />
            <NavTab path="students" label="Students" icon={Users} />
            <NavTab path="materials" label="Study Material" icon={Layers} />
            <NavTab path="settings" label="Settings" icon={Settings} />
        </div>

        <div className="flex items-center gap-4 w-48 justify-end">
           <button onClick={handleLogout} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-900/10 transition">
              <LogOut size={14}/> Logout
           </button>
        </div>
    </header>
  );
};
export default AdminNavbar;