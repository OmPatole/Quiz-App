import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, ArrowLeft, Plus, Upload, Trash2, Home, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- MODAL STATE ---
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchMaterials();
    const token = localStorage.getItem('token');
    if (token) setIsAdmin(true);
  }, []);

  const fetchMaterials = async () => {
    try {
        const res = await axios.get('http://localhost:3001/api/materials');
        setMaterials(res.data);
    } catch(e) { console.error("Error loading materials"); }
  };

  // --- REPLACED PROMPT WITH MODAL LOGIC ---
  const openFolderModal = () => {
    if (!isAdmin) return;
    setNewFolderName('');
    setShowFolderModal(true);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault(); // Prevent form reload
    if (!newFolderName.trim()) return;

    try {
      await axios.post('http://localhost:3001/api/materials', 
        { title: newFolderName, type: 'folder', parentId: currentFolder },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchMaterials();
      toast.success("Folder created");
      setShowFolderModal(false);
    } catch (e) { toast.error("Failed. Login required."); }
  };

  const handleUploadFile = async (e) => {
    if (!isAdmin) return;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const uploadRes = await axios.post('http://localhost:3001/api/upload', formData);
      const fileUrl = uploadRes.data.imageUrl;

      await axios.post('http://localhost:3001/api/materials', 
        { title: file.name, type: 'file', parentId: currentFolder, fileUrl },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      fetchMaterials();
      toast.success("File uploaded");
    } catch (e) { toast.error("Upload failed"); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/materials/${id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMaterials();
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  const currentItems = materials.filter(m => m.parentId === currentFolder);

  const getBreadcrumbs = () => {
    let path = [];
    let curr = currentFolder;
    while(curr) {
      const folder = materials.find(m => m.id === curr);
      if(folder) {
        path.unshift(folder);
        curr = folder.parentId;
      } else break;
    }
    return path;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }}/>
      
      {/* --- FOLDER CREATION MODAL --- */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Folder className="text-purple-500" size={20}/> New Folder
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="text-slate-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Folder Name</label>
                <input 
                  autoFocus
                  className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-purple-500 outline-none transition"
                  placeholder="e.g. Data Structures"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-slate-300 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition shadow-lg shadow-purple-900/20">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800"><Home size={20}/></Link>
            <h1 className="text-2xl font-bold">📚 Study Repository</h1>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <div className="px-3 py-2 bg-slate-900 rounded text-xs text-emerald-400 font-bold flex items-center gap-2 border border-slate-800">
                <ShieldCheck size={14} /> Admin Mode
              </div>
              
              {/* UPDATED BUTTON: Calls openFolderModal instead of handleCreateFolder directly */}
              <button onClick={openFolderModal} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-sm font-bold transition">
                <Plus size={16}/> New Folder
              </button>
              
              <label className={`flex items-center gap-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 text-sm font-bold cursor-pointer transition ${uploading ? 'opacity-50' : ''}`}>
                <Upload size={16}/> {uploading ? "Uploading..." : "Upload File"}
                <input type="file" hidden onChange={handleUploadFile} disabled={uploading}/>
              </label>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 overflow-x-auto pb-2">
          <span className="cursor-pointer hover:text-white shrink-0" onClick={() => setCurrentFolder(null)}>Root</span>
          {getBreadcrumbs().map(folder => (
            <React.Fragment key={folder.id}>
              <span>/</span>
              <span className="cursor-pointer hover:text-white shrink-0" onClick={() => setCurrentFolder(folder.id)}>{folder.title}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {currentFolder && (
            <div onClick={() => {
               const curr = materials.find(m => m.id === currentFolder);
               setCurrentFolder(curr ? curr.parentId : null);
            }} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 transition">
              <ArrowLeft size={32} />
              <span className="text-xs font-bold">Back</span>
            </div>
          )}

          {currentItems.length === 0 && !currentFolder && (
            <div className="col-span-full text-center py-20 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                Repository is empty. {isAdmin ? "Start by creating a folder." : "Check back later."}
            </div>
          )}

          {currentItems.map(item => (
            <div key={item.id} className="group relative p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:shadow-lg transition flex flex-col items-center gap-3 text-center">
              {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded-full text-slate-500 hover:text-red-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition z-10"
                    title="Delete Item"
                >
                  <Trash2 size={14}/>
                </button>
              )}

              <div onClick={() => item.type === 'folder' ? setCurrentFolder(item.id) : window.open(`http://localhost:3001${item.fileUrl}`, '_blank')} 
                   className="cursor-pointer w-full flex flex-col items-center gap-2">
                {item.type === 'folder' ? (
                  <Folder size={48} className="text-yellow-500 fill-yellow-500/20" />
                ) : (
                  <FileText size={48} className="text-red-400" />
                )}
                <span className="text-sm font-medium truncate w-full px-2" title={item.title}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;