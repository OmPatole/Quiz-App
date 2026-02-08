import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Clock, BookOpen, AlertCircle, FileText } from 'lucide-react';
import api from '../api/axios';

const ChapterDetails = () => {
    const { chapterId } = useParams();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapter = async () => {
            try {
                const response = await api.get(`/chapters/${chapterId}`);
                setChapter(response.data);
            } catch (error) {
                console.error('Error fetching chapter:', error);

            } finally {
                setLoading(false);
            }
        };

        if (chapterId) {
            fetchChapter();
        }
    }, [chapterId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="min-h-screen bg-neutral-950 font-sans text-white p-4 md:p-8 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/student')}
                    className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="mb-12 relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 md:p-12">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <BookOpen className="w-64 h-64 text-yellow-400" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm mb-2 block">
                            Learning Module
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            {chapter.title}
                        </h1>
                        <p className="text-neutral-400 text-lg max-w-2xl">
                            Master this topic by completing the practice quizzes below.
                            Each quiz is designed to test different aspects of your understanding.
                        </p>

                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-neutral-300">
                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-yellow-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="font-bold">{chapter.quizzes?.length || 0}</span> Quizzes
                            </div>
                            {/* Can add more aggregate stats here later */}
                        </div>
                    </div>
                </div>

                {/* Quiz List */}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Play className="w-6 h-6 text-yellow-400" />
                    Available Quizzes
                </h2>

                {(!chapter.quizzes || chapter.quizzes.length === 0) ? (
                    <div className="text-center py-20 bg-neutral-900 rounded-2xl border border-neutral-800 border-dashed">
                        <p className="text-neutral-500">No quizzes available for this chapter yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chapter.quizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                                className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-yellow-500/50 hover:bg-neutral-900/80 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors shadow-lg shadow-yellow-900/10">
                                        <span className="font-bold text-lg">{index + 1}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${quiz.quizType === 'Mock'
                                        ? 'bg-purple-900/20 text-purple-400 border-purple-900/50'
                                        : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'
                                        }`}>
                                        {quiz.quizType || 'Practice'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                    {quiz.title}
                                </h3>

                                <p className="text-sm text-neutral-500 mb-6 line-clamp-2">
                                    {quiz.description || "Test your knowledge with this practice set."}
                                </p>

                                <div className="flex items-center justify-between text-sm text-neutral-400 border-t border-neutral-800 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{quiz.duration} mins</span>
                                    </div>

                                    <span className="flex items-center gap-1 text-yellow-400 font-bold group-hover:translate-x-1 transition-transform">
                                        Start <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterDetails;
