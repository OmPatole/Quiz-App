import { useState, useEffect } from 'react';
import { Folder, FileText, Download, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const StudentLibrary = () => {
    const [folders, setFolders] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const filteredMaterials = currentFolder
        ? materials.filter(m => m.folderName === currentFolder)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                {currentFolder && (
                    <button onClick={() => setCurrentFolder(null)} className="hover:bg-neutral-800 p-1 rounded transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="text-xl font-bold text-white">
                    {currentFolder ? currentFolder : 'Study Library'}
                </h2>
            </div>

            {currentFolder ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMaterials.length === 0 ? (
                        <p className="col-span-full text-center text-neutral-500 py-8">No files in this folder.</p>
                    ) : (
                        filteredMaterials.map(m => (
                            <div key={m._id} className="card hover:shadow-emerald-900/10 hover:border-emerald-500/30 transition-all flex items-center justify-between p-4 bg-neutral-900 border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-neutral-950 text-emerald-500 rounded-lg border border-neutral-800">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{m.title}</h4>
                                        <p className="text-sm text-neutral-500">Uploaded {new Date(m.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <a
                                    href={`http://localhost:5000${m.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {folders.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-neutral-500">
                            No study materials available yet.
                        </div>
                    )}
                    {folders.map(folder => (
                        <div
                            key={folder}
                            onClick={() => setCurrentFolder(folder)}
                            className="card hover:border-emerald-500 cursor-pointer transition-all hover:shadow-emerald-900/10 flex flex-col items-center gap-3 p-6 bg-neutral-900 border-neutral-800"
                        >
                            <Folder className="w-12 h-12 text-emerald-600" />
                            <span className="font-medium text-lg text-white">{folder}</span>
                            <span className="text-sm text-neutral-500">
                                {materials.filter(m => m.folderName === folder).length} files
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentLibrary;
