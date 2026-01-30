import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Activity, Calendar, Award, TrendingUp } from 'lucide-react';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [studentInfo, setStudentInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/student-login');

        const storedInfo = JSON.parse(localStorage.getItem('quiz_student_info') || '{}');
        setStudentInfo(storedInfo);

        const res = await axios.get('http://localhost:3001/api/student-profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data);
      } catch (error) {
        console.error("Profile fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // --- DYNAMIC HEATMAP GENERATION ---
  const generateCalendarGrid = () => {
      const activityMap = profileData?.activityMap || {};
      const dates = Object.keys(activityMap).sort();

      // 1. Determine Start Date (First activity or Start of Current Month)
      let startDate = new Date();
      if (dates.length > 0) {
          const firstActivity = new Date(dates[0]);
          // Start from the 1st of that month
          startDate = new Date(firstActivity.getFullYear(), firstActivity.getMonth(), 1);
      } else {
          // Default to 1st of current month
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      }

      // 2. Determine End Date (Today)
      const endDate = new Date();
      
      // 3. Generate array of days
      const gridData = [];
      const currentIter = new Date(startDate);
      
      // Pad the beginning to align with Day of Week (0 = Sunday)
      const startDayOfWeek = currentIter.getDay(); // 0 (Sun) to 6 (Sat)
      for (let i = 0; i < startDayOfWeek; i++) {
          gridData.push({ date: null }); // Empty placeholder
      }

      // Fill days
      while (currentIter <= endDate) {
          const dateStr = currentIter.toISOString().split('T')[0];
          const count = activityMap[dateStr] || 0;
          
          // Determine Intensity
          let intensity = 'bg-slate-800/50'; // Empty
          if (count > 0) intensity = 'bg-purple-900/60';
          if (count > 2) intensity = 'bg-purple-600/80';
          if (count > 4) intensity = 'bg-purple-500';
          if (count >= 6) intensity = 'bg-green-400';

          gridData.push({
              date: new Date(currentIter),
              dateStr,
              count,
              intensity
          });
          
          // Next Day
          currentIter.setDate(currentIter.getDate() + 1);
      }

      return { gridData, startDate };
  };

  const { gridData, startDate } = profileData ? generateCalendarGrid() : { gridData: [], startDate: new Date() };

  // Helper to get Month Labels based on grid position
  const getMonthLabels = () => {
      const labels = [];
      let currentMonth = -1;
      
      gridData.forEach((cell, index) => {
          if (!cell.date) return;
          const m = cell.date.getMonth();
          if (m !== currentMonth) {
              // Calculate rough column index (index / 7 rows)
              const colIndex = Math.floor(index / 7);
              
              // FIX: Precise calculation -> 12px (box) + 2px (gap) = 14px per column
              labels.push({ name: cell.date.toLocaleString('default', { month: 'short' }), col: colIndex });
              currentMonth = m;
          }
      });
      return labels;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition text-sm font-bold">
                    <ArrowLeft size={16}/> Back to Dashboard
                </button>
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-purple-900/30 border border-white/10">
                        {studentInfo.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{studentInfo.name}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-slate-400 text-sm font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{studentInfo.prn}</span>
                            <span className="text-slate-500 text-sm">•</span>
                            <span className="text-slate-400 text-sm font-medium">{studentInfo.branch}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                 <div className="px-5 py-3 bg-slate-900 rounded-xl border border-slate-800 text-sm font-bold text-slate-300 flex items-center gap-2 shadow-sm">
                    <Calendar size={18} className="text-purple-400"/> Batch: {studentInfo.year}
                 </div>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Trophy size={22}/>} label="Total Tests" value={profileData?.stats?.totalTests} color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" />
            <StatCard icon={<Target size={22}/>} label="Avg Score" value={profileData?.stats?.avgScore} color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
            <StatCard icon={<Activity size={22}/>} label="Accuracy" value={`${profileData?.stats?.accuracy}%`} color="text-green-400" bg="bg-green-400/10" border="border-green-400/20" />
            <StatCard icon={<Award size={22}/>} label="Best Score" value={profileData?.stats?.bestScore} color="text-purple-400" bg="bg-purple-400/10" border="border-purple-400/20" />
        </div>

        {/* FREQUENCY COUNTER / HEATMAP */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400"/> Frequency Counter
                </h3>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {startDate.getFullYear()}
                </div>
            </div>
            
            <div className="w-full overflow-x-auto pb-2 relative z-10 scrollbar-hide">
                <div className="min-w-max">
                     {/* Month Labels */}
                     <div className="flex mb-2 text-[10px] font-bold text-slate-500 h-4 relative w-full">
                        {getMonthLabels().map((m, i) => (
                            // Position = Column Index * (Box Width 12px + Gap 2px) = 14px
                            <div key={i} style={{ position: 'absolute', left: `${m.col * 14}px` }}>{m.name}</div>
                        ))}
                     </div>

                     {/* The Grid (Rows=7, Flow=Col) - FIXED GAP: 2px */}
                     <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
                        {gridData.map((day, i) => (
                            <div 
                                key={i} 
                                title={day.date ? `${day.dateStr}: ${day.count} quizzes` : ''}
                                className={`w-3 h-3 rounded-[2px] ${day.intensity || 'invisible'} border border-transparent hover:border-white transition-all duration-150`}
                            ></div>
                        ))}
                     </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Less</span>
                <div className="w-3 h-3 rounded-[2px] bg-slate-800/50 border border-slate-700"></div>
                <div className="w-3 h-3 rounded-[2px] bg-purple-900/60"></div>
                <div className="w-3 h-3 rounded-[2px] bg-purple-600/80"></div>
                <div className="w-3 h-3 rounded-[2px] bg-purple-500"></div>
                <div className="w-3 h-3 rounded-[2px] bg-green-400"></div>
                <span>More</span>
            </div>
        </div>

        {/* RECENT ACTIVITY LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
             <h3 className="text-xl font-bold text-white mb-6">Recent Attempts</h3>
             <div className="space-y-3">
                 {profileData?.recentActivity?.length === 0 ? (
                     <div className="text-center py-8 text-slate-500 text-sm bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                        No activity recorded yet. Start a quiz to build your streak!
                     </div>
                 ) : (
                     profileData?.recentActivity?.map((act, i) => (
                         <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-purple-500/30 transition group">
                             <div>
                                 <div className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{act.quizId}</div>
                                 <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <Calendar size={12}/> {new Date(act.submittedAt).toLocaleDateString()} 
                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                    {new Date(act.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-purple-400 text-xl">{act.score}</div>
                                 <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Marks</div>
                             </div>
                         </div>
                     ))
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg, border }) => (
    <div className={`p-6 rounded-3xl border ${border} ${bg} flex items-center gap-5 transition hover:scale-[1.02] duration-300`}>
        <div className={`p-3.5 rounded-2xl bg-slate-950 ${color} shadow-inner ring-1 ring-inset ring-white/10`}>
            {icon}
        </div>
        <div>
            <div className="text-3xl font-black text-white tracking-tight">{value}</div>
            <div className={`text-xs font-bold uppercase tracking-wider opacity-80 ${color}`}>{label}</div>
        </div>
    </div>
);

export default StudentProfile;