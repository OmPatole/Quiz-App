import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Trash2, BookOpen, CheckCircle2, AlertCircle, FilePlus, ChevronDown, ChevronRight, Filter } from 'lucide-react';
import api from '../../api/axios';
import QuizBuilder from './QuizBuilder';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';

const QuizManager = () => {
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newChapterName, setNewChapterName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState({});
    const [quizFilter, setQuizFilter] = useState('all'); // 'all', 'practice', 'weekly'

    // Toast
    const toast = useToast();

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'chapter' or 'quiz'
        itemId: null,
        itemTitle: '',
    });

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const response = await api.get('/admin/chapters');
            setChapters(response.data);

            // By default, expand all chapters (or you can set them to true)
            const initialExpanded = {};
            response.data.forEach(ch => {
                initialExpanded[ch._id] = true;
            });
            setExpandedChapters(initialExpanded);
        } catch (error) {
            console.error('Error fetching chapters:', error);
            toast.error('Failed to load chapters');
        }
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const handleCreateChapter = async (e) => {
        e.preventDefault();
        if (!newChapterName.trim()) return;

        setLoading(true);
        try {
            await api.post('/admin/create-chapter', { title: newChapterName });
            setNewChapterName('');
            fetchChapters();
            toast.success('Chapter created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create chapter');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file || !selectedChapter) {
            toast.error('Please select a chapter and a file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chapterId', selectedChapter);

            const response = await api.post('/admin/upload-quiz-json', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(`Successfully uploaded ${response.data.count} quiz(zes)`);
            fetchChapters();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
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

    // Delete Handlers
    const confirmDelete = (type, id, title) => {
        setModalConfig({
            isOpen: true,
            type,
            itemId: id,
            itemTitle: title,
        });
    };

    const handleConfirmDelete = async () => {
        const { type, itemId } = modalConfig;
        if (!itemId) return;

        try {
            if (type === 'chapter') {
                await api.delete(`/admin/chapters/${itemId}`);
                toast.success('Chapter deleted successfully');
                if (selectedChapter === itemId) setSelectedChapter('');
            } else if (type === 'quiz') {
                await api.delete(`/admin/quiz/${itemId}`);
                toast.success('Quiz deleted successfully');
            }
            fetchChapters();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to delete ${type}`);
        } finally {
            setModalConfig({ isOpen: false, type: null, itemId: null, itemTitle: '' });
        }
    };

    if (showBuilder) {
        return (
            <QuizBuilder
                onCancel={() => setShowBuilder(false)}
                onSuccess={() => {
                    setShowBuilder(false);
                    fetchChapters();
                    toast.success('Quiz created successfully');
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowBuilder(true)}
                    className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20"
                >
                    <FilePlus className="w-4 h-4" />
                    Create Manual Quiz
                </button>
            </div>

            {/* Create Chapter */}
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Create New Chapter
                </h2>
                <form onSubmit={handleCreateChapter} className="flex gap-3">
                    <input
                        type="text"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        placeholder="Enter chapter name (e.g., Chain Rule)"
                        className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder-gray-400 dark:placeholder-neutral-600"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/10"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </form>
            </div>

            {/* Upload Quiz JSON */}
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Upload Quiz JSON
                </h2>

                {/* Chapter Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-2">
                        Select Chapter
                    </label>
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors [color-scheme:dark]"
                    >
                        <option value="" className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">-- Select a chapter --</option>
                        {chapters.map((chapter) => (
                            <option key={chapter._id} value={chapter._id} className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
                                {chapter.title} ({chapter.quizzes?.length || 0} quizzes)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : selectedChapter
                            ? 'border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                            : 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/50 cursor-not-allowed opacity-60'
                        }`}
                >
                    <input {...getInputProps()} disabled={!selectedChapter} />
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 dark:text-neutral-400">Processing JSON...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedChapter
                                            ? isDragActive
                                                ? 'Drop the JSON file here'
                                                : 'Drag & drop quiz JSON file'
                                            : 'Select a chapter first'}
                                    </p>
                                    {selectedChapter && (
                                        <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                                            or click to browse
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* JSON Format Info */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800">
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                        <strong>Expected JSON format:</strong> Array of quiz objects with fields: title, description, quizType (practice/weekly), duration, questions (with text, marks, options, correctIndices, explanation)
                    </p>
                </div>
            </div>

            {/* Existing Chapters and Quizzes */}
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Existing Chapters & Quizzes
                    </h2>

                    {/* Quiz Type Toggle */}
                    <div className="flex items-center gap-2 bg-gray-200 dark:bg-neutral-800 p-1 rounded-lg">
                        <button
                            onClick={() => setQuizFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${quizFilter === 'all' ? 'bg-white dark:bg-neutral-600 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setQuizFilter('practice')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${quizFilter === 'practice' ? 'bg-white dark:bg-neutral-600 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
                        >
                            Practice
                        </button>
                        <button
                            onClick={() => setQuizFilter('weekly')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${quizFilter === 'weekly' ? 'bg-white dark:bg-neutral-600 text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
                        >
                            Weekly
                        </button>
                    </div>
                </div>
                {chapters.length === 0 ? (
                    <p className="text-gray-500 dark:text-neutral-500 text-center py-8">
                        No chapters created yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter) => {
                            const filteredQuizzes = (chapter.quizzes || []).filter(q => q && (quizFilter === 'all' || q.quizType === quizFilter));
                            const isExpanded = expandedChapters[chapter._id];

                            // Hide chapters with no matching quizzes when a specific filter is active
                            if (quizFilter !== 'all' && filteredQuizzes.length === 0) return null;

                            return (
                                <div key={chapter._id} className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-950/30">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900/50 transition-colors"
                                        onClick={() => toggleChapter(chapter._id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                                            )}
                                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white select-none">
                                                {chapter.title}
                                            </h3>
                                            <span className="text-sm text-gray-500 dark:text-neutral-500 px-2 py-0.5 bg-gray-200 dark:bg-neutral-900 rounded-full border border-gray-300 dark:border-neutral-800 select-none">
                                                {filteredQuizzes.length} {quizFilter !== 'all' ? quizFilter : ''} quizzes
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete('chapter', chapter._id, chapter.title);
                                            }}
                                            className="p-2 text-gray-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                                            title="Delete Chapter"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4 pt-0 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/10">
                                            {filteredQuizzes.length > 0 ? (
                                                <div className="space-y-2 mt-4 ml-8 border-l-2 border-gray-200 dark:border-neutral-800 pl-4">
                                                    {filteredQuizzes.map((quiz) => (
                                                        <div
                                                            key={quiz._id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-neutral-700"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-neutral-200 flex items-center gap-2">
                                                                    {quiz.title}
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${quiz.quizType === 'weekly' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500'}`}>
                                                                        {quiz.quizType}
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                                                                    {quiz.duration} min • {quiz.questions?.length || 0} questions
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => confirmDelete('quiz', quiz._id, quiz.title)}
                                                                className="p-2 text-gray-400 dark:text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-950 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-neutral-500 mt-4 ml-8">
                                                    No {quizFilter !== 'all' ? quizFilter : ''} quizzes found in this chapter.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {quizFilter !== 'all' && chapters.every(ch => (ch.quizzes || []).filter(q => q && q.quizType === quizFilter).length === 0) && (
                            <p className="text-gray-500 dark:text-neutral-500 text-center py-8">
                                No {quizFilter} quizzes found. Create one using the &ldquo;Create Manual Quiz&rdquo; button above.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title={`Delete ${modalConfig.type === 'chapter' ? 'Chapter' : 'Quiz'}`}
                description={`Are you sure you want to delete "${modalConfig.itemTitle}"? ${modalConfig.type === 'chapter'
                    ? 'This will also delete ALL quizzes within this chapter.' // Assuming cascade delete or just warning
                    : 'This action cannot be undone.'
                    }`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};

export default QuizManager;
