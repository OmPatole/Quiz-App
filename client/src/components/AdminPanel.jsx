import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Trash2, Plus, LogOut, FileText, Calendar, 
  Code, CheckSquare, Edit, ArrowLeft, Image as ImageIcon, X 
} from 'lucide-react';

// RECEIVE setIsAuth PROP
const AdminPanel = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [quizzes, setQuizzes] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (!isAdmin) {
      setIsAuth(false); // Sync state just in case
      navigate('/login', { replace: true });
    }
  }, [navigate, setIsAuth]);

  const fetchQuizzes = () => axios.get('http://localhost:3001/api/quizzes').then(res => setQuizzes(res.data));
  useEffect(() => { fetchQuizzes(); }, [view]);

  // --- FIXED LOGOUT FUNCTION ---
  const handleLogout = () => {
    // 1. Clear Storage
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_session');
    
    // 2. Update Parent State (Immediate UI Update)
    setIsAuth(false);

    // 3. Redirect
    navigate('/login', { replace: true });
    toast.success("Logged out successfully");
  };

  const handleDeleteQuiz = async (id) => { 
      if(window.confirm("Delete this quiz?")) { 
          await axios.delete(`http://localhost:3001/api/quizzes/${id}`); 
          toast.success("Quiz deleted");
          fetchQuizzes(); 
      }
  };
  
  const handleEditQuiz = async (id) => {
      const res = await axios.get(`http://localhost:3001/api/quizzes/${id}`);
      setEditingId(res.data.id); setTitle(res.data.title); setSchedule(res.data.schedule); setQuestions(res.data.questions); setView('editor');
  };

  const handleCreateNew = () => {
      setEditingId(null); setTitle(''); setSchedule({ start: '', end: '' });
      setQuestions([{ id: Date.now(), type: 'mcq', text: '**Problem Description**...', marks: 5, options: [{text:'', image: ''}, {text:'', image: ''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}] }]);
      setView('editor');
  };

  const getStatus = (s) => {
    if(!s?.start) return { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-800' };
    const now=new Date(); if(now<new Date(s.start)) return {label:'Upcoming',color:'text-yellow-400',bg:'bg-yellow-400/10'};
    if(now>new Date(s.end)) return {label:'Ended',color:'text-red-400',bg:'bg-red-400/10'};
    return {label:'Live',color:'text-emerald-400',bg:'bg-emerald-400/10'};
  };

  const updateQ = (i, f, v) => { const n=[...questions]; n[i][f]=v; setQuestions(n); };

  const OptionImageUploader = ({ onUpload }) => {
    const onDrop = useCallback(acceptedFiles => {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      const loadingToast = toast.loading("Uploading...");
      axios.post('http://localhost:3001/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
        .then(res => { toast.dismiss(loadingToast); onUpload(res.data.imageUrl); })
        .catch(err => { toast.dismiss(loadingToast); toast.error("Upload failed"); });
    }, [onUpload]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
    return (
      <div {...getRootProps()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer border border-slate-700 text-slate-400 hover:text-white transition">
        <input {...getInputProps()} /> <ImageIcon size={16} />
      </div>
    );
  };

  const MarkdownImageInserter = ({ onInsert }) => {
    const onDrop = useCallback(acceptedFiles => {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      const loadingToast = toast.loading("Uploading...");
      axios.post('http://localhost:3001/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
        .then(res => { toast.dismiss(loadingToast); onInsert(`\n![Description](${res.data.imageUrl})\n`); })
        .catch(err => { toast.dismiss(loadingToast); toast.error("Upload failed"); });
    }, [onInsert]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
    return (
      <div {...getRootProps()} className="inline-flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700 transition">
        <input {...getInputProps()} /> <ImageIcon size={14} /> Insert Image
      </div>
    );
  };

  const handleSave = async () => {
    if(!title.trim()) return toast.error("Title required");
    if(!schedule.start || !schedule.end) return toast.error("Time required");
    if (questions.length === 0) return toast.error("Add at least one question");

    const quizId = editingId || `${title.trim().replace(/\s+/g, '-')}-${Date.now()}`;
    
    try {
        await axios.post('http://localhost:3001/api/quizzes', { id: quizId, title, schedule, questions });
        toast.success("Saved successfully");
        setView('dashboard');
    } catch (e) { toast.error("Save failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32 text-slate-100 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>

      <style>{`
        .w-md-editor-toolbar li > button svg { width: 20px !important; height: 20px !important; }
        .w-md-editor-toolbar { padding: 8px !important; }
        .w-md-editor-toolbar li > button { height: 32px !important; width: 32px !important; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2"><FileText className="text-purple-500"/> Admin Console</h1>
          <button onClick={handleLogout} className="text-sm text-red-400 flex items-center gap-2 hover:text-red-300 transition">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Your Quizzes</h2>
              <button onClick={handleCreateNew} className="px-5 py-2 bg-purple-600 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> New Quiz</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(q => { const s=getStatus(q.schedule); return (
                    <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 flex flex-col">
                        <div className="flex justify-between mb-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.bg} ${s.color}`}>{s.label}</span><div className="flex gap-2"><button onClick={()=>handleEditQuiz(q.id)}><Edit size={16} className="text-slate-400 hover:text-white"/></button><button onClick={()=>handleDeleteQuiz(q.id)}><Trash2 size={16} className="text-slate-400 hover:text-red-400"/></button></div></div>
                        <h3 className="text-xl font-bold mb-2">{q.title}</h3>
                        <div className="text-sm text-slate-500 mt-auto pt-4 border-t border-slate-800 flex gap-4">
                            <span className="flex gap-1 items-center"><Calendar size={14}/> {new Date(q.schedule.start).toLocaleDateString()}</span>
                            <span className="flex gap-1 items-center"><FileText size={14}/> {q.questionCount} Qs</span>
                        </div>
                    </div>
                )})}
            </div>
          </>
        )}

        {view === 'editor' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setView('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Dashboard</button>
                 <span className="text-slate-500 text-sm font-mono">{editingId ? 'EDITING' : 'CREATING'}</span>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-4">
                <input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-6">
                    <input type="datetime-local" className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200" value={schedule.start} onChange={e => setSchedule({...schedule, start: e.target.value})} />
                    <input type="datetime-local" className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200" value={schedule.end} onChange={e => setSchedule({...schedule, end: e.target.value})} />
                </div>
            </div>

            <div className="space-y-8">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative">
                        <button onClick={()=>{const n=[...questions]; n.splice(qIndex,1); setQuestions(n)}} className="absolute top-4 right-4 text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
                        <div className="absolute -left-3 top-6 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg">{qIndex+1}</div>

                        <div className="pl-6 space-y-4">
                            <div className="flex gap-4">
                                <select className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-300" value={q.type} onChange={e=>updateQ(qIndex,'type',e.target.value)}><option value="mcq">MCQ</option><option value="code">Code</option></select>
                                <input type="number" className="w-20 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-right text-white focus:border-purple-500 outline-none" value={q.marks} onChange={e=>updateQ(qIndex,'marks',e.target.value)} placeholder="Pts"/>
                            </div>

                            <div data-color-mode="dark">
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Question Content</label>
                                    <MarkdownImageInserter onInsert={(markdown) => updateQ(qIndex, 'text', q.text + markdown)} />
                                </div>
                                <MDEditor value={q.text} onChange={(val) => updateQ(qIndex, 'text', val)} preview="edit" height={300} className="!bg-slate-950 !border !border-slate-800 rounded-lg" />
                            </div>

                            {q.type === 'mcq' && (
                                <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex gap-3 items-start">
                                            <button onClick={()=>{const n=[...questions]; const isSel=n[qIndex].correctIndices.includes(oIndex); if(q.isMultiSelect) n[qIndex].correctIndices = isSel ? n[qIndex].correctIndices.filter(i=>i!==oIndex) : [...n[qIndex].correctIndices, oIndex]; else n[qIndex].correctIndices=[oIndex]; setQuestions(n);}} className={`mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${q.correctIndices.includes(oIndex) ? 'bg-purple-600 border-purple-600' : 'border-slate-600'}`}>{q.correctIndices.includes(oIndex) && <CheckSquare size={14} className="text-white" />}</button>
                                            
                                            <div className="flex-1 space-y-2">
                                                <input className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-sm text-white" value={opt.text} onChange={e=>{const n=[...questions]; n[qIndex].options[oIndex].text=e.target.value; setQuestions(n)}} placeholder="Option Text"/>
                                                {opt.image && (
                                                  <div className="relative w-fit group/img">
                                                    <img src={opt.image} className="h-20 rounded border border-slate-700" alt="option"/>
                                                    <button onClick={()=>{const n=[...questions]; n[qIndex].options[oIndex].image=''; setQuestions(n)}} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover/img:opacity-100 transition"><X size={12}/></button>
                                                  </div>
                                                )}
                                            </div>

                                            <OptionImageUploader onUpload={(url)=>{const n=[...questions]; n[qIndex].options[oIndex].image=url; setQuestions(n)}} />
                                            <button onClick={()=>{const n=[...questions]; n[qIndex].options.splice(oIndex,1); setQuestions(n)}} className="mt-1"><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                                        </div>
                                    ))}
                                    <div className="flex justify-between mt-2">
                                        <button onClick={()=>{const n=[...questions]; n[qIndex].options.push({text:'', image:''}); setQuestions(n)}} className="text-xs text-purple-400 font-bold flex gap-1"><Plus size={14}/> Add Option</button>
                                        <label className="flex gap-2 text-xs text-slate-400"><input type="checkbox" checked={q.isMultiSelect} onChange={e=>updateQ(qIndex,'isMultiSelect',e.target.checked)} /> Multi-Select</label>
                                    </div>
                                </div>
                            )}

                            {q.type === 'code' && (
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="flex gap-2 mb-3 text-emerald-400 text-sm font-bold uppercase"><Code size={16} /> Test Cases</div>
                                    {q.testCases.map((tc, tIndex) => (
                                        <div key={tIndex} className="flex gap-2 mb-2">
                                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400" placeholder="Input" value={tc.input} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].input=e.target.value; setQuestions(n)}} />
                                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400" placeholder="Output" value={tc.output} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].output=e.target.value; setQuestions(n)}} />
                                            <button onClick={()=>{const n=[...questions]; n[qIndex].testCases.splice(tIndex,1); setQuestions(n)}}><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                                        </div>
                                    ))}
                                    <button onClick={()=>{const n=[...questions]; n[qIndex].testCases.push({input:'',output:''}); setQuestions(n)}} className="text-xs text-emerald-500 font-bold flex gap-1"><Plus size={14}/> Add Case</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={() => setQuestions([...questions, { id: Date.now(), type: 'mcq', text: '**New Question**', marks: 5, options: [{text:'', image:''}, {text:'', image:''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}]}])} className="mt-8 w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-purple-400 font-bold mb-20 flex justify-center gap-2"><Plus size={20}/> Add Question</button>
            <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex justify-end px-6 shadow-2xl z-50"><button onClick={handleSave} className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg">{editingId ? 'Update Quiz' : 'Publish Quiz'}</button></div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminPanel;