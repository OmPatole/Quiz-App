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
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

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
        if (answeredCount === 0) {
            toast.error("Please answer at least one question before submitting.");
            return;
        }
        if (timeRemaining > 0) {
            setIsConfirmOpen(true);
        } else {
            processSubmission();
        }
    };

    const handleQuit = () => {
        setIsQuitModalOpen(true);
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
        <div className="min-h-screen bg-black font-sans text-white flex flex-col">
            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-12 max-w-[1920px] px-4 lg:px-16 mx-auto w-full flex-grow items-center justify-center py-12">

                {/* Left Column: Timer (Desktop) */}
                <div className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-12 h-fit">
                    <div className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.4)] ${timeRemaining < 60
                        ? 'bg-red-950/20 border-red-500/50 text-red-500 shadow-red-900/10'
                        : 'bg-blue-950/20 border-blue-500/50 text-blue-500 shadow-blue-900/10'
                        }`}>
                        <div className="w-16 h-16 rounded-full bg-current/10 flex items-center justify-center">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div className="text-4xl font-mono font-black tracking-tight">
                            {formatTime(timeRemaining)}
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50">Time Remaining</div>
                    </div>
                </div>

                {/* Center Column: Quiz Content */}
                <div className="flex-1 flex flex-col gap-8 max-w-5xl w-full">
                    {/* Top Control Bar */}
                    <div className="flex items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-md p-4 rounded-2xl border border-neutral-800 shadow-lg mb-2">
                        <button
                            onClick={handleQuit}
                            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all border border-neutral-700"
                        >
                            Quit Quiz
                        </button>
                        <div className="flex-1 text-center truncate">
                            <h1 className="text-xl font-black text-white truncate px-4">{quiz.title}</h1>
                        </div>
                        <div className="w-[85px] text-right">
                            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Progress</div>
                            <div className="text-sm font-mono font-bold text-blue-500">{Math.round(progress)}%</div>
                        </div>
                    </div>

                    {/* Progress Bar (Global) */}
                    <div className="w-full bg-neutral-900/50 rounded-full h-1.5 mb-2 overflow-hidden border border-neutral-800">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Mobile Timer (Shown only on small screens) */}
                    <div className="lg:hidden flex items-center justify-center p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                        <div className={`flex items-center gap-3 font-mono text-2xl font-black ${timeRemaining < 60 ? 'text-red-500' : 'text-blue-500'}`}>
                            <Clock className="w-6 h-6" />
                            {formatTime(timeRemaining)}
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="flex-1 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-8 lg:p-12 shadow-2xl flex flex-col min-h-[600px]">
                        <div className="flex items-start gap-6 mb-10">
                            <span className="flex-shrink-0 w-12 h-12 bg-neutral-800 text-blue-500 border border-neutral-700 rounded-full flex items-center justify-center font-black text-xl">
                                {currentQuestion + 1}
                            </span>
                            <div className="flex-1 mt-1">
                                <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold mb-4 leading-tight">
                                    {question.text}
                                </p>
                                <div className="flex gap-6 text-base text-neutral-500 font-bold uppercase tracking-wider">
                                    <span className="px-3 py-1 bg-neutral-950 rounded-lg border border-neutral-800">Marks: {question.marks}</span>
                                    {question.isMultiSelect && <span className="text-blue-500 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Select all that apply
                                    </span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            {/* Options */}
                            <div className="space-y-5 pl-0 md:pl-16">
                                {question.options?.map((option, index) => {
                                    const isSelected = currentAnswer?.selectedIndices?.includes(index);
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleOptionSelect(index)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col gap-4 ${isSelected
                                                ? 'border-blue-500 bg-blue-900/10 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                                                : 'border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div
                                                    className={`w-7 h-7 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${question.isMultiSelect ? 'rounded-lg' : 'rounded-full'
                                                        } ${isSelected
                                                            ? 'border-blue-500 bg-blue-600'
                                                            : 'border-neutral-600'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <div className={`w-3 h-3 bg-white ${question.isMultiSelect ? 'rounded-sm' : 'rounded-full'}`}></div>
                                                    )}
                                                </div>
                                                <span className={`text-xl font-medium transition-colors ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
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
                        <div className="mt-2 p-4 rounded-xl bg-red-900/10 border border-red-900/50 flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <p className="font-bold text-red-500">Less than 1 minute remaining!</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Question Palette (Desktop) */}
                <div className="w-full lg:w-80 flex-shrink-0 sticky top-12 h-fit">
                    <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800 rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Question Palette</h3>
                            <span className="text-xs text-neutral-400 font-bold bg-neutral-800/50 px-2 py-1 rounded-full">
                                {answeredCount}/{quiz.questions.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2.5">
                            {quiz.questions.map((_, index) => {
                                const isAnswered = answers[index]?.selectedIndices?.length > 0;
                                const isCurrent = currentQuestion === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`
                                            h-11 w-11 rounded-xl text-base font-black transition-all duration-300
                                            ${isCurrent
                                                ? 'border-2 border-yellow-500 bg-neutral-800 text-white scale-110 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : isAnswered
                                                    ? 'bg-green-600 text-white border border-green-500 shadow-[0_0_10px_rgba(22,163,74,0.2)]'
                                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-500'
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
                description={`You have answered ${answeredCount} out of ${quiz.questions.length} questions. Are you sure you want to finish and submit?`}
                confirmText="Yes, Submit"
                variant="warning"
            />

            <ConfirmationModal
                isOpen={isQuitModalOpen}
                onClose={() => setIsQuitModalOpen(false)}
                onConfirm={() => {
                    navigate('/student');
                }}
                title="Quit Quiz?"
                description="Are you sure you want to quit? Your current progress will be saved, but the timer will continue if you don't return quickly."
                confirmText="Yes, Quit"
                variant="danger"
            />
        </div>
    );
};

export default QuizTaking;
