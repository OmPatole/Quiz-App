import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const QuizTaking = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/quiz/${quizId}`);
            setQuiz(response.data);
            setTimeRemaining(response.data.duration * 60); // Convert to seconds

            // Initialize answers array
            const initialAnswers = response.data.questions.map((_, index) => ({
                questionIndex: index,
                selectedIndices: [],
            }));
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to load quiz');
            navigate('/student');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionIndex) => {
        const updatedAnswers = [...answers];
        const currentAnswer = updatedAnswers[currentQuestion];
        const question = quiz.questions[currentQuestion];

        if (question.isMultiSelect) {
            // Toggle selection for multi-select
            if (currentAnswer.selectedIndices.includes(optionIndex)) {
                currentAnswer.selectedIndices = currentAnswer.selectedIndices.filter(
                    (idx) => idx !== optionIndex
                );
            } else {
                currentAnswer.selectedIndices.push(optionIndex);
            }
        } else {
            // Single select replacement
            currentAnswer.selectedIndices = [optionIndex];
        }

        setAnswers(updatedAnswers);
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const confirmed = confirm('Are you sure you want to submit the quiz?');
        if (!confirmed) return;

        setSubmitting(true);
        try {
            const response = await api.post('/quiz/submit', {
                quizId,
                answers,
            });

            // Navigate to results page
            navigate('/student/result', { state: { result: response.data } });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const currentAnswer = answers[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="card mb-6 bg-neutral-900 border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {quiz.title}
                            </h1>
                            <p className="text-sm text-neutral-400">
                                Question {currentQuestion + 1} of {quiz.questions.length}
                            </p>
                        </div>

                        {/* Timer */}
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeRemaining < 60
                                ? 'bg-red-900/30 text-red-500 border border-red-900'
                                : 'bg-emerald-900/30 text-emerald-500 border border-emerald-900'
                                }`}
                        >
                            <Clock className="w-5 h-5" />
                            {formatTime(timeRemaining)}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="card mb-6 bg-neutral-900 border-neutral-800">
                    <div className="flex items-start gap-3 mb-6">
                        <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-emerald-900/20">
                            {currentQuestion + 1}
                        </span>
                        <div className="flex-1">
                            <p className="text-lg text-white font-medium mb-1">
                                {question.text}
                            </p>
                            <div className="flex gap-4 text-sm text-neutral-400">
                                <span>Marks: {question.marks}</span>
                                {question.isMultiSelect && <span className="text-emerald-500 font-medium">(Select all that apply)</span>}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = currentAnswer.selectedIndices.includes(index);
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                        ? 'border-emerald-500 bg-emerald-900/20 shadow-lg shadow-emerald-900/10'
                                        : 'border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 border-2 flex items-center justify-center ${question.isMultiSelect ? 'rounded' : 'rounded-full'
                                                } ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-500'
                                                    : 'border-neutral-600'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className={`w-2 h-2 bg-white ${question.isMultiSelect ? 'rounded-sm' : 'rounded-full'}`}></div>
                                            )}
                                        </div>
                                        <span className="text-white">
                                            {option.text}
                                        </span>
                                    </div>
                                    {option.image && (
                                        <img
                                            src={option.image}
                                            alt={`Option ${index + 1}`}
                                            className="mt-3 ml-8 max-w-xs rounded-lg border border-neutral-700"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                setCurrentQuestion((prev) =>
                                    Math.min(quiz.questions.length - 1, prev + 1)
                                )
                            }
                            className="btn-primary flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Warning for time */}
                {timeRemaining < 60 && (
                    <div className="mt-4 card bg-red-900/20 border-2 border-red-900/50">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <p className="font-medium">Less than 1 minute remaining!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizTaking;
