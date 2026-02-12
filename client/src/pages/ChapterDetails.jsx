import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Clock, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import Logo from '../components/common/Logo';

const ChapterDetails = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [completedQuizIds, setCompletedQuizIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [chapterRes, resultsRes] = await Promise.all([
                    api.get(`/chapters/${chapterId}`),
                    api.get('/quiz/my-results')
                ]);

                setChapter(chapterRes.data);

                // Extract completed quiz IDs
                const completedIds = resultsRes.data.map(r => r.quizId._id || r.quizId);
                setCompletedQuizIds(completedIds);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (chapterId) {
            fetchData();
        }
    }, [chapterId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Chapter Not Found</h2>
                <button
                    onClick={() => navigate('/student')}
                    className="mt-4 btn-primary flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo />
                    <button
                        onClick={() => navigate('/student')}
                        className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 animate-in fade-in duration-500">

                <div className="mb-12 relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-8 md:p-12 shadow-sm dark:shadow-none">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <BookOpen className="w-64 h-64 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-sm mb-2 block">
                            Learning Module
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                            {chapter.title}
                        </h1>
                        <p className="text-gray-500 dark:text-neutral-400 text-lg max-w-2xl">
                            Master this topic by completing the practice quizzes below.
                            Each quiz is designed to test different aspects of your understanding.
                        </p>

                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-300">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="font-bold">{chapter.quizzes?.length || 0}</span> Quizzes
                            </div>
                            {/* Can add more aggregate stats here later */}
                        </div>
                    </div>
                </div>

                {/* Quiz List */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Available Quizzes
                </h2>

                {(!chapter.quizzes || chapter.quizzes.length === 0) ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 border-dashed">
                        <p className="text-gray-500 dark:text-neutral-500">No quizzes available for this chapter yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chapter.quizzes.map((quiz, index) => {
                            const isCompleted = completedQuizIds.includes(quiz._id);
                            return (
                                <div
                                    key={quiz._id}
                                    onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                                    className={`group border rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none
                                        ${isCompleted
                                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 hover:border-green-500/50'
                                            : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-neutral-900/80'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-lg
                                            ${isCompleted
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-green-500/10'
                                                : 'bg-gray-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white shadow-blue-500/10'
                                            }`}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold text-lg">{index + 1}</span>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${quiz.quizType === 'Mock'
                                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50'
                                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                                            }`}>
                                            {quiz.quizType || 'Practice'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {quiz.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 dark:text-neutral-500 mb-6 line-clamp-2">
                                        {quiz.description || "Test your knowledge with this practice set."}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-400 dark:text-neutral-400 border-t border-gray-100 dark:border-neutral-800 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{quiz.duration} mins</span>
                                        </div>

                                        {isCompleted ? (
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                                                Start <ChevronLeft className="w-4 h-4 rotate-180" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterDetails;
