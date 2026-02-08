import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Trash2, BookOpen, CheckCircle, AlertCircle, FilePlus } from 'lucide-react';
import api from '../../api/axios';
import headers from '../../api/axios'; // Wait, standard import is just api
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

    // Toast
    const { toast } = useToast();

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
        } catch (error) {
            console.error('Error fetching chapters:', error);
            toast.error('Failed to load chapters');
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
                    className="btn-primary flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold"
                >
                    <FilePlus className="w-4 h-4" />
                    Create Manual Quiz
                </button>
            </div>

            {/* Create Chapter */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Create New Chapter
                </h2>
                <form onSubmit={handleCreateChapter} className="flex gap-3">
                    <input
                        type="text"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        placeholder="Enter chapter name (e.g., Chain Rule)"
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </form>
            </div>

            {/* Upload Quiz JSON */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Upload Quiz JSON
                </h2>

                {/* Chapter Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Select Chapter
                    </label>
                    <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
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
                        ? 'border-yellow-500 bg-yellow-900/20'
                        : selectedChapter
                            ? 'border-neutral-700 hover:border-yellow-500/50'
                            : 'border-neutral-800 bg-neutral-950/50 cursor-not-allowed'
                        }`}
                >
                    <input {...getInputProps()} disabled={!selectedChapter} />
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-neutral-400">Processing JSON...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {selectedChapter
                                            ? isDragActive
                                                ? 'Drop the JSON file here'
                                                : 'Drag & drop quiz JSON file'
                                            : 'Select a chapter first'}
                                    </p>
                                    {selectedChapter && (
                                        <p className="text-sm text-neutral-500 mt-1">
                                            or click to browse
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* JSON Format Info */}
                <div className="mt-4 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                    <p className="text-xs text-neutral-400">
                        <strong>Expected JSON format:</strong> Array of quiz objects with fields: title, description, quizType (practice/weekly), duration, questions (with text, marks, options, correctIndices, explanation)
                    </p>
                </div>
            </div>

            {/* Existing Chapters and Quizzes */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Existing Chapters & Quizzes
                </h2>
                {chapters.length === 0 ? (
                    <p className="text-neutral-500 text-center py-8">
                        No chapters created yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter) => (
                            <div key={chapter._id} className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-yellow-500" />
                                        <h3 className="text-lg font-semibold text-white">
                                            {chapter.title}
                                        </h3>
                                        <span className="text-sm text-neutral-500 px-2 py-0.5 bg-neutral-900 rounded-full border border-neutral-800">
                                            {chapter.quizzes?.length || 0} quizzes
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => confirmDelete('chapter', chapter._id, chapter.title)}
                                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-900 rounded-lg transition-colors"
                                        title="Delete Chapter"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                {chapter.quizzes?.length > 0 && (
                                    <div className="space-y-2 ml-8 border-l-2 border-neutral-800 pl-4">
                                        {chapter.quizzes.map((quiz) => (
                                            <div
                                                key={quiz._id}
                                                className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700"
                                            >
                                                <div>
                                                    <p className="font-medium text-neutral-200">
                                                        {quiz.title}
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        {quiz.quizType} • {quiz.duration} min • {quiz.questions?.length || 0} questions
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => confirmDelete('quiz', quiz._id, quiz.title)}
                                                    className="p-2 text-neutral-600 hover:text-red-500 hover:bg-neutral-950 rounded-lg transition-colors"
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
