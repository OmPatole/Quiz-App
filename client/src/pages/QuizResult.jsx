import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Home, TrendingUp, Flame } from 'lucide-react';

const QuizResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        navigate('/student');
        return null;
    }

    const { score, totalMarks, percentage, detailedResults } = result;
    const passed = percentage >= 50;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 py-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Score Card */}
                {/* Score Card */}
                <div className="card mb-8 text-center bg-neutral-900 border-neutral-800">
                    <div
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 border ${passed
                            ? 'bg-blue-900/20 border-blue-900 text-blue-400'
                            : 'bg-red-900/20 border-red-900 text-red-500'
                            }`}
                    >
                        <Award className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">
                        Quiz Completed!
                    </h1>

                    <div className="flex items-center justify-center gap-8 mt-6">
                        <div>
                            <p className="text-4xl font-bold text-blue-400 mb-1">
                                {score}/{totalMarks}
                            </p>
                            <p className="text-sm text-neutral-400">
                                Total Score
                            </p>
                        </div>

                        <div className="w-px h-16 bg-neutral-800"></div>

                        <div>
                            <p
                                className={`text-4xl font-bold mb-1 ${passed ? 'text-blue-400' : 'text-red-500'
                                    }`}
                            >
                                {percentage}%
                            </p>
                            <p className="text-sm text-neutral-400">
                                Percentage
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <TrendingUp className={`w-5 h-5 ${passed ? 'text-blue-400' : 'text-red-500'}`} />
                        <p
                            className={`font-semibold ${passed ? 'text-blue-400' : 'text-red-500'
                                }`}
                        >
                            {passed ? 'Great job! You passed!' : 'Keep practicing!'}
                        </p>
                    </div>
                </div>

                {/* Streak Celebration */}
                {result.streak?.updated && (
                    <div className="card mb-8 bg-blue-900/10 border-blue-900/30 text-center animate-in scale-90 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/20 rounded-full mb-4 text-blue-500">
                            <Flame className="w-8 h-8 fill-current animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-500 mb-1">
                            {result.streak.current} Day Streak!
                        </h2>
                        <p className="text-neutral-400">
                            Keep practicing to beat your best of {result.streak.longest} days.
                        </p>
                    </div>
                )}

                {/* Detailed Results */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                        Detailed Analysis
                    </h2>

                    {detailedResults.map((item, index) => (
                        <div
                            key={index}
                            className={`card bg-neutral-900 border-neutral-800 transition-all ${item.isCorrect
                                ? 'border-l-4 border-l-blue-500 shadow-blue-900/5'
                                : 'border-l-4 border-l-red-500 shadow-red-900/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white">
                                    Question {index + 1}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isCorrect ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-500'}`}>
                                    {item.isCorrect ? `+${item.marks} Marks` : '0 Marks'}
                                </span>
                            </div>

                            <p className="text-neutral-300 mb-6 font-medium text-lg leading-relaxed">
                                {item.questionText}
                            </p>

                            {/* Options with Visual Feedback */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {item.options?.map((opt, optIdx) => {
                                    const isSelected = item.selectedIndices.includes(optIdx);
                                    const isCorrectOpt = item.correctIndices.includes(optIdx);

                                    let borderColor = 'border-neutral-800';
                                    let bgColor = 'bg-neutral-800/50';
                                    let icon = null;

                                    if (isCorrectOpt) {
                                        borderColor = 'border-blue-500';
                                        bgColor = 'bg-blue-900/20';
                                        icon = <CheckCircle className="w-4 h-4 text-blue-400" />;
                                    } else if (isSelected && !isCorrectOpt) {
                                        borderColor = 'border-red-500';
                                        bgColor = 'bg-red-900/20';
                                        icon = <XCircle className="w-4 h-4 text-red-500" />;
                                    }

                                    return (
                                        <div key={optIdx} className={`p-4 rounded-xl border ${borderColor} ${bgColor} flex items-center justify-between`}>
                                            <span className={`text-sm ${isCorrectOpt ? 'text-blue-400 font-bold' : isSelected ? 'text-red-400' : 'text-neutral-400'}`}>
                                                {opt.text}
                                            </span>
                                            {icon}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Explanation */}
                            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Explanation
                                </p>
                                <p className="text-neutral-400 leading-relaxed">
                                    {item.explanation || "No explanation provided for this question."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/student')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResult;
