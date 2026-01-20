import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

// --- SUB-COMPONENTS ---
import AdminNavbar from './admin/AdminNavbar';
import QuizList from './admin/quizzes/QuizList';
import QuizEditor from './admin/quizzes/editor/QuizEditor';
import BatchList from './admin/students/BatchList';
import StudentList from './admin/students/StudentList';
import StudentProfile from './admin/students/StudentProfile';
import StudyMaterials from './StudyMaterials'; 
import AdminManager from './admin/settings/AdminManager';

const AdminPanel = ({ setIsAuth }) => {
  const API_URL = 'http://localhost:3001'; 
  const navigate = useNavigate();

  // --- VIEW STATES ---
  const [view, setView] = useState('quizzes');
  const [previewMode, setPreviewMode] = useState(false);
  
  // --- DATA STATES ---
  const [quizzes, setQuizzes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);

  // --- EDITOR STATES ---
  const [editingId, setEditingId] = useState(null);
  
  // --- SCOPE & TAB STATES ---
  const [adminScope, setAdminScope] = useState('all'); // 'all', 'aptitude', 'coding'
  const [activeQuizTab, setActiveQuizTab] = useState('aptitude'); // UI Tab State

  const [formState, setFormState] = useState({
      title: '', 
      schedule: { start: '', end: '' }, 
      targetYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'], 
      category: 'aptitude', 
      quizType: 'weekly', 
      durationHours: 1, 
      durationMinutes: 0
  });
  const [questions, setQuestions] = useState([]);

  // --- AUTH & SCOPE CHECK ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { 
        if(setIsAuth) setIsAuth(false); 
        navigate('/login', { replace: true }); 
        return;
    }
    
    // Decode Token to get Scope
    try {
        // Simple JWT decode (payload is the second part)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const scope = payload.scope || 'all';
        setAdminScope(scope);
        
        // Force active tab if admin is restricted
        if (scope === 'aptitude') setActiveQuizTab('aptitude');
        if (scope === 'coding') setActiveQuizTab('coding');
        
    } catch (e) { 
        console.error("Invalid Token");
        localStorage.clear(); 
        if(setIsAuth) setIsAuth(false); 
        navigate('/login'); 
    }
  }, [navigate, setIsAuth]);

  // --- DATA FETCHING ---
  const fetchQuizzes = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/admin/my-quizzes`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setQuizzes(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchBatches = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/admin/batches`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBatches(res.data);
    } catch (e) { toast.error("Failed to load groups"); }
  };

  useEffect(() => { 
      if (view === 'quizzes' || view === 'editor') fetchQuizzes(); 
      if (view === 'batches') fetchBatches();
  }, [view]);

  // --- GLOBAL HANDLERS ---
  const handleLogout = () => { 
      localStorage.clear(); 
      sessionStorage.clear(); 
      if(setIsAuth) setIsAuth(false); 
      navigate('/login', { replace: true }); 
  };

  // --- QUIZ HANDLERS ---
  const handleCreateNew = () => {
      setEditingId(null); 
      
      // Determine Category: Use admin scope if restricted, otherwise use active tab
      let category = activeQuizTab;
      if (adminScope !== 'all') category = adminScope;

      setFormState({ 
          title: '', 
          schedule: { start: '', end: '' }, 
          targetYears: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'], 
          category: category, 
          quizType: 'weekly', 
          durationHours: 1, 
          durationMinutes: 0 
      });
      setQuestions([{ id: Date.now(), type: 'mcq', text: '**New Question**', marks: 5, options: [{text:'', image: ''}, {text:'', image: ''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}] }]);
      setPreviewMode(false); 
      setView('editor');
  };

  const handleEditQuiz = async (id) => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/quiz-details/${id}`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = res.data;
        setEditingId(data.id);
        const totalMins = data.duration || 60;
        setFormState({
            title: data.title, 
            schedule: data.schedule || { start: '', end: '' }, 
            targetYears: data.targetYears || ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
            category: data.category || 'aptitude', 
            quizType: data.quizType || 'weekly', 
            durationHours: Math.floor(totalMins / 60), 
            durationMinutes: totalMins % 60
        });
        setQuestions(data.questions);
        setPreviewMode(false); 
        setView('editor');
      } catch(e) { toast.error("Error loading quiz"); }
  };
  
  const handleDeleteQuiz = async (id) => { 
      try {
          await axios.delete(`${API_URL}/api/quizzes/${id}`, { 
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          toast.success("Deleted"); 
          fetchQuizzes(); 
      } catch (e) {
          toast.error("Delete Failed: " + (e.response?.data?.error || "Server Error"));
      }
  };
  
  const handleSaveQuiz = async () => {
    if(!formState.title.trim()) return toast.error("Title required");
    if(questions.length === 0) return toast.error("Add questions");
    if (formState.quizType !== 'mock' && (!formState.schedule.start || !formState.schedule.end)) return toast.error("Schedule required for Weekly tests");
    
    const quizId = editingId || `${formState.title.trim().replace(/\s+/g, '-')}-${Date.now()}`;
    const totalDuration = (parseInt(formState.durationHours) * 60) + parseInt(formState.durationMinutes);
    
    // SAFETY: Ensure category is set before saving
    let finalCategory = formState.category;
    if (!finalCategory) finalCategory = adminScope !== 'all' ? adminScope : activeQuizTab;

    try {
        await axios.post(`${API_URL}/api/quizzes`, { 
            id: quizId, 
            ...formState, 
            category: finalCategory, // Explicitly set category
            schedule: formState.quizType === 'mock' ? { start: null, end: null } : formState.schedule, 
            questions, 
            createdBy: 'Admin', 
            duration: totalDuration 
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        
        toast.success("Saved"); 
        setView('quizzes');
        fetchQuizzes(); // Refresh list immediately
    } catch (e) { 
        toast.error("Save failed: " + (e.response?.data?.error || "Check console")); 
        console.error(e);
    }
  };

  const handleQuizJsonUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const load = toast.loading("Processing Import...");
          try {
              const parsedData = JSON.parse(event.target.result);
              
              const uploadOneQuiz = async (quizData) => {
                  if (!quizData.title || !quizData.questions) throw new Error(`Invalid Quiz: ${quizData.title}`);
                  if (!quizData.id) quizData.id = `${quizData.title.trim().replace(/\s+/g, '-')}-${Date.now()}`;
                  
                  // Force category if admin is restricted
                  if (adminScope !== 'all') quizData.category = adminScope;
                  else if (!quizData.category) quizData.category = activeQuizTab;

                  await axios.post(`${API_URL}/api/quizzes`, quizData, { 
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
                  });
              };

              if (Array.isArray(parsedData)) {
                  for (const quiz of parsedData) await uploadOneQuiz(quiz);
                  toast.success(`Bulk Import Successful`);
              } else {
                  await uploadOneQuiz(parsedData);
                  toast.success("Quiz Imported Successfully");
              }
              fetchQuizzes();
          } catch (error) {
              toast.error("Invalid JSON File");
          } finally {
              toast.dismiss(load);
          }
      };
      reader.readAsText(file);
      e.target.value = null;
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const load = toast.loading("Parsing PDF...");
    try {
        const res = await axios.post(`${API_URL}/api/generate-quiz`, formData, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.success) { 
            setQuestions([...questions, ...res.data.questions]); 
            toast.success(`Added ${res.data.questions.length} questions`); 
        }
    } catch (err) { toast.error("PDF Parse Failed"); } finally { toast.dismiss(load); }
  };

  // --- STUDENT HANDLERS ---
  const handleStudentUpload = async (e, category) => {
    const file = e.target.files[0]; if (!file) return;
    
    // Fallback logic for category
    let targetCategory = category || activeQuizTab;
    if (adminScope !== 'all') targetCategory = adminScope;

    const formData = new FormData(); 
    // IMPORTANT: Append category BEFORE file
    formData.append('category', targetCategory); 
    formData.append('file', file);

    const load = toast.loading(`Uploading to ${targetCategory}...`);
    try { 
        await axios.post(`${API_URL}/api/admin/upload-students`, formData, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }); 
        toast.success("Uploaded Batch"); 
        fetchBatches(); 
    } catch (err) { 
        console.error(err);
        toast.error("Upload Failed: " + (err.response?.data?.error || "Server Error")); 
    } finally { toast.dismiss(load); }
  };
  
  const fetchBatchStudents = async (batchId, batchName) => {
    const load = toast.loading("Loading Students...");
    try {
        const res = await axios.get(`${API_URL}/api/admin/batches/${batchId}/students`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBatchStudents(res.data); 
        setSelectedBatch({ id: batchId, name: batchName }); 
        setView('batch-list');
    } catch (e) { toast.error("Failed to load list"); } finally { toast.dismiss(load); }
  };
  
  const fetchStudentProfile = async (student) => {
    const load = toast.loading("Fetching Stats...");
    try {
        const res = await axios.get(`${API_URL}/api/admin/student-stats/${student.prn}`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudentStats(res.data); 
        setSelectedStudent(student); 
        setView('student-profile');
    } catch (e) { toast.error("Failed to load profile"); } finally { toast.dismiss(load); }
  };
  
  const handleDeleteBatch = async (batchId) => { 
      if(window.confirm("Delete ENTIRE group?")) { 
          await axios.delete(`${API_URL}/api/admin/batches/${batchId}`, { 
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }); 
          toast.success("Group Deleted"); 
          fetchBatches(); 
      }
  };
  
  const handleDeleteStudent = async (studentId) => { 
      if(window.confirm("Delete student?")) { 
          await axios.delete(`${API_URL}/api/admin/students/${studentId}`, { 
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }); 
          toast.success("Student Deleted"); 
          setBatchStudents(prev => prev.filter(s => s._id !== studentId)); 
      }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 pb-32 text-slate-100 font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 2500, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
      
      <AdminNavbar view={view} setView={setView} handleLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* VIEW: QUIZZES */}
        {view === 'quizzes' && (
            <QuizList 
                quizzes={quizzes} 
                onCreateNew={handleCreateNew} 
                onEditQuiz={handleEditQuiz} 
                onDeleteQuiz={handleDeleteQuiz} 
                onImportJson={handleQuizJsonUpload}
                // Pass State Down
                activeCategory={activeQuizTab}
                setActiveCategory={setActiveQuizTab}
                // Pass Admin Scope (Optional: to hide tabs if needed in child)
                adminScope={adminScope}
            />
        )}
        
        {/* VIEW: BATCHES */}
        {view === 'batches' && (
            <BatchList 
                batches={batches} 
                onUpload={handleStudentUpload} 
                onSelectBatch={fetchBatchStudents} 
                onDeleteBatch={handleDeleteBatch} 
            />
        )}
        
        {/* VIEW: DRILL DOWNS */}
        {view === 'batch-list' && selectedBatch && (
            <StudentList 
                batchName={selectedBatch.name} 
                students={batchStudents} 
                onBack={()=>setView('batches')} 
                onSelectStudent={fetchStudentProfile} 
                onDeleteStudent={handleDeleteStudent} 
            />
        )}
        
        {view === 'student-profile' && selectedStudent && studentStats && (
            <StudentProfile 
                student={selectedStudent} 
                stats={studentStats} 
                onBack={()=>setView('batch-list')} 
            />
        )}
        
        {/* VIEW: MATERIALS */}
        {view === 'materials' && <StudyMaterials />}
        
        {/* VIEW: SETTINGS */}
        {view === 'settings' && <AdminManager API_URL={API_URL} />}
        
        {/* VIEW: QUIZ EDITOR */}
        {view === 'editor' && !previewMode && (
            <QuizEditor 
                formState={formState} setFormState={setFormState}
                questions={questions} setQuestions={setQuestions}
                onBack={()=>setView('quizzes')} onSave={handleSaveQuiz}
                previewMode={previewMode} setPreviewMode={setPreviewMode}
                handlePdfUpload={handlePdfUpload} API_URL={API_URL}
            />
        )}
        
        {/* VIEW: PREVIEW */}
        {view === 'editor' && previewMode && (
          <div className="animate-in fade-in duration-300 pb-20">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={()=>setPreviewMode(false)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back Editor</button>
                 <span className="px-3 py-1 bg-purple-900/50 text-purple-200 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-500/30">Student Preview</span>
            </div>
             <div className="text-center mt-12 text-slate-500">Preview Mode Active</div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminPanel;