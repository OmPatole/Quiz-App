import { useState, useEffect } from 'react';
import { Folder, FileText, Upload, Plus, ArrowLeft, Download, Trash2, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

const MaterialsManager = () => {
    const [folders, setFolders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload State
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadFile, setUploadFile] = useState(null);

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = () => {
        const name = prompt('Enter folder name:');
        if (name && !folders.includes(name)) {
            setCurrentFolder(name);
            // We don't save it to backend yet until a file is uploaded
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle || !currentFolder) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadTitle);
            formData.append('folderName', currentFolder);

            await api.post('/material/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadTitle('');
            setUploadFile(null);
            fetchData();
        } catch (error) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };


    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            await api.delete(`/material/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete material:', error);
            alert('Failed to delete material');
        }
    };

    const filteredMaterials = currentFolder
        ? materials.filter(m => m.folderName === currentFolder)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {currentFolder ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentFolder(null)} className="hover:bg-slate-100 p-1 rounded">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <span>{currentFolder}</span>
                        </div>
                    ) : 'Study Materials'}
                </h2>
                {!currentFolder && (
                    <button onClick={handleCreateFolder} className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Folder
                    </button>
                )}
            </div>

            {currentFolder ? (
                <div className="space-y-6">
                    {/* Upload Form */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Upload PDF to "{currentFolder}"</h3>
                        <form onSubmit={handleUpload} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={e => setUploadTitle(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g. Chapter 1 Notes"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">PDF File</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={e => setUploadFile(e.target.files[0])}
                                    className="input-field p-1"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                                {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload</>}
                            </button>
                        </form>
                    </div>

                    {/* Files List */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredMaterials.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No files in this folder.</p>
                        ) : (
                            filteredMaterials.map(m => (
                                <div key={m._id} className="card flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 dark:text-white">{m.title}</h4>
                                            <p className="text-sm text-slate-500">Uploaded {new Date(m.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={`http://localhost:5000${m.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </a>
                                        <button
                                            onClick={() => handleDelete(m._id)}
                                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
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
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No folders yet. Create one to get started.
                        </div>
                    )}
                    {folders.map(folder => (
                        <div
                            key={folder}
                            onClick={() => setCurrentFolder(folder)}
                            className="card hover:border-primary-500 cursor-pointer transition-all hover:shadow-md flex flex-col items-center gap-3 p-6"
                        >
                            <Folder className="w-12 h-12 text-primary-500" />
                            <span className="font-medium text-lg">{folder}</span>
                            <span className="text-sm text-slate-500">
                                {materials.filter(m => m.folderName === folder).length} files
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MaterialsManager;
