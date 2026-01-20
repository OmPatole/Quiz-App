import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import MDEditor from '@uiw/react-md-editor';
import toast, { Toaster } from 'react-hot-toast'; 
import { User, ShieldBan, Play, Code, AlertCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:3001'; 
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- SHUFFLE ---
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    if(!quizId) return;
    axios.get(`${API_URL}/api/quizzes/${quizId}`)
      .then(res => { 
          const data = res.data;
          // Shuffle questions on client so every student sees different order
          if (data.questions && data.questions.length > 0) {
              data.questions = shuffleArray([...data.questions]);
          }
          setQuizData(data); 
          setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [quizId]);

  useEffect(() => { 
      const s = localStorage.getItem('quiz_student_info'); 
      if (s) try { setInfo(JSON.parse(s)); } catch(e) {} 
  }, []);

  const handleStart = async () => {
    if (!info.name || !info.year || !info.prn) return toast.error("Please fill all details.");
    
    if (quizData.targetYears && quizData.targetYears.length > 0 && !quizData.targetYears.includes(info.year)) {
        return toast.error(`Access Denied: Restricted to ${quizData.targetYears.join(', ')} students.`);
    }

    localStorage.setItem('quiz_student_info', JSON.stringify(info));
    try {
        const check = await axios.post(`${API_URL}/api/check-attempt`, { quizId, prn: info.prn });
        if (check.data.attempted) { setAlreadyAttempted(true); return; }
        
        if (quizData.quizType !== 'mock' && containerRef.current && document.documentElement.requestFullscreen && !isMobile()) {
            await containerRef.current.requestFullscreen();
        } 
        
        if (quizData.duration) {
            setTimeLeft(quizData.duration * 60);
        }

        setStarted(true); 
    } catch (err) { toast.error("Could not enter fullscreen mode."); }
  };

  useEffect(() => {
      if (!started || isSubmitted) return;
      if (timeLeft <= 0 && quizData.quizType !== 'mock' && quizData.duration > 0) {
          submitQuiz("Time Limit Exceeded");
          return;
      }
      if(quizData.duration > 0) {
          const timer = setInterval(() => { setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)); }, 1000);
          return () => clearInterval(timer);
      }
  }, [started, timeLeft, isSubmitted]);

  const submitQuiz = async (statusOverride = 'Completed') => {
    if (isSubmitted) return; setIsSubmitted(true);
    
    // --- SECURITY FIX: Send Raw Answers, Not Score ---
    const payload = {
        quizId: quizData.id,
        studentName: info.name,
        year: info.year,
        prn: info.prn,
        userAnswers: answers, // The server will calculate the score
        status: statusOverride
    };

    try {
      await axios.post(`${API_URL}/api/submit-score`, payload);
      if(document.fullscreenElement) await document.exitFullscreen();
      navigate(`/leaderboard/${quizData.id}`);
    } catch (e) { toast.error("Submission failed"); }
  };

  useEffect(() => {
    if (!started || violation || isSubmitted) return;
    if (quizData.quizType === 'mock') return;

    const handleFull = () => { if (!document.fullscreenElement && !isSubmitted && !isMobile()) { setViolation(true); submitQuiz("Terminated: Exited Fullscreen"); }};
    const handleVis = () => { if (document.hidden && !isSubmitted) { setViolation(true); submitQuiz("Terminated: Switched Tab"); }};
    
    document.addEventListener('fullscreenchange', handleFull); 
    document.addEventListener('visibilitychange', handleVis);
    return () => { document.removeEventListener('fullscreenchange', handleFull); document.removeEventListener('visibilitychange', handleVis); };
  }, [started, violation, isSubmitted]);

  const runCode = async () => {
    const q = quizData.questions[currentQ];
    const lang = answers[currentQ]?.language || 'python';
    const code = answers[currentQ]?.code || '';
    setIsRunning(true); setTestResults(null);
    let resultsArray = []; let allPassed = true;
    for (let i = 0; i < q.testCases.length; i++) {
        try {
            const res = await axios.post(`${API_URL}/api/run-code`, { language: lang, sourceCode: code, input: q.testCases[i].input });
            const passed = (res.data.run.stdout || "").trim() === q.testCases[i].output.trim();
            if (!passed) allPassed = false;
            resultsArray.push({ status: passed ? 'Passed' : 'Failed', output: res.data.run.stdout, ...q.testCases[i] });
        } catch (e) { allPassed = false; resultsArray.push({ status: 'Error', error: 'Run Failed', ...q.testCases[i] }); }
    }
    setTestResults(resultsArray);
    setAnswers({ ...answers, [currentQ]: { ...answers[currentQ], passed: allPassed, code, language: lang }});
    setIsRunning(false);
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (alreadyAttempted) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white"><ShieldBan size={64} className="text-red-500 mb-4"/><h1 className="text-2xl font-bold">Access Denied</h1><button onClick={()=>navigate('/leaderboard/'+quizId)} className="mt-6 px-6 py-2 bg-purple-600 rounded">View Rank</button></div>;
  if (violation) return <div className="h-screen bg-red-950 flex items-center justify-center text-red-200 text-3xl font-bold">TERMINATED</div>;
  
  if (!started) return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <Toaster position="top-right" toastOptions={{ duration: 2000, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h1 className="text-3xl font-black text-center mb-8 text-white">{quizData?.title}</h1>
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                    <User size={14}/> Candidate Details
                </h3>
                <div className="space-y-4">
                    <div><span className="text-xs text-slate-500 block mb-1">Name</span><div className="font-bold text-white text-lg">{info.name}</div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-xs text-slate-500 block mb-1">Year</span><div className="font-bold text-white">{info.year}</div></div>
                        <div><span className="text-xs text-slate-500 block mb-1">PRN</span><div className="font-bold text-white font-mono">{info.prn}</div></div>
                    </div>
                </div>
            </div>
            
            <div className="mb-8 p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2"><span>Quiz Type</span><span className={`font-bold uppercase ${quizData.quizType === 'mock' ? 'text-blue-400' : 'text-green-400'}`}>{quizData.quizType}</span></div>
                <div className="flex justify-between pt-1"><span>Restrictions</span>{quizData.quizType === 'mock' ? <span className="text-blue-400 font-bold">None</span> : <span className="text-white font-bold">{quizData.duration} Mins • Fullscreen</span>}</div>
            </div>

            <button onClick={handleStart} className="w-full py-4 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-900/20 transform active:scale-95 flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> Start Quiz
            </button>
        </div>
    </div>
  );

  const q = quizData.questions[currentQ];
  const processedMarkdown = q.text ? q.text.replace(/\]\(\/uploads\//g, `](${API_URL}/uploads/`) : '';

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
       <Toaster position="top-right" toastOptions={{ duration: 2000, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }}/>
       <header className="h-16 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6 shrink-0 z-20">
         <div className="flex items-center gap-4">
             <div className="font-bold text-purple-400">{quizData?.title}</div>
             {quizData.duration > 0 && (
                 <div className={`flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-sm ${timeLeft < 60 && quizData.quizType !== 'mock' ? 'text-red-500 animate-pulse border-red-900/50' : 'text-slate-300'}`}>
                     <Clock size={14}/> {formatTime(timeLeft)}
                 </div>
             )}
             {quizData.quizType === 'mock' && <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-800">PRACTICE MODE</span>}
         </div>
         <div className="flex items-center gap-2 bg-slate-800 py-1 px-3 rounded-full text-sm"><User size={14}/> {info.name}</div>
       </header>
       <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col p-6 overflow-y-auto ${q.type === 'code' ? 'w-1/2 border-r border-slate-800' : 'max-w-3xl mx-auto w-full'}`}>
               <div className="mb-4 text-white" data-color-mode="dark"><span className="text-purple-400 font-bold text-lg mr-2">Q{currentQ+1}.</span><MDEditor.Markdown source={processedMarkdown} style={{ backgroundColor: 'transparent', color: '#e2e8f0' }} /></div>
               {q.type === 'mcq' && (<div className="space-y-4 mt-4">{q.options.map((opt, i) => (<button key={i} onClick={() => {const curr = answers[currentQ]?.selectedIndices || []; const newSel = q.isMultiSelect ? (curr.includes(i) ? curr.filter(x=>x!==i) : [...curr, i]) : [i]; setAnswers({...answers, [currentQ]: {...answers[currentQ], selectedIndices: newSel}});}} className={`w-full p-4 text-left rounded-xl border transition-all flex items-start gap-4 group ${answers[currentQ]?.selectedIndices?.includes(i) ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}><div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[currentQ]?.selectedIndices?.includes(i) ? 'border-purple-500 bg-purple-500' : 'border-slate-600 group-hover:border-slate-400'}`}>{answers[currentQ]?.selectedIndices?.includes(i) && <div className="w-2 h-2 bg-white rounded-full" />}</div><div className="flex-1">{opt.image && <img src={getImageUrl(opt.image)} className="mb-2 h-32 rounded object-contain"/>}<div className="text-slate-200">{opt.text}</div></div></button>))}</div>)}
          </div>
          {q.type === 'code' && (
              <div className="w-1/2 flex flex-col bg-slate-900">
                  <div className="h-12 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-4"><select className="bg-slate-900 text-xs font-bold text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none" value={answers[currentQ]?.language || 'python'} onChange={e => setAnswers({...answers, [currentQ]: { ...answers[currentQ], language: e.target.value }})}><option value="python">Python 3</option><option value="javascript">JavaScript</option><option value="c">C</option><option value="cpp">C++</option><option value="java">Java</option></select><button onClick={runCode} disabled={isRunning} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded">Run Code</button></div>
                  <div className="flex-1"><Editor height="100%" theme="vs-dark" language={answers[currentQ]?.language || 'python'} value={answers[currentQ]?.code || ''} onChange={v => setAnswers({...answers, [currentQ]: {...answers[currentQ], code: v}})} /></div>
                  <div className="h-48 bg-slate-950 border-t border-slate-800 p-4 font-mono text-xs overflow-auto">{testResults ? testResults.map((r, i) => <div key={i} className={r.status==='Passed'?'text-green-400':'text-red-400'}>Case {i+1}: {r.status}</div>) : "Run code to see results"}</div>
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