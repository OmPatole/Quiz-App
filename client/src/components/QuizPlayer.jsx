import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import MDEditor from '@uiw/react-md-editor';
import toast, { Toaster } from 'react-hot-toast'; // NEW
import { User, ShieldBan, Play, Code, AlertCircle } from 'lucide-react';

const QuizPlayer = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [info, setInfo] = useState({ name: '', year: '', prn: '' });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [violation, setViolation] = useState(false);
  const [containerRef] = useState(useRef(null));

  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if(!quizId) return;
    axios.get(`http://localhost:3001/api/quizzes/${quizId}`)
      .then(res => { setQuizData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [quizId]);

  useEffect(() => { const s = localStorage.getItem('quiz_student_info'); if (s) try { setInfo(JSON.parse(s)); } catch(e) {} }, []);

  const handleStart = async () => {
    if (!info.name || !info.year || !info.prn) return toast.error("Please fill all details.");
    if (info.name.trim().split(/\s+/).length !== 2) return toast.error("Enter First & Last Name.");
    if (info.prn.length !== 10) return toast.error("PRN must be 10 digits.");

    localStorage.setItem('quiz_student_info', JSON.stringify(info));
    try {
        const check = await axios.post('http://localhost:3001/api/check-attempt', { quizId, prn: info.prn });
        if (check.data.attempted) { setAlreadyAttempted(true); return; }
        if (containerRef.current) await containerRef.current.requestFullscreen(); 
        setStarted(true); 
    } catch (err) { toast.error("Fullscreen required to start!"); }
  };

  const submitQuiz = async (statusOverride = 'Completed') => {
    if (isSubmitted) return; setIsSubmitted(true);
    let score = 0; let totalMarks = 0;
    
    if (quizData && quizData.questions) {
        quizData.questions.forEach((q, idx) => {
          totalMarks += parseInt(q.marks || 0);
          const ans = answers[idx];
          if (q.type === 'mcq' && ans?.selectedIndices) { if (ans.selectedIndices.slice().sort().join(',') === q.correctIndices.slice().sort().join(',')) score += parseInt(q.marks); } 
          else if (q.type === 'code' && ans?.passed) score += parseInt(q.marks);
        });
    }

    try {
      await axios.post('http://localhost:3001/api/submit-score', { quizId: quizData.id, studentName: info.name, year: info.year, prn: info.prn, score, totalMarks, status: statusOverride });
      if(document.fullscreenElement) await document.exitFullscreen();
      navigate(`/leaderboard/${quizData.id}`);
    } catch (e) { toast.error("Error submitting quiz"); }
  };

  useEffect(() => {
    if (!started || violation || isSubmitted) return;
    const handleFull = () => { if (!document.fullscreenElement && !isSubmitted) { setViolation(true); submitQuiz("Terminated: Exited Fullscreen"); }};
    const handleVis = () => { if (document.hidden && !isSubmitted) { setViolation(true); submitQuiz("Terminated: Switched Tab"); }};
    document.addEventListener('fullscreenchange', handleFull); document.addEventListener('visibilitychange', handleVis);
    return () => { document.removeEventListener('fullscreenchange', handleFull); document.removeEventListener('visibilitychange', handleVis); };
  }, [started, violation, isSubmitted]);

  const runCode = async () => {
    const q = quizData.questions[currentQ];
    const lang = answers[currentQ]?.language || 'python';
    const code = answers[currentQ]?.code || '';
    setIsRunning(true); setTestResults(null);
    let resultsArray = []; let allPassed = true;

    for (let i = 0; i < q.testCases.length; i++) {
        const tc = q.testCases[i];
        try {
            const res = await axios.post('http://localhost:3001/api/run-code', { language: lang, sourceCode: code, input: tc.input });
            const userOutput = res.data.run.stdout ? res.data.run.stdout.trim() : "";
            const passed = userOutput === tc.output.trim();
            if (!passed) allPassed = false;
            resultsArray.push({ status: passed ? 'Passed' : 'Failed', input: tc.input, expected: tc.output, output: userOutput, error: null });
        } catch (e) {
            allPassed = false;
            resultsArray.push({ status: 'Error', input: tc.input, expected: tc.output, output: null, error: 'Execution Error' });
        }
    }
    setTestResults(resultsArray);
    setAnswers({ ...answers, [currentQ]: { ...answers[currentQ], passed: allPassed, code, language: lang }});
    setIsRunning(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (alreadyAttempted) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white"><ShieldBan size={64} className="text-red-500 mb-4"/><h1 className="text-2xl font-bold">Access Denied</h1><button onClick={()=>navigate('/leaderboard/'+quizId)} className="mt-6 px-6 py-2 bg-purple-600 rounded">View Rank</button></div>;
  if (violation) return <div className="h-screen bg-red-950 flex items-center justify-center text-red-200 text-3xl font-bold">TERMINATED</div>;

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
            <AlertCircle size={48} className="text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Empty Quiz</h2>
            <p>This quiz has no questions yet.</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 rounded text-white hover:bg-slate-700">Go Home</button>
        </div>
    );
  }

  if (!started) return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <h1 className="text-2xl font-bold text-center mb-6">{quizData.title}</h1>
            <div className="space-y-4 mb-6">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded text-white" value={info.name} onChange={e=>{if(/^[A-Za-z\s]*$/.test(e.target.value)) setInfo({...info, name:e.target.value})}} placeholder="Full Name" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Year</label><select className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded text-white" value={info.year} onChange={e=>setInfo({...info,year:e.target.value})}><option value="">Select</option><option value="FY">FY</option><option value="SY">SY</option><option value="TY">TY</option><option value="BE">BE</option></select></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">PRN</label><input className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded text-white" value={info.prn} onChange={e=>{if(/^[0-9]*$/.test(e.target.value)&&e.target.value.length<=10) setInfo({...info,prn:e.target.value})}} placeholder="10 Digits" /></div>
                </div>
            </div>
            <button onClick={handleStart} className="w-full py-4 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition">Join Quiz</button>
        </div>
    </div>
  );

  const q = quizData.questions[currentQ];
  const isLast = currentQ === quizData.questions.length - 1;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
       {/* Toaster for potential errors during quiz */}
       <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
       
       <header className="h-16 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6 shrink-0 z-20">
         <div className="font-bold text-purple-400">{quizData.title}</div>
         <div className="flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-full text-sm"><User size={14}/> {info.name}</div>
       </header>
       
       <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col p-6 overflow-y-auto ${q.type === 'code' ? 'w-1/2 border-r border-slate-800' : 'max-w-3xl mx-auto w-full'}`}>
               <div className="mb-4 text-white" data-color-mode="dark">
                   <span className="text-purple-400 font-bold text-lg mr-2">Q{currentQ+1}.</span>
                   <MDEditor.Markdown source={q.text} style={{ backgroundColor: 'transparent', color: '#e2e8f0' }} />
               </div>
               {q.type === 'mcq' && (
                   <div className="space-y-4 mt-4">
                       {q.options.map((opt, i) => (
                           <button key={i} onClick={() => {
                               const curr = answers[currentQ]?.selectedIndices || [];
                               const newSel = q.isMultiSelect ? (curr.includes(i) ? curr.filter(x=>x!==i) : [...curr, i]) : [i];
                               setAnswers({...answers, [currentQ]: {...answers[currentQ], selectedIndices: newSel}});
                           }} className={`w-full p-4 text-left rounded-xl border transition-all flex items-start gap-4 group ${answers[currentQ]?.selectedIndices?.includes(i) ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                               <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentQ]?.selectedIndices?.includes(i) ? 'border-purple-500 bg-purple-500' : 'border-slate-600 group-hover:border-slate-400'}`}>{answers[currentQ]?.selectedIndices?.includes(i) && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                               <div className="flex-1">{opt.image && (<img src={opt.image} alt="option" className="mb-3 rounded-lg border border-slate-700 max-h-48 object-contain" />)}<div className="text-slate-200">{opt.text}</div></div>
                           </button>
                       ))}
                   </div>
               )}
          </div>

          {q.type === 'code' && (
              <div className="w-1/2 flex flex-col bg-slate-900">
                  <div className="h-12 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-4">
                      <div className="flex items-center gap-2">
                          <Code size={14} className="text-slate-500" />
                          <select className="bg-slate-900 text-xs font-bold text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none hover:border-slate-500 transition" value={answers[currentQ]?.language || 'python'} onChange={e => setAnswers({...answers, [currentQ]: { ...answers[currentQ], language: e.target.value }})}>
                              <option value="python">Python 3</option>
                              <option value="javascript">JavaScript (Node)</option>
                              <option value="c">C</option>
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                          </select>
                      </div>
                      <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition">
                          {isRunning ? 'Running...' : <><Play size={12} fill="currentColor"/> Run Code</>}
                      </button>
                  </div>

                  <div className="flex-1">
                      <Editor height="100%" theme="vs-dark" language={answers[currentQ]?.language || 'python'} value={answers[currentQ]?.code || ''} onChange={v => setAnswers({...answers, [currentQ]: {...answers[currentQ], code: v}})} />
                  </div>

                  <div className="h-64 bg-slate-950 border-t border-slate-800 flex flex-col">
                      <div className="flex border-b border-slate-800 overflow-x-auto">
                          {q.testCases.map((_, idx) => (
                              <button key={idx} onClick={() => setActiveTab(idx)} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-r border-slate-800 transition ${activeTab === idx ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-900/50'}`}>
                                  <div className={`w-2 h-2 rounded-full ${!testResults ? 'bg-slate-600' : (testResults[idx]?.status === 'Passed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]')}`}></div> Case {idx + 1}
                              </button>
                          ))}
                      </div>

                      <div className="p-4 overflow-y-auto font-mono text-sm flex-1">
                          <div className="mb-4"><span className="text-xs text-slate-500 font-bold block mb-1">Input =</span><div className="bg-slate-900 p-2 rounded text-slate-300">{q.testCases[activeTab].input}</div></div>
                          <div className="mb-4"><span className="text-xs text-slate-500 font-bold block mb-1">Expected Output =</span><div className="bg-slate-900 p-2 rounded text-slate-300">{q.testCases[activeTab].output}</div></div>
                          {testResults && testResults[activeTab] && (
                              <div>
                                  <span className={`text-xs font-bold block mb-1 ${testResults[activeTab].status === 'Passed' ? 'text-green-500' : 'text-red-500'}`}>{testResults[activeTab].status === 'Error' ? 'Error Message =' : 'Your Output ='}</span>
                                  <div className={`p-2 rounded ${testResults[activeTab].status === 'Passed' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>{testResults[activeTab].output || testResults[activeTab].error || "No Output"}</div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
       </div>

       <footer className="h-16 bg-slate-900 border-t border-slate-800 flex justify-between items-center px-6 shrink-0">
          <button disabled={currentQ===0} onClick={()=>setCurrentQ(c=>c-1)} className="text-slate-400">Prev</button>
          {isLast ? <button onClick={()=>submitQuiz()} className="bg-purple-600 px-6 py-2 rounded text-white font-bold">Submit</button> : <button onClick={()=>setCurrentQ(c=>c+1)} className="bg-slate-800 px-6 py-2 rounded text-white">Next</button>}
       </footer>
    </div>
  );
};
export default QuizPlayer;