import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, Clock, Calendar, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/axios';

const QuizBuilder = ({ onCancel, onSuccess }) => {
    const [chapters, setChapters] = useState([]);
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

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const response = await api.get('/admin/chapters');
            setChapters(response.data);
        } catch (err) {
            console.error(err);
        }
    };

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
        <div className="space-y-6">
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
            <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Quiz Title</label>
                    <input name="title" value={quizData.title} onChange={handleBasicChange} className="input-field" placeholder="e.g. Week 1 Assessment" required />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={quizData.description} onChange={handleBasicChange} className="input-field" rows="2" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Chapter</label>
                    <select name="chapter" value={quizData.chapter} onChange={handleBasicChange} className="input-field">
                        <option value="">-- No Chapter --</option>
                        {chapters.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select name="quizType" value={quizData.quizType} onChange={handleBasicChange} className="input-field">
                        <option value="practice">Practice</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                    <input type="number" name="duration" value={quizData.duration} onChange={handleBasicChange} className="input-field" />
                </div>
                <div>
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

                <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl text-gray-500 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6" />
                    <span className="font-medium">Add New Question</span>
                </button>
            </div>
        </div>
    );
};

export default QuizBuilder;
