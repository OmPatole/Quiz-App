import { useState, useEffect } from 'react';
import { Trophy, Medal, X, Users, Clock, TrendingUp, Crown, Star, Award, ChevronUp } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const rankMedal = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', label: '1st' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/30', label: '2nd' };
    if (rank === 3) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/30', label: '3rd' };
    return null;
};

const ScoreBar = ({ percentage }) => (
    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
        <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${Math.min(percentage, 100)}%` }}
        />
    </div>
);

const formatTimeTaken = (seconds) => {
    if (seconds == null || seconds < 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
};

const LeaderboardRow = ({ entry, isMe, index }) => {
    const medal = rankMedal(entry.rank);
    const timeTakenStr = formatTimeTaken(entry.timeTaken);

    return (
        <div
            className={`
                relative flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-300
                ${isMe
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-blue-900/20 shadow-lg'
                    : index % 2 === 0
                        ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-900/30 border-neutral-800/50 hover:border-neutral-700'
                }
            `}
        >
            {/* Rank */}
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
                {medal ? (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${medal.bg}`}>
                        <medal.icon className={`w-4 h-4 ${medal.color}`} />
                    </div>
                ) : (
                    <span className="text-neutral-500 font-bold text-sm w-9 text-center">#{entry.rank}</span>
                )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${isMe ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}
                    `}
                >
                    {entry.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate text-sm ${isMe ? 'text-blue-300' : 'text-white'}`}>
                            {entry.name}
                            {isMe && <span className="ml-1 text-xs text-blue-400 font-bold">(You)</span>}
                        </p>
                    </div>
                    <p className="text-neutral-500 text-xs truncate">{entry.prn}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span className="text-neutral-600 text-[10px]">{timeTakenStr}</span>
                    </div>
                </div>
            </div>

            {/* Score */}
            <div className="hidden sm:flex flex-col items-end gap-1 w-28 flex-shrink-0">
                <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-bold ${isMe ? 'text-blue-300' : 'text-white'}`}>
                        {entry.score}/{entry.totalMarks}
                    </span>
                    <span className="text-neutral-500 text-[10px]">marks</span>
                </div>
                <ScoreBar percentage={entry.percentage} />
                <span className="text-[10px] text-neutral-400">{entry.percentage}%</span>
            </div>

            {/* Mobile Score */}
            <div className="flex sm:hidden flex-col items-end">
                <span className={`text-sm font-bold ${isMe ? 'text-blue-300' : 'text-white'}`}>
                    {entry.percentage}%
                </span>
                <span className="text-neutral-500 text-[10px]">{entry.score}/{entry.totalMarks}</span>
            </div>
        </div>
    );
};

/**
 * WeeklyQuizLeaderboard
 *
 * Can be rendered two ways:
 *  1. As a modal overlay (isModal=true) — triggered by a button
 *  2. Inline / full-page section (isModal=false, default)
 *
 * Props:
 *  - quizId      : The weekly quiz ID to load the leaderboard for
 *  - isModal     : boolean (default false)
 *  - onClose     : function — called when close button clicked (required when isModal=true)
 *  - className   : extra className for the root element
 */
const WeeklyQuizLeaderboard = ({ quizId, isModal = false, onClose, className = '' }) => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!quizId) return;
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/quiz/leaderboard/${quizId}`);
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [quizId]);

    const top3 = data?.leaderboard?.slice(0, 3) ?? [];
    const rest = data?.leaderboard?.slice(3) ?? [];

    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

    const content = (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                        {data && (
                            <p className="text-neutral-400 text-xs truncate max-w-[200px]">{data.quizTitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {data && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 rounded-full">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-neutral-300 text-xs font-bold">{data.totalParticipants} participants</span>
                        </div>
                    )}
                    {isModal && onClose && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                            aria-label="Close leaderboard"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex-1 flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-neutral-500 text-sm">Loading leaderboard…</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="flex-1 flex items-center justify-center py-16">
                    <div className="text-center">
                        <Trophy className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                        <p className="text-neutral-400 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && data && (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1">
                    {data.totalParticipants === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-400 font-medium">No submissions yet</p>
                            <p className="text-neutral-600 text-sm mt-1">Be the first to complete this quiz!</p>
                        </div>
                    ) : (
                        <>
                            {/* My Rank Banner (students only) */}
                            {data.myRank && user?.role === 'Student' && (
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/30">
                                    <Star className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <p className="text-blue-300 text-sm font-semibold">
                                        Your rank: #{data.myRank} out of {data.totalParticipants} participants
                                    </p>
                                </div>
                            )}

                            {/* Podium for Top 3 */}
                            {top3.length > 0 && (
                                <div className="flex items-end justify-center gap-2 pb-2 pt-2">
                                    {podiumOrder.map((entry, i) => {
                                        if (!entry) return null;
                                        const medal = rankMedal(entry.rank);
                                        const isMe = entry.studentId?.toString() === user?._id?.toString();
                                        const heights = top3.length === 3
                                            ? ['h-20', 'h-28', 'h-16'] // 2nd, 1st, 3rd
                                            : ['h-28', 'h-20'];
                                        return (
                                            <div key={entry.studentId} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                                                <div className="text-center">
                                                    <div
                                                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold mb-1
                                                            ${isMe ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-white'}
                                                        `}
                                                    >
                                                        {entry.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <p className="text-white text-xs font-bold truncate w-24 text-center mx-auto leading-tight">
                                                        {entry.name?.split(' ')[0]}
                                                    </p>
                                                    <p className={`text-xs font-bold ${medal?.color}`}>{entry.percentage}%</p>
                                                </div>
                                                <div
                                                    className={`
                                                        w-full ${heights[i]} rounded-t-xl flex flex-col items-center justify-center gap-1 border
                                                        ${entry.rank === 1 ? 'bg-yellow-400/10 border-yellow-400/30' :
                                                            entry.rank === 2 ? 'bg-slate-400/10 border-slate-400/30' :
                                                                'bg-amber-700/10 border-amber-700/30'}
                                                    `}
                                                >
                                                    {medal && <medal.icon className={`w-5 h-5 ${medal.color}`} />}
                                                    <span className={`text-sm font-black ${medal?.color}`}>{medal?.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Full ranked list */}
                            <div className="space-y-2">
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider px-1 mb-2">
                                    All Participants
                                </p>
                                {data.leaderboard.map((entry, index) => (
                                    <LeaderboardRow
                                        key={entry.studentId}
                                        entry={entry}
                                        index={index}
                                        isMe={entry.studentId?.toString() === user?._id?.toString()}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            >
                <div
                    className="relative bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {content}
                </div>
            </div>
        );
    }

    // Inline / section view
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-full flex flex-col">
            {content}
        </div>
    );
};

export default WeeklyQuizLeaderboard;
