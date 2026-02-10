import { useState, useEffect } from 'react';
import { Folder, FileText, Download, ArrowLeft, ExternalLink, Link as LinkIcon } from 'lucide-react';
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
            <div className="flex items-center gap-2 mb-6">
                {currentFolder && (
                    <button onClick={() => setCurrentFolder(null)} className="hover:bg-neutral-800 p-2 rounded-lg transition-colors text-neutral-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="text-2xl font-bold text-white">
                    {currentFolder ? currentFolder : 'Study Library'}
                </h2>
            </div>

            {currentFolder ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMaterials.length === 0 ? (
                        <p className="col-span-full text-center text-neutral-500 py-12">No materials in this folder.</p>
                    ) : (
                        filteredMaterials.map(m => (
                            <div key={m._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between hover:border-blue-900/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${m.type === 'link' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-500'}`}>
                                        {m.type === 'link' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white group-hover:text-blue-500 transition-colors">{m.title}</h4>
                                        <p className="text-sm text-neutral-500">
                                            {m.type === 'link' ? 'External Link' : `Uploaded ${new Date(m.uploadedAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={m.type === 'link' ? m.linkUrl : `http://localhost:5000${m.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-neutral-800 hover:bg-blue-600 hover:text-white text-white rounded-lg transition-all"
                                    title={m.type === 'link' ? "Open Link" : "Download PDF"}
                                >
                                    {m.type === 'link' ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                </a>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {folders.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-neutral-500">
                            No study materials available yet.
                        </div>
                    )}
                    {folders.map(folder => (
                        <button
                            key={folder}
                            onClick={() => setCurrentFolder(folder)}
                            className="bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 cursor-pointer transition-all rounded-xl flex flex-col items-center gap-4 p-8 group"
                        >
                            <Folder className="w-16 h-16 text-blue-600 group-hover:text-blue-500 transition-colors" />
                            <div className="text-center">
                                <span className="block font-bold text-lg text-white mb-1">{folder}</span>
                                <span className="text-sm text-neutral-500">
                                    {materials.filter(m => m.folderName === folder).length} files
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentLibrary;
