import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const WeeklyQuizzes = ({ completedQuizIds }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWeeklyQuizzes();
    }, []);

    const fetchWeeklyQuizzes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/chapters');
            const allWeeklyQuizzes = [];

            response.data.forEach(chapter => {
                if (chapter.quizzes && chapter.quizzes.length > 0) {
                    chapter.quizzes.forEach(quiz => {
                        if (quiz.quizType === 'weekly') {
                            allWeeklyQuizzes.push({
                                ...quiz,
                                chapterName: chapter.title
                            });
                        }
                    });
                }
            });

            // Sort by scheduledAt if available, newest first
            allWeeklyQuizzes.sort((a, b) => {
                if (!a.scheduledAt) return 1;
                if (!b.scheduledAt) return -1;
                return new Date(b.scheduledAt) - new Date(a.scheduledAt);
            });

            setQuizzes(allWeeklyQuizzes);
        } catch (error) {
            console.error('Error fetching weekly quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calendar className="text-blue-400" />
                        Weekly Assessments
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Scheduled weekly tests and formal assessments.
                    </p>
                </div>
            </div>

            {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => {
                        const isCompleted = completedQuizIds?.includes(quiz._id);
                        const scheduledDate = quiz.scheduledAt ? new Date(quiz.scheduledAt) : null;
                        const isUpcoming = scheduledDate && scheduledDate > new Date();

                        return (
                            <div
                                key={quiz._id}
                                className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <Calendar className="w-24 h-24 text-blue-400" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCompleted ? 'bg-green-500/10 text-green-500' :
                                                isUpcoming ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : 'Open'}
                                        </div>
                                        <span className="text-xs text-neutral-500 font-medium">#{quiz.category || 'General'}</span>
                                    </div>

                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {quiz.title}
                                    </h4>

                                    <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
                                        {quiz.description || "No description provided."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-neutral-800/50 rounded-lg p-3">
                                            <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1">Duration</p>
                                            <div className="flex items-center gap-1.5 text-white">
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-sm font-semibold">{quiz.duration}m</span>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-800/50 rounded-lg p-3">
                                            <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1">Module</p>
                                            <div className="text-white truncate text-sm font-semibold">
                                                {quiz.chapterName}
                                            </div>
                                        </div>
                                    </div>

                                    {scheduledDate && (
                                        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Scheduled: {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleStartQuiz(quiz._id)}
                                        disabled={isUpcoming && !isCompleted}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCompleted
                                                ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                                : isUpcoming
                                                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                Review Results
                                            </>
                                        ) : isUpcoming ? (
                                            <>
                                                <Clock className="w-4 h-4" />
                                                Not Yet Open
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 fill-current" />
                                                Start Assessment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-neutral-900 rounded-3xl border border-neutral-800 border-dashed">
                    <Calendar className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-500 font-medium">No weekly assessments found.</p>
                    <p className="text-neutral-600 text-sm mt-1">Keep an eye out for scheduled tests from your instructor.</p>
                </div>
            )}
        </div>
    );
};

export default WeeklyQuizzes;
