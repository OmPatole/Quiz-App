import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Trash2, Plus, LogOut, FileText, Calendar, 
  Code, CheckSquare, Edit, ArrowLeft, Image as ImageIcon, X, Users, User, Eye, EyeOff, FileUp, Clock, Layers
} from 'lucide-react';

const API_URL = 'http://localhost:3001'; 

const AdminPanel = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [previewMode, setPreviewMode] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  
  // Editor State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [questions, setQuestions] = useState([]);
  const [targetYears, setTargetYears] = useState(['FY', 'SY', 'TY', 'BE']);
  const [category, setCategory] = useState('aptitude'); 
  const [quizType, setQuizType] = useState('weekly');   
  const [duration, setDuration] = useState(60);         

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (!isAdmin) {
      if(setIsAuth) setIsAuth(false);
      navigate('/login', { replace: true });
    }
  }, [navigate, setIsAuth]);

  const fetchQuizzes = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/admin/my-quizzes`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        setQuizzes(res.data);
    } catch (e) { 
        if(e.response && e.response.status === 401) handleLogout();
    }
  };
  useEffect(() => { fetchQuizzes(); }, [view]);

  const handleLogout = () => {
    localStorage.clear(); 
    sessionStorage.clear();
    if(setIsAuth) setIsAuth(false);
    navigate('/login', { replace: true });
  };

  const handleDeleteQuiz = async (id) => { 
      if(window.confirm("Delete this quiz?")) { 
          await axios.delete(`${API_URL}/api/quizzes/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }); 
          toast.success("Deleted");
          fetchQuizzes(); 
      }
  };
  
  const handleEditQuiz = async (id) => {
      try {
        // USE SECURE ADMIN ENDPOINT
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/admin/quiz-details/${id}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        setEditingId(res.data.id); 
        // ... (Rest of state setting remains same)
        setView('editor');
      } catch(e) { toast.error("Error loading quiz"); }
  };

  const handleCreateNew = () => {
      setEditingId(null); setTitle(''); setSchedule({ start: '', end: '' });
      setTargetYears(['FY', 'SY', 'TY', 'BE']);
      setCategory('aptitude'); setQuizType('weekly'); setDuration(60);
      setQuestions([{ id: Date.now(), type: 'mcq', text: '**New Question**', marks: 5, options: [{text:'', image: ''}, {text:'', image: ''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}] }]);
      setPreviewMode(false);
      setView('editor');
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const load = toast.loading("Parsing...");
    try {
        const res = await axios.post(`${API_URL}/api/generate-quiz`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.success) {
            setQuestions([...questions, ...res.data.questions]);
            toast.success(`Added ${res.data.questions.length} questions`);
        }
    } catch (err) { toast.error("PDF Parse Failed"); } 
    finally { toast.dismiss(load); }
  };

  const updateQ = (i, f, v) => { const n=[...questions]; n[i][f]=v; setQuestions(n); };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  // --- IMAGE HELPERS ---
  const OptionImageUploader = ({ onUpload }) => {
    const onDrop = useCallback(files => {
      const formData = new FormData(); formData.append('file', files[0]);
      const load = toast.loading("Uploading...");
      axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
        .then(res => { toast.dismiss(load); onUpload(res.data.imageUrl); })
        .catch(() => { toast.dismiss(load); toast.error("Failed"); });
    }, [onUpload]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
    return <div {...getRootProps()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer border border-slate-700 text-slate-400 hover:text-white"><input {...getInputProps()} /> <ImageIcon size={16} /></div>;
  };

  const MarkdownImageInserter = ({ onInsert }) => {
    const onDrop = useCallback(files => {
      const formData = new FormData(); formData.append('file', files[0]);
      const load = toast.loading("Uploading...");
      axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
        .then(res => { toast.dismiss(load); onInsert(`\n![img](${API_URL}${res.data.imageUrl})\n`); })
        .catch(() => { toast.dismiss(load); toast.error("Failed"); });
    }, [onInsert]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
    return <div {...getRootProps()} className="inline-flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700"><input {...getInputProps()} /> <ImageIcon size={14} /> Insert Image</div>;
  };

  const toggleYear = (year) => setTargetYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);

  const handleSave = async () => {
    if(!title.trim()) return toast.error("Title required");
    if(questions.length === 0) return toast.error("Add questions");
    
    if (quizType !== 'mock') {
        if(!schedule.start || !schedule.end) return toast.error("Schedule required for Weekly tests");
    }

    const quizId = editingId || `${title.trim().replace(/\s+/g, '-')}-${Date.now()}`;
    const creator = localStorage.getItem('admin_user') || 'Admin';

    try {
        await axios.post(`${API_URL}/api/quizzes`, { 
            id: quizId, title, schedule: quizType === 'mock' ? { start: null, end: null } : schedule, 
            questions, createdBy: creator, targetYears,
            category, 
            quizType, 
            duration: quizType === 'mock' ? 0 : duration 
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success("Saved");
        setView('dashboard');
    } catch (e) { toast.error("Save failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32 text-slate-100 font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 2000, style: { background: '#1e293b', color: '#fff' } }}/>
      
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><FileText className="text-purple-500"/> Admin Console</h1>
            <Link to="/study" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg"><FileText size={14} /> Study Material</Link>
          </div>
          <div className="flex items-center gap-4">
             {view === 'editor' && <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition ${previewMode ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{previewMode ? <EyeOff size={16}/> : <Eye size={16}/>} {previewMode ? 'Edit' : 'Preview'}</button>}
             <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 flex gap-2"><LogOut size={16}/> Logout</button>
          </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between mb-8">
              <h2 className="text-2xl font-bold">Your Quizzes</h2>
              <button onClick={handleCreateNew} className="px-5 py-2 bg-purple-600 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> New Quiz</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(q => (
                    <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 flex flex-col">
                        <div className="flex justify-between mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${q.quizType==='mock'?'bg-blue-900/30 text-blue-400':'bg-green-900/30 text-green-400'}`}>{q.quizType}</span>
                            <div className="flex gap-2"><button onClick={()=>handleEditQuiz(q.id)}><Edit size={16} className="text-slate-400 hover:text-white"/></button><button onClick={()=>handleDeleteQuiz(q.id)}><Trash2 size={16} className="text-slate-400 hover:text-red-400"/></button></div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{q.title}</h3>
                        <div className="text-sm text-slate-500 mt-auto pt-4 border-t border-slate-800 flex gap-4">
                            <span>{q.quizType === 'mock' ? 'No Expiration' : new Date(q.schedule.start).toLocaleDateString()}</span>
                            <span>{q.questionCount} Qs</span>
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}

        {view === 'editor' && !previewMode && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setView('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Dashboard</button>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-6">
                <input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-lg font-medium outline-none focus:border-purple-500" placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Category</label>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['aptitude', 'coding'].map(c => <button key={c} onClick={() => setCategory(c)} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize ${category === c ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>{c}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Type</label>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['weekly', 'mock'].map(t => <button key={t} onClick={() => setQuizType(t)} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize ${quizType === t ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>{t}</button>)}
                        </div>
                    </div>
                    {quizType !== 'mock' && (
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Duration (Mins)</label>
                            <input type="number" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500" value={duration} onChange={e => setDuration(Number(e.target.value))} />
                        </div>
                    )}
                </div>

                {quizType !== 'mock' && (
                    <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed">
                        <div className="relative group"><label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Start Time</label><input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={schedule.start} onChange={e => setSchedule({...schedule, start: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} /></div>
                        <div className="relative group"><label className="text-xs text-slate-500 font-bold uppercase mb-2 block">End Time</label><input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={schedule.end} onChange={e => setSchedule({...schedule, end: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} /></div>
                    </div>
                )}
                
                <div>
                   <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Target Audience</label>
                   <div className="flex gap-2">
                      {['FY', 'SY', 'TY', 'BE'].map(year => <button key={year} onClick={() => toggleYear(year)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${targetYears.includes(year) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>{year}</button>)}
                   </div>
                </div>
            </div>

            <div className="space-y-8">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative shadow-lg">
                        <button onClick={()=>{const n=[...questions]; n.splice(qIndex,1); setQuestions(n)}} className="absolute top-4 right-4 text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
                        <div className="pl-6 space-y-4">
                            <div className="flex gap-4">
                                <select className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-300 outline-none" value={q.type} onChange={e=>updateQ(qIndex,'type',e.target.value)}><option value="mcq">MCQ</option><option value="code">Code</option></select>
                                <input type="number" className="w-20 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-right text-white" value={q.marks} onChange={e=>updateQ(qIndex,'marks',e.target.value)} placeholder="Pts"/>
                            </div>
                            <div data-color-mode="dark"><div className="flex justify-between mb-2"><label className="text-xs font-bold text-slate-500 uppercase">Question Content</label><MarkdownImageInserter onInsert={(markdown) => updateQ(qIndex, 'text', q.text + markdown)} /></div><MDEditor value={q.text} onChange={(val) => updateQ(qIndex, 'text', val)} preview="edit" height={200} className="!bg-slate-950 !border !border-slate-800 rounded-lg" /></div>
                            {q.type === 'mcq' && (<div className="space-y-2">{q.options.map((opt, oIndex) => (<div key={oIndex} className="flex gap-2 items-start"><button onClick={()=>{const n=[...questions]; const isSel=n[qIndex].correctIndices.includes(oIndex); if(q.isMultiSelect) n[qIndex].correctIndices = isSel ? n[qIndex].correctIndices.filter(i=>i!==oIndex) : [...n[qIndex].correctIndices, oIndex]; else n[qIndex].correctIndices=[oIndex]; setQuestions(n);}} className={`mt-2 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${q.correctIndices.includes(oIndex) ? 'bg-purple-600 border-purple-600' : 'border-slate-600'}`}>{q.correctIndices.includes(oIndex) && <CheckSquare size={12} className="text-white" />}</button><div className="flex-1 space-y-2"><input className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-sm text-white" value={opt.text} onChange={e=>{const n=[...questions]; n[qIndex].options[oIndex].text=e.target.value; setQuestions(n)}} placeholder="Option"/><OptionImageUploader onUpload={(url)=>{const n=[...questions]; n[qIndex].options[oIndex].image=url; setQuestions(n)}} />{opt.image && <img src={`${API_URL}${opt.image}`} className="h-10 rounded border border-slate-700"/>}</div><button onClick={()=>{const n=[...questions]; n[qIndex].options.splice(oIndex,1); setQuestions(n)}} className="mt-2"><Trash2 size={16} className="text-slate-600"/></button></div>))}<button onClick={()=>{const n=[...questions]; n[qIndex].options.push({text:'', image:''}); setQuestions(n)}} className="text-xs text-purple-400 font-bold">+ Option</button><label className="flex gap-2 text-xs text-slate-400 ml-4"><input type="checkbox" checked={q.isMultiSelect} onChange={e=>updateQ(qIndex,'isMultiSelect',e.target.checked)} /> Multi-Select</label></div>)}
                            {q.type === 'code' && (<div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="flex gap-2 mb-3 text-emerald-400 text-sm font-bold uppercase"><Code size={16} /> Test Cases</div>{q.testCases.map((tc, tIndex) => (<div key={tIndex} className="flex gap-2 mb-2"><input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400" placeholder="Input" value={tc.input} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].input=e.target.value; setQuestions(n)}} /><input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400" placeholder="Output" value={tc.output} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].output=e.target.value; setQuestions(n)}} /><button onClick={()=>{const n=[...questions]; n[qIndex].testCases.splice(tIndex,1); setQuestions(n)}}><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button></div>))}<button onClick={()=>{const n=[...questions]; n[qIndex].testCases.push({input:'',output:''}); setQuestions(n)}} className="text-xs text-emerald-500 font-bold flex gap-1"><Plus size={14}/> Add Case</button></div>)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 mb-20 mt-8">
                <button onClick={() => setQuestions([...questions, { id: Date.now(), type: 'mcq', text: '**Problem**', marks: 5, options: [{text:'', image:''}, {text:'', image:''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}]}])} className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-purple-400 font-bold flex justify-center gap-2"><Plus size={20}/> Manual</button>
                <label className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 font-bold flex justify-center gap-2 cursor-pointer"><FileUp size={20}/> PDF Import<input type="file" accept=".pdf" hidden onChange={handlePdfUpload} /></label>
            </div>
            
            <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex justify-end px-6 shadow-2xl z-50">
                <button onClick={handleSave} className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg">{editingId ? 'Update' : 'Publish'}</button>
            </div>
          </div>
        )}

        {/* PREVIEW VIEW */}
        {view === 'editor' && previewMode && (
          <div className="animate-in fade-in duration-300 pb-20">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setView('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Dashboard</button>
                 <span className="px-3 py-1 bg-purple-900/50 text-purple-200 text-xs font-bold rounded-full uppercase tracking-wider">Preview Mode</span>
            </div>
            <div className="space-y-8 max-w-4xl mx-auto">
               <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">{title || "Untitled Quiz"}</h1>
                  <div className="flex justify-center gap-4 text-sm text-slate-400">
                      <span>{questions.length} Questions</span>
                      <span>•</span>
                      <span>Target: {targetYears.join(', ')}</span>
                  </div>
               </div>
               {questions.map((q, i) => (
                 <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative">
                    <div className="absolute top-0 left-0 bg-slate-800 px-4 py-1 rounded-br-xl text-xs font-bold text-slate-400">Q{i+1}</div>
                    <div className="mb-6 text-slate-200" data-color-mode="dark"><MDEditor.Markdown source={q.text.replace(/\]\(\/uploads\//g, `](${API_URL}/uploads/`)} style={{ backgroundColor: 'transparent', color: '#e2e8f0' }} /></div>
                    {q.type === 'mcq' && (
                      <div className="space-y-3">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border border-slate-700 bg-slate-900 flex items-start gap-4 ${q.correctIndices.includes(idx) ? 'border-green-500/50 bg-green-900/10' : ''}`}>
                             <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctIndices.includes(idx) ? 'border-green-500' : 'border-slate-600'}`}>{q.correctIndices.includes(idx) && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}</div>
                             <div className="flex-1">{opt.image && <img src={getImageUrl(opt.image)} className="mb-2 h-32 rounded object-contain" />}<div className="text-slate-300">{opt.text}</div></div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminPanel;