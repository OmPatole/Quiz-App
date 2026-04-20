import { useState, useEffect } from 'react';
import { Trophy, ChevronRight, Calendar, Users, Search } from 'lucide-react';
import api from '../../api/axios';
import WeeklyQuizLeaderboard from '../common/WeeklyQuizLeaderboard';

const AdminLeaderboard = () => {
    const [weeklyQuizzes, setWeeklyQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchWeeklyQuizzes();
    }, []);

    const fetchWeeklyQuizzes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/chapters');
            const allWeekly = [];
            response.data.forEach(chapter => {
                (chapter.quizzes || []).forEach(quiz => {
                    if (quiz.quizType === 'weekly') {
                        allWeekly.push({ ...quiz, chapterName: chapter.title });
                    }
                });
            });
            // Newest first
            allWeekly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setWeeklyQuizzes(allWeekly);
            if (allWeekly.length > 0 && !selectedQuizId) {
                setSelectedQuizId(allWeekly[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch weekly quizzes', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = weeklyQuizzes.filter(q =>
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.chapterName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (weeklyQuizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Trophy className="w-16 h-16 text-neutral-800 mb-4" />
                <p className="text-neutral-400 font-semibold text-lg">No Weekly Quizzes Found</p>
                <p className="text-neutral-600 text-sm mt-1">Create weekly quizzes in Quiz Management to see leaderboards here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Left: Quiz selector */}
            <div className="lg:w-80 flex-shrink-0 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Weekly Quizzes</h3>
                        <span className="ml-auto text-xs text-neutral-500 font-bold bg-neutral-800 px-2 py-0.5 rounded-full">
                            {weeklyQuizzes.length}
                        </span>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search quizzes…"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50">
                    {filtered.length === 0 ? (
                        <p className="text-neutral-500 text-sm text-center py-8">No results</p>
                    ) : filtered.map(quiz => {
                        const isSel = selectedQuizId === quiz._id;
                        const scheduled = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
                        return (
                            <button
                                key={quiz._id}
                                onClick={() => setSelectedQuizId(quiz._id)}
                                className={`w-full text-left px-4 py-3.5 transition-all flex items-start gap-3 group
                                    ${isSel ? 'bg-blue-600/10 border-l-2 border-blue-500' : 'hover:bg-neutral-800/50 border-l-2 border-transparent'}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                                    ${isSel ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700'}
                                `}>
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${isSel ? 'text-blue-300' : 'text-white'}`}>
                                        {quiz.title}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">{quiz.chapterName}</p>
                                    {scheduled && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3 text-neutral-600" />
                                            <span className="text-[10px] text-neutral-600">
                                                {scheduled.toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${isSel ? 'text-blue-400' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Leaderboard */}
            <div className="flex-1 min-h-[500px]">
                {selectedQuizId ? (
                    <WeeklyQuizLeaderboard
                        key={selectedQuizId}
                        quizId={selectedQuizId}
                        isModal={false}
                        className="h-full"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                        <div className="text-center">
                            <Trophy className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-400">Select a quiz to view its leaderboard</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeaderboard;
