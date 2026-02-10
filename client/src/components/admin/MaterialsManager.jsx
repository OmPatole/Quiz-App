import { useState, useEffect } from 'react';
import { Folder, FileText, Upload, Plus, ArrowLeft, Download, Trash2, ExternalLink, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';
import InputModal from '../common/InputModal';

const MaterialsManager = () => {
    const [folders, setFolders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const toast = useToast();

    // Upload State
    const [uploadTitle, setUploadTitle] = useState('');
    const [materialType, setMaterialType] = useState('pdf'); // 'pdf' or 'link'
    const [uploadFile, setUploadFile] = useState(null);
    const [externalLink, setExternalLink] = useState('');

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState(null);

    // Folder Modal State
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [foldersRes, materialsRes] = await Promise.all([
                api.get('/material/folders'),
                api.get('/material')
            ]);
            setFolders(foldersRes.data);
            setMaterials(materialsRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = (folderName) => {
        if (folderName && !folders.includes(folderName)) {
            setCurrentFolder(folderName);
        } else if (folders.includes(folderName)) {
            setCurrentFolder(folderName);
            toast.success(`Opened existing folder: ${folderName}`);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!uploadTitle || !currentFolder) return;
        if (materialType === 'pdf' && !uploadFile) return;
        if (materialType === 'link' && !externalLink) return;

        setUploading(true);
        try {
            if (materialType === 'pdf') {
                const formData = new FormData();
                formData.append('file', uploadFile);
                formData.append('title', uploadTitle);
                formData.append('folderName', currentFolder);
                formData.append('type', 'pdf');

                await api.post('/material/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/material/link', {
                    title: uploadTitle,
                    folderName: currentFolder,
                    url: externalLink,
                    type: 'link'
                });
            }

            setUploadTitle('');
            setUploadFile(null);
            setExternalLink('');
            toast.success("Material added successfully");
            fetchData();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const confirmDelete = (material) => {
        setMaterialToDelete(material);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!materialToDelete) return;

        try {
            await api.delete(`/admin/materials/${materialToDelete._id}`);
            toast.success("Material Deleted");
            fetchData();
        } catch (error) {
            console.error('Failed to delete material:', error);
            toast.error('Failed to delete material');
        } finally {
            setDeleteModalOpen(false);
            setMaterialToDelete(null);
        }
    };

    const filteredMaterials = currentFolder
        ? materials.filter(m => m.folderName === currentFolder)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentFolder ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentFolder(null)} className="hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <span>{currentFolder}</span>
                        </div>
                    ) : 'Study Materials'}
                </h2>
                {!currentFolder && (
                    <button onClick={() => setIsFolderModalOpen(true)} className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> New Folder
                    </button>
                )}
            </div>

            {currentFolder ? (
                <div className="space-y-6">
                    {/* Add Material Form */}
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Add Material to "{currentFolder}"</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg w-max inline-flex mb-2">
                                <button
                                    type="button"
                                    onClick={() => setMaterialType('pdf')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${materialType === 'pdf'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        PDF Upload
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMaterialType('link')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${materialType === 'link'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" />
                                        External Link
                                    </span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-neutral-400">Title</label>
                                    <input
                                        type="text"
                                        value={uploadTitle || ''}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Chapter 1 Notes"
                                        required
                                    />
                                </div>

                                <div>
                                    {materialType === 'pdf' ? (
                                        <>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-neutral-400">PDF File</label>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={e => setUploadFile(e.target.files[0])}
                                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                                required
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-neutral-400">External URL</label>
                                            <input
                                                type="url"
                                                value={externalLink || ''}
                                                onChange={e => setExternalLink(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="https://example.com/resource"
                                                required
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
                                    {uploading ? 'Processing...' : (
                                        <>
                                            {materialType === 'pdf' ? <Upload className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                            {materialType === 'pdf' ? 'Upload PDF' : 'Add Link'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Files List */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredMaterials.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-neutral-500 py-8">No materials in this folder.</p>
                        ) : (
                            filteredMaterials.map(m => (
                                <div key={m._id} className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-900/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${m.type === 'link' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}`}>
                                            {m.type === 'link' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-neutral-500">
                                                {m.type === 'link' ? 'External Link' : `Uploaded ${new Date(m.uploadedAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {m.type === 'link' ? (
                                            <a
                                                href={m.linkUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Open Link
                                            </a>
                                        ) : (
                                            <a
                                                href={`http://localhost:5000${m.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Download className="w-4 h-4" /> Download
                                            </a>
                                        )}

                                        <button
                                            onClick={() => confirmDelete(m)}
                                            className="p-2 text-red-500/60 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                            title="Delete Material"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {folders.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-neutral-500">
                            No folders yet. Create one to get started.
                        </div>
                    )}
                    {folders.map(folder => (
                        <button
                            key={folder}
                            onClick={() => setCurrentFolder(folder)}
                            className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10 cursor-pointer transition-all rounded-xl flex flex-col items-center gap-4 p-8 group"
                        >
                            <Folder className="w-16 h-16 text-blue-600 dark:text-blue-600 group-hover:text-blue-500 transition-colors" />
                            <div className="text-center">
                                <span className="block font-bold text-lg text-gray-900 dark:text-white mb-1">{folder}</span>
                                <span className="text-sm text-gray-500 dark:text-neutral-500">
                                    {materials.filter(m => m.folderName === folder).length} files
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Material?"
                description="This cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <InputModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onSubmit={handleCreateFolder}
                title="Create New Folder"
                placeholder="Enter folder name..."
                confirmText="Create Folder"
            />
        </div>
    );
};

export default MaterialsManager;
