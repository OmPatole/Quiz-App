import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Trash2, Plus, LogOut, FileText, Calendar, 
  Code, CheckSquare, Edit, ArrowLeft, Image as ImageIcon, X, Users, User, Eye, EyeOff, FileUp, Clock, Layers, UploadCloud
} from 'lucide-react';

const AdminPanel = ({ setIsAuth }) => {
  // --- CONFIGURATION ---
  // Change this to your Ubuntu Server IP if accessing from other devices (e.g., 'http://192.168.1.50:3001')
  const API_URL = 'http://localhost:3001'; 

  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor' | 'students'
  const [previewMode, setPreviewMode] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  
  // --- EDITOR STATE ---
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState({ start: '', end: '' });
  const [questions, setQuestions] = useState([]);
  const [targetYears, setTargetYears] = useState(['FY', 'SY', 'TY', 'BE']);
  
  // Quiz Settings
  const [category, setCategory] = useState('aptitude'); 
  const [quizType, setQuizType] = useState('weekly');   
  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // --- AUTH CHECK ---
  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (!isAdmin) {
      if(setIsAuth) setIsAuth(false);
      navigate('/login', { replace: true });
    }
  }, [navigate, setIsAuth]);

  // --- FETCH DATA ---
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
  
  // Refresh quizzes when switching to dashboard
  useEffect(() => { if (view === 'dashboard') fetchQuizzes(); }, [view]);

  const handleLogout = () => {
    localStorage.clear(); 
    sessionStorage.clear();
    if(setIsAuth) setIsAuth(false);
    navigate('/login', { replace: true });
  };

  // --- HANDLERS: QUIZ MANAGEMENT ---
  const handleCreateNew = () => {
      setEditingId(null); setTitle(''); setSchedule({ start: '', end: '' });
      setTargetYears(['FY', 'SY', 'TY', 'BE']);
      setCategory('aptitude'); setQuizType('weekly'); 
      setDurationHours(1); setDurationMinutes(0);
      setQuestions([{ id: Date.now(), type: 'mcq', text: '**New Question**', marks: 5, options: [{text:'', image: ''}, {text:'', image: ''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}] }]);
      setPreviewMode(false);
      setView('editor');
  };

  const handleEditQuiz = async (id) => {
      try {
        const token = localStorage.getItem('token');
        // Fetch full details securely
        const res = await axios.get(`${API_URL}/api/admin/quiz-details/${id}`, { headers: { Authorization: `Bearer ${token}` }});
        
        const data = res.data;
        setEditingId(data.id); 
        setTitle(data.title); 
        setSchedule(data.schedule || { start: '', end: '' }); 
        setQuestions(data.questions);
        setTargetYears(data.targetYears || ['FY', 'SY', 'TY', 'BE']);
        setCategory(data.category || 'aptitude');
        setQuizType(data.quizType || 'weekly');
        
        // Parse Minutes back to HH:MM
        const totalMins = data.duration || 60;
        setDurationHours(Math.floor(totalMins / 60));
        setDurationMinutes(totalMins % 60);

        setPreviewMode(false);
        setView('editor');
      } catch(e) { toast.error("Error loading quiz data"); }
  };

  const handleDeleteQuiz = async (id) => { 
      if(window.confirm("Delete this quiz permanently?")) { 
          try {
            await axios.delete(`${API_URL}/api/quizzes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }); 
            toast.success("Deleted");
            fetchQuizzes(); 
          } catch(e) { toast.error("Delete failed"); }
      }
  };

  const handleSave = async () => {
    if(!title.trim()) return toast.error("Title required");
    if(questions.length === 0) return toast.error("Add at least one question");
    
    // Validation: Schedule is mandatory ONLY for Weekly tests
    if (quizType !== 'mock') {
        if(!schedule.start || !schedule.end) return toast.error("Schedule required for Weekly tests");
    }

    const quizId = editingId || `${title.trim().replace(/\s+/g, '-')}-${Date.now()}`;
    const creator = localStorage.getItem('admin_user') || 'Admin';
    const totalDuration = (parseInt(durationHours) * 60) + parseInt(durationMinutes);

    try {
        await axios.post(`${API_URL}/api/quizzes`, { 
            id: quizId, 
            title, 
            schedule: quizType === 'mock' ? { start: null, end: null } : schedule, 
            questions, 
            createdBy: creator, 
            targetYears,
            category, 
            quizType, 
            duration: totalDuration 
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success("Quiz Saved Successfully");
        setView('dashboard');
    } catch (e) { toast.error("Save failed"); }
  };

  // --- HANDLERS: UPLOADS ---
  const handleStudentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const load = toast.loading("Uploading Students...");
    try {
        const res = await axios.post(`${API_URL}/api/admin/upload-students`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.success) toast.success(res.data.message);
        else toast.error(res.data.message);
    } catch (err) { toast.error("Upload Failed. Check CSV format."); } 
    finally { toast.dismiss(load); }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const load = toast.loading("Parsing PDF...");
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

  // --- HELPERS ---
  const updateQ = (i, f, v) => { const n=[...questions]; n[i][f]=v; setQuestions(n); };
  const toggleYear = (year) => setTargetYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  const getImageUrl = (path) => path ? (path.startsWith('http') ? path : `${API_URL}${path}`) : '';

  // --- IMAGE COMPONENTS ---
  const OptionImageUploader = ({ onUpload }) => {
    const onDrop = useCallback(files => {
      const formData = new FormData(); formData.append('file', files[0]);
      const load = toast.loading("Uploading...");
      axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
        .then(res => { toast.dismiss(load); onUpload(res.data.imageUrl); })
        .catch(() => { toast.dismiss(load); toast.error("Failed"); });
    }, [onUpload]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
    return <div {...getRootProps()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer border border-slate-700 text-slate-400 hover:text-white" title="Upload Image"><input {...getInputProps()} /> <ImageIcon size={16} /></div>;
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

  return (
    <div className="min-h-screen bg-slate-950 pb-32 text-slate-100 font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 2500, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><FileText className="text-purple-500"/> Admin Console</h1>
            <div className="flex gap-2">
                <button onClick={() => setView('dashboard')} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${view === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Quizzes</button>
                <button onClick={() => setView('students')} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${view === 'students' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Students</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/study" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition"><FileText size={14} /> Study Material</Link>
             {view === 'editor' && <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition ${previewMode ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{previewMode ? <EyeOff size={16}/> : <Eye size={16}/>} {previewMode ? 'Edit' : 'Preview'}</button>}
             <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 flex gap-2"><LogOut size={16}/> Logout</button>
          </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* --- 1. STUDENTS VIEW --- */}
        {view === 'students' && (
            <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Student Database</h2>
                    <label className="px-5 py-2 bg-blue-600 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition cursor-pointer shadow-lg active:scale-95 transform">
                        <UploadCloud size={18} /> Upload CSV
                        <input type="file" accept=".csv" hidden onChange={handleStudentUpload} />
                    </label>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-6"><Users size={32}/></div>
                    <h3 className="text-xl font-bold text-white mb-2">Bulk Import</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Upload a <strong>CSV file</strong> to register students. Since you skipped the seed file, you <strong>must</strong> do this to add students.</p>
                    <div className="text-left bg-slate-950 p-6 rounded-xl border border-slate-800 max-w-lg mx-auto font-mono text-xs text-slate-300">
                        <div className="text-slate-500 font-bold mb-2">REQUIRED CSV HEADERS:</div>
                        name, prn, year, branch
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. DASHBOARD VIEW --- */}
        {view === 'dashboard' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Quiz Library</h2>
              <button onClick={handleCreateNew} className="px-5 py-2 bg-purple-600 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 transition shadow-lg active:scale-95 transform"><Plus size={18} /> Create Quiz</button>
            </div>
            {quizzes.length === 0 ? <div className="text-center py-20 text-slate-500">No quizzes available.</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(q => (
                        <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition flex flex-col group">
                            <div className="flex justify-between mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${q.quizType==='mock'?'bg-blue-900/30 text-blue-400':'bg-green-900/30 text-green-400'}`}>{q.quizType}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={()=>handleEditQuiz(q.id)} className="text-slate-400 hover:text-white"><Edit size={16}/></button>
                                    <button onClick={()=>handleDeleteQuiz(q.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{q.title}</h3>
                            <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><Clock size={12}/> {q.duration > 0 ? `${q.duration}m` : 'Unlimited'}</span>
                                <span className="flex items-center gap-1"><Layers size={12}/> {q.questionCount} Qs</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </>
        )}

        {/* --- 3. EDITOR VIEW --- */}
        {view === 'editor' && !previewMode && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setView('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back to Dashboard</button>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-6 shadow-xl">
                <input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-lg font-medium outline-none focus:border-purple-500 transition" placeholder="Enter Quiz Title..." value={title} onChange={e => setTitle(e.target.value)} />
                
                {/* SETTINGS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Category</label>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['aptitude', 'coding'].map(c => <button key={c} onClick={() => setCategory(c)} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition ${category === c ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{c}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Type</label>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['weekly', 'mock'].map(t => <button key={t} onClick={() => setQuizType(t)} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition ${quizType === t ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>)}
                        </div>
                    </div>
                    
                    {/* DURATION (HH:MM) */}
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Duration (HH : MM)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input type="number" min="0" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={durationHours} onChange={e => setDurationHours(e.target.value)} />
                                <span className="absolute right-2 top-2 text-xs text-slate-500 font-bold mt-0.5">HR</span>
                            </div>
                            <span className="text-slate-600 font-bold py-2">:</span>
                            <div className="relative flex-1">
                                <input type="number" min="0" max="59" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
                                <span className="absolute right-2 top-2 text-xs text-slate-500 font-bold mt-0.5">MIN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SCHEDULE (Only for Weekly) */}
                {quizType !== 'mock' && (
                    <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed">
                        <div className="relative group"><label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Start Time</label><input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={schedule.start} onChange={e => setSchedule({...schedule, start: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} /></div>
                        <div className="relative group"><label className="text-xs text-slate-500 font-bold uppercase mb-2 block">End Time</label><input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={schedule.end} onChange={e => setSchedule({...schedule, end: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} /></div>
                    </div>
                )}
                
                <div>
                   <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Target Audience</label>
                   <div className="flex gap-2">
                      {['FY', 'SY', 'TY', 'BE'].map(year => <button key={year} onClick={() => toggleYear(year)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${targetYears.includes(year) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>{year}</button>)}
                   </div>
                </div>
            </div>

            {/* QUESTIONS LIST */}
            <div className="space-y-8">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative shadow-lg group">
                        <button onClick={()=>{const n=[...questions]; n.splice(qIndex,1); setQuestions(n)}} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                        <div className="absolute -left-3 top-6 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg">{qIndex+1}</div>

                        <div className="pl-6 space-y-4">
                            <div className="flex gap-4">
                                <select className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-300 outline-none focus:border-purple-500" value={q.type} onChange={e=>updateQ(qIndex,'type',e.target.value)}><option value="mcq">MCQ</option><option value="code">Code</option></select>
                                <input type="number" className="w-20 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-right text-white focus:border-purple-500 outline-none" value={q.marks} onChange={e=>updateQ(qIndex,'marks',e.target.value)} placeholder="Pts"/>
                            </div>

                            <div data-color-mode="dark">
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Question Content</label>
                                    <MarkdownImageInserter onInsert={(markdown) => updateQ(qIndex, 'text', q.text + markdown)} />
                                </div>
                                <MDEditor value={q.text} onChange={(val) => updateQ(qIndex, 'text', val)} preview="edit" height={200} className="!bg-slate-950 !border !border-slate-800 rounded-lg" />
                            </div>

                            {q.type === 'mcq' && (
                                <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex gap-3 items-start">
                                            <button onClick={()=>{const n=[...questions]; const isSel=n[qIndex].correctIndices.includes(oIndex); if(q.isMultiSelect) n[qIndex].correctIndices = isSel ? n[qIndex].correctIndices.filter(i=>i!==oIndex) : [...n[qIndex].correctIndices, oIndex]; else n[qIndex].correctIndices=[oIndex]; setQuestions(n);}} className={`mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${q.correctIndices.includes(oIndex) ? 'bg-purple-600 border-purple-600' : 'border-slate-600'}`}>{q.correctIndices.includes(oIndex) && <CheckSquare size={14} className="text-white" />}</button>
                                            
                                            <div className="flex-1 space-y-2">
                                                <input className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-sm text-white focus:border-purple-500 outline-none" value={opt.text} onChange={e=>{const n=[...questions]; n[qIndex].options[oIndex].text=e.target.value; setQuestions(n)}} placeholder="Option Text"/>
                                                {opt.image && (
                                                  <div className="relative w-fit group/img">
                                                    <img src={`${opt.image.startsWith('http') ? '' : API_URL}${opt.image}`} className="h-20 rounded border border-slate-700" alt="option"/>
                                                    <button onClick={()=>{const n=[...questions]; n[qIndex].options[oIndex].image=''; setQuestions(n)}} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover/img:opacity-100 transition"><X size={12}/></button>
                                                  </div>
                                                )}
                                            </div>
                                            <OptionImageUploader onUpload={(url)=>{const n=[...questions]; n[qIndex].options[oIndex].image=url; setQuestions(n)}} />
                                            <button onClick={()=>{const n=[...questions]; n[qIndex].options.splice(oIndex,1); setQuestions(n)}} className="mt-1"><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                                        </div>
                                    ))}
                                    <div className="flex justify-between mt-2">
                                        <button onClick={()=>{const n=[...questions]; n[qIndex].options.push({text:'', image:''}); setQuestions(n)}} className="text-xs text-purple-400 font-bold flex gap-1 hover:text-purple-300"><Plus size={14}/> Add Option</button>
                                        <label className="flex gap-2 text-xs text-slate-400 cursor-pointer select-none"><input type="checkbox" checked={q.isMultiSelect} onChange={e=>updateQ(qIndex,'isMultiSelect',e.target.checked)} /> Multi-Select</label>
                                    </div>
                                </div>
                            )}

                            {q.type === 'code' && (
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <div className="flex gap-2 mb-3 text-emerald-400 text-sm font-bold uppercase"><Code size={16} /> Test Cases</div>
                                    {q.testCases.map((tc, tIndex) => (
                                        <div key={tIndex} className="flex gap-2 mb-2">
                                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" placeholder="Input" value={tc.input} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].input=e.target.value; setQuestions(n)}} />
                                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" placeholder="Output" value={tc.output} onChange={e => {const n=[...questions]; n[qIndex].testCases[tIndex].output=e.target.value; setQuestions(n)}} />
                                            <button onClick={()=>{const n=[...questions]; n[qIndex].testCases.splice(tIndex,1); setQuestions(n)}}><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                                        </div>
                                    ))}
                                    <button onClick={()=>{const n=[...questions]; n[qIndex].testCases.push({input:'',output:''}); setQuestions(n)}} className="text-xs text-emerald-500 font-bold flex gap-1 hover:text-emerald-400"><Plus size={14}/> Add Case</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 mb-20 mt-8">
                <button onClick={() => setQuestions([...questions, { id: Date.now(), type: 'mcq', text: '**Problem Description**', marks: 5, options: [{text:'', image:''}, {text:'', image:''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}]}])} className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-purple-400 font-bold flex justify-center gap-2 transition hover:border-purple-500/50"><Plus size={20}/> Add Manually</button>
                <label className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 font-bold flex justify-center gap-2 transition hover:border-blue-500/50 cursor-pointer">
                    <FileUp size={20}/> Import from PDF
                    <input type="file" accept=".pdf" hidden onChange={handlePdfUpload} />
                </label>
            </div>
            
            <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex justify-end px-6 shadow-2xl z-50">
                <button onClick={handleSave} className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition transform active:scale-95">{editingId ? 'Update Quiz' : 'Publish Quiz'}</button>
            </div>
          </div>
        )}

        {/* --- 4. PREVIEW VIEW --- */}
        {view === 'editor' && previewMode && (
          <div className="animate-in fade-in duration-300 pb-20">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setPreviewMode(false)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back to Editor</button>
                 <span className="px-3 py-1 bg-purple-900/50 text-purple-200 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-500/30">Student Preview</span>
            </div>
            
            <div className="space-y-8 max-w-4xl mx-auto">
               <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">{title || "Untitled Quiz"}</h1>
                  <div className="flex justify-center gap-4 text-sm text-slate-400">
                      <span>{questions.length} Questions</span>
                      <span>•</span>
                      <span>{(parseInt(durationHours)*60) + parseInt(durationMinutes)} Mins</span>
                      <span>•</span>
                      <span className="uppercase text-purple-400 font-bold">{quizType}</span>
                  </div>
               </div>

               {questions.map((q, i) => (
                 <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative">
                    <div className="absolute top-0 left-0 bg-slate-800 px-4 py-1 rounded-br-xl text-xs font-bold text-slate-400">Q{i+1}</div>
                    
                    <div className="mb-6 text-slate-200" data-color-mode="dark">
                        <MDEditor.Markdown source={q.text.replace(/\]\(\/uploads\//g, `](${API_URL}/uploads/`)} style={{ backgroundColor: 'transparent', color: '#e2e8f0' }} />
                    </div>

                    {q.type === 'mcq' && (
                      <div className="space-y-3">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border border-slate-700 bg-slate-900 flex items-start gap-4 ${q.correctIndices.includes(idx) ? 'border-green-500/50 bg-green-900/10' : ''}`}>
                             <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correctIndices.includes(idx) ? 'border-green-500' : 'border-slate-600'}`}>
                                {q.correctIndices.includes(idx) && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                             </div>
                             <div className="flex-1">
                                {opt.image && <img src={getImageUrl(opt.image)} alt="option" className="mb-2 h-32 rounded-lg border border-slate-700 object-contain" />}
                                <div className="text-slate-300">{opt.text}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'code' && (
                       <div className="bg-black/30 rounded-xl border border-slate-800 p-4 font-mono text-sm text-slate-400">
                          <div className="flex items-center gap-2 mb-2 text-purple-400"><Code size={16}/> Code Editor Placeholder</div>
                          <div className="h-32 flex items-center justify-center border border-dashed border-slate-700 rounded-lg">
                             (Students will see a code editor here)
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                             {q.testCases.map((tc, ti) => (
                               <div key={ti} className="bg-slate-900 p-3 rounded text-xs">
                                  <div className="text-slate-500 font-bold mb-1">Case {ti+1}</div>
                                  <div className="truncate">In: {tc.input}</div>
                                  <div className="truncate">Out: {tc.output}</div>
                               </div>
                             ))}
                          </div>
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