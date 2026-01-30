import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Trophy, ArrowLeft, Clock, User, ShieldAlert } from 'lucide-react';

const Leaderboard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate(); // Initialize hook
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-Refresh
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/leaderboard/${quizId}`);
        setData(res.data);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };

    fetchData(); 
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [quizId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
              <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Trophy size={24} /></div>
                  <h1 className="text-3xl font-bold text-white">Live Rankings</h1>
              </div>
              <p className="text-slate-400 ml-11">Updates every 3 seconds</p>
          </div>
          
          {/* UPDATED: Buttons */}
          <div className="flex gap-2">
            <Link to="/leaderboards" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium transition">All Quizzes</Link>
            
            {/* Functional Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium flex items-center gap-2 transition text-slate-200"
            >
                <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
             <div className="p-12 text-center text-slate-500 animate-pulse">Syncing results...</div>
          ) : data.length === 0 ? (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                 <User size={48} className="mb-2 opacity-20" />
                 No submissions yet. Be the first!
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                    <th className="p-5 w-24 text-center">Rank</th>
                    <th className="p-5">Student</th>
                    <th className="p-5 hidden sm:table-cell">Details</th>
                    <th className="p-5 text-right">Score</th>
                    <th className="p-5 text-center hidden sm:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.map((entry, index) => {
                    let RankIcon = <span className="text-slate-500 font-mono text-xl">#{index + 1}</span>;
                    let RowStyle = "hover:bg-slate-800/50";
                    
                    if(index === 0) {
                        RankIcon = <div className="text-4xl animate-bounce">🥇</div>;
                        RowStyle = "bg-yellow-900/10 hover:bg-yellow-900/20 border-l-4 border-yellow-500";
                    } else if(index === 1) {
                        RankIcon = <div className="text-3xl">🥈</div>;
                        RowStyle = "bg-slate-800/30 hover:bg-slate-800/50 border-l-4 border-slate-400";
                    } else if(index === 2) {
                        RankIcon = <div className="text-3xl">🥉</div>;
                        RowStyle = "bg-orange-900/10 hover:bg-orange-900/20 border-l-4 border-orange-700";
                    }

                    return (
                        <tr key={index} className={`transition duration-150 ${RowStyle}`}>
                            <td className="p-5 text-center">
                                <div className="flex justify-center items-center drop-shadow-lg">{RankIcon}</div>
                            </td>
                            <td className="p-5">
                                <div className={`font-bold text-lg ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                    {entry.studentName}
                                </div>
                                {entry.status.includes('Terminated') && (
                                    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded mt-1 w-fit border border-red-400/20">
                                        <ShieldAlert size={10} /> Disqualified
                                    </span>
                                )}
                            </td>
                            <td className="p-5 hidden sm:table-cell">
                                <div className="text-sm text-slate-300">{entry.year}</div>
                                <div className="text-xs text-slate-500 font-mono">{entry.prn}</div>
                            </td>
                            <td className="p-5 text-right">
                                <div className="text-2xl font-bold text-purple-400">{entry.score}</div>
                                <div className="text-xs text-slate-600">/ {entry.totalMarks}</div>
                            </td>
                            <td className="p-5 text-center text-slate-500 text-sm hidden sm:table-cell">
                                <div className="flex items-center justify-center gap-1">
                                    <Clock size={14} />
                                    {new Date(entry.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                </div>
                            </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;