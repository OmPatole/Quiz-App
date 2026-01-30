import React, { useCallback } from 'react';
import { ArrowLeft, Plus, FileUp, Eye, Clock, CheckCircle } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import toast from 'react-hot-toast'; // Ensure toast is imported
import axios from 'axios'; // Ensure axios is imported

const QuizEditor = ({ 
    formState, setFormState, 
    questions, setQuestions, 
    onBack, onSave, 
    previewMode, setPreviewMode, 
    handlePdfUpload, API_URL 
}) => {

  // --- STABLE UPDATER ---
  const handleQuestionUpdate = useCallback((index, field, value) => {
      setQuestions(prevQuestions => {
          if (!prevQuestions || !prevQuestions[index]) return prevQuestions;
          const updatedList = [...prevQuestions];
          updatedList[index] = { ...updatedList[index], [field]: value };
          return updatedList;
      });
  }, [setQuestions]);

  const handleQuestionDelete = useCallback((index) => {
      setQuestions(prev => prev.filter((_, i) => i !== index));
  }, [setQuestions]);

  // --- VALIDATION & SAVE HANDLER ---
  const handleSaveWrapper = useCallback(async () => {
    // 1. Basic Quiz Info Validation
    if(!formState.title.trim()) return toast.error("Quiz Title is required");
    if(questions.length === 0) return toast.error("Please add at least one question");

    // 2. Deep Question Validation
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Strip HTML tags to check if the question is truly empty
        const strippedText = q.text ? q.text.replace(/<[^>]*>/g, '').trim() : '';
        const hasImage = !!q.image;

        // Fail if both text and image are missing
        if (!strippedText && !hasImage) {
            return toast.error(`Question ${i + 1} is empty! Please add text or an image.`);
        }

        if (q.type === 'mcq') {
             // Check Option Count
             if (!q.options || q.options.length < 2) {
                 return toast.error(`Question ${i + 1}: Needs at least 2 options.`);
             }
             
             // Check Empty Options
             for (let j = 0; j < q.options.length; j++) {
                 const opt = q.options[j];
                 if (!opt.text.trim() && !opt.image) {
                     return toast.error(`Question ${i + 1}: Option ${j + 1} cannot be empty.`);
                 }
             }
             
             // Check Correct Answer Selection
             if (!q.correctIndices || q.correctIndices.length === 0) {
                 return toast.error(`Question ${i + 1}: Please mark the correct answer.`);
             }
        }
    }

    // 3. Schedule Validation (Only for Weekly tests)
    if (formState.quizType !== 'mock' && (!formState.schedule.start || !formState.schedule.end)) {
        return toast.error("Schedule (Start/End Time) is required for Weekly tests");
    }
    
    // 4. Proceed to Save if all checks pass
    onSave();

  }, [formState, questions, onSave]);


  const YEAR_OPTIONS = [
      { label: 'FY', value: 'First Year' },
      { label: 'SY', value: 'Second Year' },
      { label: 'TY', value: 'Third Year' },
      { label: 'BE', value: 'Fourth Year' }
  ];

  // --- RENDER ---
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex justify-between items-center mb-6">
           <button type="button" onClick={previewMode ? () => setPreviewMode(false) : onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold">
                <ArrowLeft size={16}/> {previewMode ? 'Back to Editor' : 'Back'}
           </button>
           
           {!previewMode && (
               <div className="flex gap-2">
                  <button type="button" onClick={() => setPreviewMode(true)} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition">
                    <Eye size={14}/> Preview
                  </button>
                  <button type="button" onClick={handleSaveWrapper} className="px-6 py-2 bg-purple-600 rounded-lg text-sm font-bold text-white shadow-lg hover:bg-purple-700 transition">
                    Save Quiz
                  </button>
               </div>
           )}
      </div>
      
      {/* ================= PREVIEW MODE ================= */}
      {previewMode ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">{formState.title || 'Untitled Quiz'}</h1>
                  <div className="flex justify-center gap-4 text-slate-400 text-sm">
                      <span>{formState.durationHours}h {formState.durationMinutes}m</span>
                      <span>•</span>
                      <span>{questions.length} Questions</span>
                  </div>
              </div>

              {questions.map((q, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                      <div className="flex justify-between mb-4">
                          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Question {i + 1}</span>
                          <span className="text-slate-500 font-bold text-xs">{q.marks} Marks</span>
                      </div>
                      
                      {/* Question Content */}
                      <div className="mb-6 space-y-4">
                          {q.image && (
                              <img src={q.image} alt="Question" className="max-h-64 rounded-xl border border-slate-700 object-contain" />
                          )}
                          <div 
                            className="text-lg text-slate-200 prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: q.text }}
                          />
                      </div>

                      <div className="space-y-3">
                          {q.options?.map((opt, optIndex) => (
                              <div key={optIndex} className={`p-4 rounded-xl border flex items-center gap-4 ${q.correctIndices?.includes(optIndex) ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${q.correctIndices?.includes(optIndex) ? 'border-green-500 text-green-500' : 'border-slate-600 text-slate-600'}`}>
                                      {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <div className="flex-1">
                                      {opt.image && <img src={opt.image} alt="opt" className="h-20 mb-2 rounded border border-slate-700"/>}
                                      <span className="text-slate-300">{opt.text}</span>
                                  </div>
                                  {q.correctIndices?.includes(optIndex) && <CheckCircle size={16} className="ml-auto text-green-500"/>}
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      ) : (
        /* ================= EDITOR MODE ================= */
        <>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-6 shadow-xl">
                 <div className="flex gap-4 items-start">
                    <div className="flex-1">
                        <input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-lg font-medium outline-none focus:border-purple-500 transition" placeholder="Enter Quiz Title..." value={formState.title} onChange={e => setFormState(prev => ({...prev, title: e.target.value}))} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Type</label>
                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                {['weekly', 'mock'].map(t => (
                                    <button key={t} type="button" onClick={() => setFormState(prev => ({ ...prev, quizType: t }))} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition ${formState.quizType === t ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6 col-span-2">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Duration (HH : MM)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input type="number" min="0" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={formState.durationHours} onChange={e => setFormState(prev => ({ ...prev, durationHours: e.target.value }))} />
                                </div>
                                <span className="text-slate-600 font-bold py-2">:</span>
                                <div className="relative flex-1">
                                    <input type="number" min="0" max="59" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={formState.durationMinutes} onChange={e => setFormState(prev => ({ ...prev, durationMinutes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Target Audience</label>
                        <div className="flex gap-2">
                            {YEAR_OPTIONS.map(opt => (
                                <button key={opt.value} type="button" onClick={() => setFormState(prev => ({...prev, targetYears: prev.targetYears.includes(opt.value) ? prev.targetYears.filter(y => y !== opt.value) : [...prev.targetYears, opt.value]}))} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${formState.targetYears.includes(opt.value) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>
                </div>

                {formState.quizType === 'weekly' && (
                    <div className="mt-6 border-t border-slate-800 pt-6 animate-in fade-in">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-purple-500"/> Quiz Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed">
                            <div className="relative group">
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Start Time</label>
                                <input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={formState.schedule.start || ''} onChange={e => setFormState(prev => ({...prev, schedule: {...prev.schedule, start: e.target.value}}))} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                            </div>
                            <div className="relative group">
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">End Time</label>
                                <input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={formState.schedule.end || ''} onChange={e => setFormState(prev => ({...prev, schedule: {...prev.schedule, end: e.target.value}}))} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {questions.map((q, index) => {
                    if (!q) return null;
                    return (
                        <QuestionEditor 
                            key={q.id || index}
                            question={q}
                            qIndex={index}
                            onUpdate={handleQuestionUpdate}
                            onDelete={handleQuestionDelete}
                            API_URL={API_URL}
                        />
                    );
                })}
            </div>

            <div className="flex gap-4 mb-20 mt-8">
                <button type="button" onClick={() => setQuestions(prev => [...prev, { id: Date.now(), type: 'mcq', text: '', marks: 5, options: [{text:'', image:''}, {text:'', image:''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}] }])} className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-purple-400 font-bold flex justify-center gap-2 transition hover:border-purple-500/50 hover:bg-slate-900/50">
                    <Plus size={20}/> Add Manually
                </button>
                <label className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 font-bold flex justify-center gap-2 transition hover:border-blue-500/50 cursor-pointer hover:bg-slate-900/50">
                    <FileUp size={20}/> Import from PDF
                    <input type="file" accept=".pdf" hidden onChange={handlePdfUpload} />
                </label>
            </div>
        </>
      )}
    </div>
  );
};

export default QuizEditor;