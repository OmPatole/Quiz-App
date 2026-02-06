import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Trash2, BookOpen, CheckCircle, AlertCircle, FilePlus } from 'lucide-react';
import api from '../../api/axios';
import QuizBuilder from './QuizBuilder';

const QuizManager = () => {
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newChapterName, setNewChapterName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const response = await api.get('/admin/chapters');
            setChapters(response.data);
        } catch (error) {
            console.error('Error fetching chapters:', error);
        }
    };

    const handleCreateChapter = async (e) => {
        e.preventDefault();
        if (!newChapterName.trim()) return;

        setLoading(true);
        try {
            await api.post('/admin/create-chapter', { title: newChapterName });
            setNewChapterName('');
            fetchChapters();
            setResult({ success: true, message: 'Chapter created successfully' });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to create chapter',
            });
        } finally {
            setLoading(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file || !selectedChapter) {
            setResult({
                success: false,
                message: 'Please select a chapter first',
            });
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chapterId', selectedChapter);

            const response = await api.post('/admin/upload-quiz-json', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult({
                success: true,
                message: `Successfully uploaded ${response.data.count} quiz(zes)`,
            });
            fetchChapters();
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Upload failed',
            });
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
        },
        maxFiles: 1,
    });

    const handleDeleteQuiz = async (quizId) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;

        try {
            await api.delete(`/admin/quiz/${quizId}`);
            fetchChapters();
            setResult({ success: true, message: 'Quiz deleted successfully' });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to delete quiz',
            });
        }
    };

    if (showBuilder) {
        return (
            <QuizBuilder
                onCancel={() => setShowBuilder(false)}
                onSuccess={() => {
                    setShowBuilder(false);
                    fetchChapters();
                    setResult({ success: true, message: 'Quiz created successfully' });
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowBuilder(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FilePlus className="w-4 h-4" />
                    Create Manual Quiz
                </button>
            </div>

            {/* Create Chapter */}
            <div className="card">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Create New Chapter
                </h2>
                <form onSubmit={handleCreateChapter} className="flex gap-3">
                    <input
                        type="text"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        placeholder="Enter chapter name (e.g., Chain Rule)"
                        className="input-field flex-1"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </form>
            </div>

            {/* Upload Quiz JSON */}
            <div className="card">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Upload Quiz JSON
                </h2>

                {/* Chapter Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Chapter
                    </label>
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="input-field"
                    >
                        <option value="">-- Select a chapter --</option>
                        {chapters.map((chapter) => (
                            <option key={chapter._id} value={chapter._id}>
                                {chapter.title} ({chapter.quizzes?.length || 0} quizzes)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : selectedChapter
                            ? 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed'
                        }`}
                >
                    <input {...getInputProps()} disabled={!selectedChapter} />
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-600 dark:text-slate-400">Processing JSON...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">
                                        {selectedChapter
                                            ? isDragActive
                                                ? 'Drop the JSON file here'
                                                : 'Drag & drop quiz JSON file'
                                            : 'Select a chapter first'}
                                    </p>
                                    {selectedChapter && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            or click to browse
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* JSON Format Info */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Expected JSON format:</strong> Array of quiz objects with fields: title, description, quizType (practice/weekly), duration, questions (with text, marks, options, correctIndices, explanation)
                    </p>
                </div>
            </div>

            {/* Result Message */}
            {result && (
                <div
                    className={`card ${result.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {result.success ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        )}
                        <p
                            className={`font-medium ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}
                        >
                            {result.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Existing Chapters and Quizzes */}
            <div className="card">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Existing Chapters & Quizzes
                </h2>
                {chapters.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No chapters created yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter) => (
                            <div key={chapter._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <BookOpen className="w-5 h-5 text-primary-600" />
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        {chapter.title}
                                    </h3>
                                    <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                                        {chapter.quizzes?.length || 0} quiz(zes)
                                    </span>
                                </div>
                                {chapter.quizzes?.length > 0 && (
                                    <div className="space-y-2 ml-8">
                                        {chapter.quizzes.map((quiz) => (
                                            <div
                                                key={quiz._id}
                                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">
                                                        {quiz.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {quiz.quizType} • {quiz.duration} min • {quiz.questions?.length || 0} questions
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizManager;
