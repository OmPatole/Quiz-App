import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, Clock, Calendar, CheckCircle, ChevronDown, ChevronUp, Database, Search, Shuffle, List } from 'lucide-react';
import api from '../../api/axios';

const QuizBuilder = ({ onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        chapter: '',
        quizType: 'practice',
        duration: 30,
        scheduledAt: '',
        questions: [{
            text: '',
            marks: 1,
            isMultiSelect: false,
            options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            explanation: '',
            correctIndices: []
        }]
    });

    // Question Bank State
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [questionBank, setQuestionBank] = useState([]);
    const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
    const [bankSearch, setBankSearch] = useState('');
    const [bankLoading, setBankLoading] = useState(false);

    // Quiz Selection State (for Weekly Tests)
    const [showQuizSelector, setShowQuizSelector] = useState(false);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [selectedQuizQuestions, setSelectedQuizQuestions] = useState([]);
    const [quizSelectorLoading, setQuizSelectorLoading] = useState(false);

    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({ ...prev, [name]: value }));
    };

    // Question Management
    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                text: '',
                marks: 1,
                isMultiSelect: false,
                options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                explanation: '',
                correctIndices: []
            }]
        }));
    };

    const removeQuestion = (idx) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx)
        }));
    };

    const updateQuestion = (idx, field, value) => {
        setQuizData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[idx] = { ...newQuestions[idx], [field]: value };
            return { ...prev, questions: newQuestions };
        });
    };

    // Option Management
    const addOption = (qIdx) => {
        setQuizData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[qIdx].options.push({ text: '', isCorrect: false });
            return { ...prev, questions: newQuestions };
        });
    };

    const removeOption = (qIdx, oIdx) => {
        setQuizData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[qIdx].options = newQuestions[qIdx].options.filter((_, i) => i !== oIdx);
            return { ...prev, questions: newQuestions };
        });
    };

    const updateOptionText = (qIdx, oIdx, text) => {
        setQuizData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[qIdx].options[oIdx].text = text;
            return { ...prev, questions: newQuestions };
        });
    };

    const toggleCorrectOption = (qIdx, oIdx) => {
        setQuizData(prev => {
            const newQuestions = [...prev.questions];
            const question = newQuestions[qIdx];

            if (question.isMultiSelect) {
                // Toggle
                question.options[oIdx].isCorrect = !question.options[oIdx].isCorrect;
            } else {
                // Radio behavior
                question.options.forEach((opt, i) => {
                    opt.isCorrect = i === oIdx;
                });
            }
            return { ...prev, questions: newQuestions };
        });
    };

    // Question Bank Handlers
    const openQuestionBank = async () => {
        setShowQuestionBank(true);
        if (questionBank.length === 0) {
            setBankLoading(true);
            try {
                const res = await api.get('/admin/questions/bank');
                setQuestionBank(res.data);
            } catch (err) {
                console.error("Failed to fetch question bank", err);
            } finally {
                setBankLoading(false);
            }
        }
    };

    const toggleBankQuestion = (q) => {
        if (selectedBankQuestions.find(sq => sq._id === q._id)) {
            setSelectedBankQuestions(prev => prev.filter(sq => sq._id !== q._id));
        } else {
            setSelectedBankQuestions(prev => [...prev, q]);
        }
    };

    const importQuestions = () => {
        const newQuestions = selectedBankQuestions.map(q => ({
            text: q.questionText,
            marks: q.marks || 1,
            isMultiSelect: q.correctIndices.length > 1,
            options: q.options.map((o, i) => ({
                text: o.text,
                isCorrect: q.correctIndices.includes(i)
            })),
            explanation: q.explanation || '',
            correctIndices: []
        }));

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, ...newQuestions]
        }));

        setSelectedBankQuestions([]);
        setShowQuestionBank(false);
    };

    // Quiz Selector Handlers (for Weekly Tests)
    const openQuizSelector = async () => {
        setShowQuizSelector(true);
        if (availableQuizzes.length === 0) {
            setQuizSelectorLoading(true);
            try {
                const chaptersRes = await api.get('/admin/chapters');
                const allQuizzes = [];
                chaptersRes.data.forEach(chapter => {
                    if (chapter.quizzes && chapter.quizzes.length > 0) {
                        chapter.quizzes.forEach(quiz => {
                            allQuizzes.push({
                                ...quiz,
                                chapterName: chapter.title
                            });
                        });
                    }
                });
                setAvailableQuizzes(allQuizzes);
            } catch (err) {
                console.error("Failed to fetch quizzes", err);
            } finally {
                setQuizSelectorLoading(false);
            }
        }
    };

    const selectQuizForQuestions = (quiz) => {
        setSelectedQuiz(quiz);
        setQuizQuestions(quiz.questions || []);
        setSelectedQuizQuestions([]);
    };

    const toggleQuizQuestion = (qIndex) => {
        if (selectedQuizQuestions.includes(qIndex)) {
            setSelectedQuizQuestions(prev => prev.filter(i => i !== qIndex));
        } else {
            setSelectedQuizQuestions(prev => [...prev, qIndex]);
        }
    };

    const selectRandomQuestions = () => {
        if (!selectedQuiz || quizQuestions.length === 0) return;

        const count = parseInt(prompt(`How many random questions? (Max: ${quizQuestions.length})`));
        if (!count || count <= 0 || count > quizQuestions.length) return;

        const shuffled = [...Array(quizQuestions.length).keys()]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);

        setSelectedQuizQuestions(shuffled);
    };

    const importFromQuizSelector = () => {
        if (!selectedQuiz || selectedQuizQuestions.length === 0) return;

        const newQuestions = selectedQuizQuestions.map(qIndex => {
            const q = quizQuestions[qIndex];
            return {
                text: q.text,
                marks: q.marks || 1,
                isMultiSelect: q.correctIndices?.length > 1,
                options: q.options.map((o, i) => ({
                    text: o.text,
                    isCorrect: q.correctIndices?.includes(i)
                })),
                explanation: q.explanation || '',
                correctIndices: []
            };
        });

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, ...newQuestions]
        }));

        // Reset
        setSelectedQuiz(null);
        setQuizQuestions([]);
        setSelectedQuizQuestions([]);
    };

    const closeQuizSelector = () => {
        setShowQuizSelector(false);
        setSelectedQuiz(null);
        setQuizQuestions([]);
        setSelectedQuizQuestions([]);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation & Formatting
        try {
            const formattedQuestions = quizData.questions.map(q => {
                const correctIndices = q.options
                    .map((opt, i) => opt.isCorrect ? i : -1)
                    .filter(i => i !== -1);

                if (correctIndices.length === 0) throw new Error(`Question "${q.text || 'Untitled'}" has no correct answer.`);

                return {
                    ...q,
                    options: q.options.map(o => ({ text: o.text })), // remove isCorrect from options as backend uses correctIndices
                    correctIndices
                };
            });

            const payload = {
                ...quizData,
                questions: formattedQuestions
            };

            await api.post('/admin/create-quiz', payload);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Quiz</h2>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="btn-secondary">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex gap-2">
                            <Save className="w-4 h-4" />
                            Save Quiz
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                {/* Global Settings */}
                <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-full">
                        <label className="block text-sm font-medium mb-1">Quiz Title</label>
                        <input name="title" value={quizData.title} onChange={handleBasicChange} className="input-field" placeholder="e.g. Week 1 Assessment" required />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" value={quizData.description} onChange={handleBasicChange} className="input-field" rows="2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            name="quizType"
                            value={quizData.quizType}
                            onChange={handleBasicChange}
                            className="input-field bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white [color-scheme:dark]"
                        >
                            <option value="practice" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">Practice</option>
                            <option value="weekly" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">Weekly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                        <input type="number" name="duration" value={quizData.duration} onChange={handleBasicChange} className="input-field" />
                    </div>
                    <div className="col-span-full md:col-span-1">
                        <label className="block text-sm font-medium mb-1">Scheduled Date (Optional)</label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                value={quizData.scheduledAt}
                                onChange={handleBasicChange}
                                className="input-field [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {quizData.questions.map((q, qIdx) => (
                        <div key={qIdx} className="card relative transition-all border border-gray-200 dark:border-neutral-700">
                            <div className="absolute top-4 right-4">
                                <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="font-semibold mb-4">Question {qIdx + 1}</h3>

                            <div className="grid gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Text</label>
                                    <textarea value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} className="input-field" required />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-32">
                                        <label className="block text-sm font-medium mb-1">Marks</label>
                                        <input type="number" value={q.marks} onChange={(e) => updateQuestion(qIdx, 'marks', parseInt(e.target.value))} className="input-field" />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={q.isMultiSelect} onChange={(e) => updateQuestion(qIdx, 'isMultiSelect', e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                                            <span>Multi-select Question</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-4">
                                <label className="block text-sm font-medium">Options</label>
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleCorrectOption(qIdx, oIdx)}
                                            className={`w-6 h-6 flex items-center justify-center rounded-full border ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-neutral-600 text-transparent hover:border-gray-400 dark:hover:border-neutral-500'}`}
                                            title={opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                            className={`flex-1 input-field ${opt.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}
                                            placeholder={`Option ${oIdx + 1}`}
                                        />
                                        <button onClick={() => removeOption(qIdx, oIdx)} className="text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addOption(qIdx)} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-2">
                                    <Plus className="w-4 h-4" /> Add Option
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                                <textarea value={q.explanation} onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)} className="input-field" rows="2" placeholder="Explain why the answer is correct..." />
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={addQuestion} className="py-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl text-gray-500 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex flex-col items-center gap-2">
                            <Plus className="w-6 h-6" />
                            <span className="font-medium">Add New Question</span>
                        </button>
                        <button onClick={openQuestionBank} className="py-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl text-gray-500 dark:text-neutral-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-500 transition-colors flex flex-col items-center gap-2">
                            <Database className="w-6 h-6" />
                            <span className="font-medium">Import from Bank</span>
                        </button>
                        <button onClick={openQuizSelector} className="py-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl text-gray-500 dark:text-neutral-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-500 transition-colors flex flex-col items-center gap-2">
                            <List className="w-6 h-6" />
                            <span className="font-medium">Select from Quizzes</span>
                        </button>
                    </div>
                </div>

                {/* Question Bank Modal */}
                {showQuestionBank && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Database className="text-purple-500" />
                                    Question Bank
                                </h3>
                                <button onClick={() => setShowQuestionBank(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg focus:ring-2 focus:ring-purple-500"
                                        value={bankSearch}
                                        onChange={(e) => setBankSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {bankLoading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    questionBank
                                        .filter(q => q.questionText.toLowerCase().includes(bankSearch.toLowerCase()))
                                        .map((benz) => {
                                            const isSelected = selectedBankQuestions.find(s => s._id === benz._id);
                                            return (
                                                <div
                                                    key={benz._id}
                                                    onClick={() => toggleBankQuestion(benz)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                        : 'border-gray-200 dark:border-neutral-800 hover:border-purple-300'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-1 ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-400'}`}>
                                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{benz.questionText}</p>
                                                            <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                                <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">From: {benz.fromQuiz}</span>
                                                                <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">{benz.marks} Marks</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                                <span className="text-sm text-gray-500">{selectedBankQuestions.length} questions selected</span>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowQuestionBank(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">Cancel</button>
                                    <button
                                        onClick={importQuestions}
                                        disabled={selectedBankQuestions.length === 0}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium disabled:opacity-50"
                                    >
                                        Import Questions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quiz Selector Modal (for Weekly Tests) */}
                {showQuizSelector && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <List className="text-green-500" />
                                    Select Questions from Quizzes
                                </h3>
                                <button onClick={closeQuizSelector} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {quizSelectorLoading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left: Quiz List */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Available Quizzes</h4>
                                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                                {availableQuizzes.map((quiz) => (
                                                    <div
                                                        key={quiz._id}
                                                        onClick={() => selectQuizForQuestions(quiz)}
                                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedQuiz?._id === quiz._id
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                            : 'border-gray-200 dark:border-neutral-800 hover:border-green-300'}`}
                                                    >
                                                        <p className="font-medium text-gray-900 dark:text-white">{quiz.title}</p>
                                                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                            <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">{quiz.chapterName}</span>
                                                            <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">{quiz.questions?.length || 0} Questions</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Questions from Selected Quiz */}
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {selectedQuiz ? `${selectedQuiz.title} - Questions` : 'Select a Quiz'}
                                                </h4>
                                                {selectedQuiz && quizQuestions.length > 0 && (
                                                    <button
                                                        onClick={selectRandomQuestions}
                                                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                                                    >
                                                        <Shuffle className="w-3 h-3" />
                                                        Random
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                                {selectedQuiz ? (
                                                    quizQuestions.length > 0 ? (
                                                        quizQuestions.map((q, qIndex) => {
                                                            const isSelected = selectedQuizQuestions.includes(qIndex);
                                                            return (
                                                                <div
                                                                    key={qIndex}
                                                                    onClick={() => toggleQuizQuestion(qIndex)}
                                                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                                        : 'border-gray-200 dark:border-neutral-800 hover:border-green-300'}`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-1 ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{q.text}</p>
                                                                            <span className="text-xs text-gray-500 mt-1 inline-block">{q.marks} Mark(s)</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-8">No questions in this quiz</p>
                                                    )
                                                ) : (
                                                    <p className="text-gray-500 text-center py-8">Select a quiz to view questions</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                                <span className="text-sm text-gray-500">{selectedQuizQuestions.length} questions selected</span>
                                <div className="flex gap-3">
                                    <button onClick={closeQuizSelector} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">Cancel</button>
                                    <button
                                        onClick={importFromQuizSelector}
                                        disabled={selectedQuizQuestions.length === 0}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
                                    >
                                        Import {selectedQuizQuestions.length} Question{selectedQuizQuestions.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizBuilder;
