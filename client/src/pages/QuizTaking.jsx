import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

const QuizTaking = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (!quizId) return;

        const loadQuizAndProgress = async () => {
            try {
                // Fetch Quiz
                const response = await api.get(`/quiz/${quizId}`);
                const quizData = response.data;
                setQuiz(quizData);

                // Fetch Progress
                const progressRes = await api.get(`/quiz/progress/${quizId}`);

                if (progressRes.data.found) {
                    console.log("Resuming session...");
                    setTimeRemaining(progressRes.data.timeLeft);

                    // Reconstruct answers state from saved map
                    const savedAnswers = progressRes.data.answers; // Map { "0": [1], "1": [] }
                    const restoredAnswers = quizData.questions.map((_, index) => ({
                        questionIndex: index,
                        selectedIndices: savedAnswers[index.toString()] || []
                    }));
                    setAnswers(restoredAnswers);
                    toast.success("Resumed from your previous session!");
                } else {
                    // New Session
                    setTimeRemaining(quizData.duration * 60);
                    const initialAnswers = quizData.questions.map((_, index) => ({
                        questionIndex: index,
                        selectedIndices: [],
                    }));
                    setAnswers(initialAnswers);
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
                toast.error('Failed to load quiz');
                navigate('/student');
            } finally {
                setLoading(false);
            }
        };

        loadQuizAndProgress();
    }, [quizId]);

    // Submission Logic
    const processSubmission = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await api.post('/quiz/submit', {
                quizId,
                answers,
            });

            // Clear saved progress on successful submission
            await api.delete(`/quiz/progress/${quizId}`);

            // Navigate to results page
            navigate('/student/result', { state: { result: response.data } });
            toast.success("Quiz submitted successfully!");
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Failed to submit quiz. Please try again.');
            setSubmitting(false);
        }
    }, [submitting, quizId, answers, navigate, toast]);

    const handleAttemptSubmit = () => {
        if (timeRemaining > 0) {
            setIsConfirmOpen(true);
        } else {
            processSubmission();
        }
    };

    // Timer Logic
    useEffect(() => {
        if (loading || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    processSubmission();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, loading, processSubmission]);

    // Auto-Save Logic (Every 5 seconds)
    useEffect(() => {
        if (loading || !quiz || submitting) return;

        const saveInterval = setInterval(async () => {
            try {
                await api.post('/quiz/save-progress', {
                    quizId,
                    timeLeft: timeRemaining,
                    answers
                });
            } catch (err) {
                console.error("Auto-save failed", err);
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [quizId, timeRemaining, answers, loading, quiz, submitting]);


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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const currentAnswer = answers[currentQuestion];
    // Calculate progress based on answered questions
    const answeredCount = answers.filter(a => a.selectedIndices?.length > 0).length;
    const progress = (answeredCount / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-black font-sans text-white p-4">
            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6 max-w-[1920px] px-4 lg:px-8 mx-auto">
                {/* Left Column: Quiz Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    {quiz.title}
                                </h1>
                                <p className="text-sm text-neutral-400">
                                    Question {currentQuestion + 1} of {quiz.questions.length}
                                </p>
                            </div>

                            {/* Timer */}
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border transition-colors ${timeRemaining < 60
                                    ? 'bg-red-900/20 text-red-500 border-red-900/50'
                                    : 'bg-blue-900/20 text-blue-500 border-blue-900/50'
                                    }`}
                            >
                                <Clock className="w-5 h-5" />
                                {formatTime(timeRemaining)}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4 mb-8">
                            <span className="flex-shrink-0 w-10 h-10 bg-neutral-800 text-blue-500 border border-neutral-700 rounded-full flex items-center justify-center font-bold text-lg">
                                {currentQuestion + 1}
                            </span>
                            <div className="flex-1 mt-1">
                                <p className="text-lg md:text-xl text-white font-medium mb-3 leading-relaxed">
                                    {question.text}
                                </p>
                                <div className="flex gap-4 text-sm text-neutral-500 font-medium">
                                    <span className="px-2 py-0.5 bg-neutral-950 rounded border border-neutral-800">Marks: {question.marks}</span>
                                    {question.isMultiSelect && <span className="text-blue-500">(Select all that apply)</span>}
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-4 pl-0 md:pl-14">
                            {question.options?.map((option, index) => {
                                const isSelected = currentAnswer?.selectedIndices?.includes(index);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-900/10'
                                            : 'border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 ${question.isMultiSelect ? 'rounded' : 'rounded-full'
                                                    } ${isSelected
                                                        ? 'border-blue-500 bg-blue-600'
                                                        : 'border-neutral-600'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className={`w-2.5 h-2.5 bg-neutral-200 ${question.isMultiSelect ? 'rounded-sm' : 'rounded-full'}`}></div>
                                                )}
                                            </div>
                                            <span className="text-neutral-200 text-lg">
                                                {option.text}
                                            </span>
                                        </div>
                                        {option.image && (
                                            <img
                                                src={option.image}
                                                alt={`Option ${index + 1}`}
                                                className="mt-4 ml-10 max-w-sm rounded-lg border border-neutral-700"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation - Sticky on Mobile */}
                    <div className="sticky bottom-4 md:static bg-black/90 backdrop-blur-md md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border border-neutral-800 md:border-0 shadow-2xl md:shadow-none z-10">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 rounded-lg font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-transparent hover:border-neutral-800 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>

                            {currentQuestion === quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleAttemptSubmit}
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                                >
                                    <Send className="w-5 h-5" />
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        setCurrentQuestion((prev) =>
                                            Math.min(quiz.questions.length - 1, prev + 1)
                                        )
                                    }
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Warning for time */}
                    {timeRemaining < 60 && (
                        <div className="mt-6 p-4 rounded-xl bg-red-900/10 border border-red-900/50 flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <p className="font-bold text-red-500">Less than 1 minute remaining!</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Question Palette */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Question Palette</h3>
                            <span className="text-sm text-neutral-400 font-medium">
                                {answeredCount}/{quiz.questions.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {quiz.questions.map((_, index) => {
                                const isAnswered = answers[index]?.selectedIndices?.length > 0;
                                const isCurrent = currentQuestion === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`
                                            h-10 w-10 rounded-lg text-sm font-bold transition-all
                                            ${isCurrent
                                                ? 'border-2 border-yellow-500 bg-neutral-800 text-white scale-110'
                                                : isAnswered
                                                    ? 'bg-green-600 text-white border border-green-500'
                                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                            }
                                        `}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="w-3 h-3 rounded bg-green-600 border border-green-500"></span> Answered
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="w-3 h-3 rounded bg-neutral-800 border-2 border-yellow-500"></span> Current
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="w-3 h-3 rounded bg-neutral-800 border border-neutral-700"></span> Unanswered
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    setIsConfirmOpen(false);
                    processSubmission();
                }}
                title="Submit Quiz?"
                description="Are you sure you want to finish and submit this quiz? You cannot change your answers after submission."
                confirmText="Yes, Submit"
                variant="warning"
            />
        </div>
    );
};

export default QuizTaking;
