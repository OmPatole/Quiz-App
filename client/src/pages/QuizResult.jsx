import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Home, TrendingUp } from 'lucide-react';

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
                <div className="card mb-8 text-center bg-neutral-900 border-neutral-800">
                    <div
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 border ${passed
                            ? 'bg-emerald-900/20 border-emerald-900 text-emerald-500'
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
                            <p className="text-4xl font-bold text-emerald-500 mb-1">
                                {score}/{totalMarks}
                            </p>
                            <p className="text-sm text-neutral-400">
                                Total Score
                            </p>
                        </div>

                        <div className="w-px h-16 bg-neutral-800"></div>

                        <div>
                            <p
                                className={`text-4xl font-bold mb-1 ${passed ? 'text-emerald-500' : 'text-red-500'
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
                        <TrendingUp className={`w-5 h-5 ${passed ? 'text-emerald-500' : 'text-red-500'}`} />
                        <p
                            className={`font-semibold ${passed ? 'text-emerald-500' : 'text-red-500'
                                }`}
                        >
                            {passed ? 'Great job! You passed!' : 'Keep practicing!'}
                        </p>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Question-wise Results
                    </h2>

                    {detailedResults.map((item, index) => (
                        <div
                            key={index}
                            className={`card bg-neutral-900 border-neutral-800 ${item.isCorrect
                                ? 'border-l-4 border-l-emerald-500'
                                : 'border-l-4 border-l-red-500'
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${item.isCorrect
                                        ? 'bg-emerald-900/20 border-emerald-900 text-emerald-500'
                                        : 'bg-red-900/20 border-red-900 text-red-500'
                                        }`}
                                >
                                    {item.isCorrect ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-lg font-medium text-white">
                                            Question {index + 1}
                                        </p>
                                        <span
                                            className={`text-sm font-semibold ${item.isCorrect ? 'text-emerald-500' : 'text-red-500'
                                                }`}
                                        >
                                            {item.marks} marks
                                        </span>
                                    </div>

                                    <p className="text-neutral-300 mb-3">
                                        {item.questionText}
                                    </p>

                                    {/* Your Answer */}
                                    <div className="mb-2">
                                        <p className="text-sm font-semibold text-neutral-400 mb-1">
                                            Your Answer:
                                        </p>
                                        <p className="text-sm text-neutral-300">
                                            {item.selectedIndices.length > 0
                                                ? `Option(s): ${item.selectedIndices.map(i => i + 1).join(', ')}`
                                                : 'Not answered'}
                                        </p>
                                    </div>

                                    {/* Correct Answer */}
                                    {!item.isCorrect && (
                                        <div className="mb-3">
                                            <p className="text-sm font-semibold text-emerald-500 mb-1">
                                                Correct Answer:
                                            </p>
                                            <p className="text-sm text-neutral-300">
                                                Option(s): {item.correctIndices.map(i => i + 1).join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {item.explanation && (
                                        <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                                            <p className="text-sm font-semibold text-emerald-500 mb-1">
                                                Explanation:
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
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
