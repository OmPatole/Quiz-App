import React from 'react';
import { ArrowLeft, Plus, FileUp, Eye, Clock, BrainCircuit } from 'lucide-react';
import QuestionEditor from './QuestionEditor';

const QuizEditor = ({ 
    formState, setFormState, 
    questions, setQuestions, 
    onBack, onSave, 
    previewMode, setPreviewMode, 
    handlePdfUpload, API_URL 
}) => {

  const updateQ = (index, field, value) => {
      const newQuestions = [...questions];
      newQuestions[index][field] = value;
      setQuestions(newQuestions);
  };

  const YEAR_OPTIONS = [
      { label: 'FY', value: 'First Year' },
      { label: 'SY', value: 'Second Year' },
      { label: 'TY', value: 'Third Year' },
      { label: 'BE', value: 'Fourth Year' }
  ];

  const toggleYear = (yearValue) => {
      setFormState(prev => ({
          ...prev,
          targetYears: prev.targetYears.includes(yearValue) 
            ? prev.targetYears.filter(y => y !== yearValue) 
            : [...prev.targetYears, yearValue]
      }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex justify-between items-center mb-6">
           <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> Back</button>
           <div className="flex gap-2">
              <button onClick={() => setPreviewMode(true)} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold flex items-center gap-2"><Eye size={14}/> Preview</button>
              <button onClick={onSave} className="px-6 py-2 bg-purple-600 rounded-lg text-sm font-bold text-white shadow-lg hover:bg-purple-700">Save Quiz</button>
           </div>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-6 shadow-xl">
          <div className="flex gap-4 items-start">
              <div className="flex-1">
                  <input className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-lg font-medium outline-none focus:border-purple-500 transition" placeholder="Enter Quiz Title..." value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} />
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-6">
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Type</label>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {['weekly', 'mock'].map(t => <button key={t} onClick={() => setFormState({...formState, quizType: t})} className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition ${formState.quizType === t ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>)}
                    </div>
                </div>
              </div>
              
              <div className="space-y-6 col-span-2">
                 <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Duration (HH : MM)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1"><input type="number" min="0" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={formState.durationHours} onChange={e => setFormState({...formState, durationHours: e.target.value})} /><span className="absolute right-2 top-2 text-xs text-slate-500 font-bold mt-0.5">HR</span></div>
                        <span className="text-slate-600 font-bold py-2">:</span>
                        <div className="relative flex-1"><input type="number" min="0" max="59" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold outline-none focus:border-purple-500 text-center" value={formState.durationMinutes} onChange={e => setFormState({...formState, durationMinutes: e.target.value})} /><span className="absolute right-2 top-2 text-xs text-slate-500 font-bold mt-0.5">MIN</span></div>
                    </div>
                </div>
                
                <div>
                   <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Target Audience</label>
                   <div className="flex gap-2">
                      {YEAR_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => toggleYear(opt.value)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${formState.targetYears.includes(opt.value) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>{opt.label}</button>
                      ))}
                   </div>
                </div>
              </div>
          </div>

          {formState.quizType === 'weekly' && (
              <div className="mt-6 border-t border-slate-800 pt-6 animate-in fade-in">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-purple-500"/> Quiz Availability Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed">
                      <div className="relative group">
                          <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Start Time</label>
                          <input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={formState.schedule.start} onChange={e => setFormState({...formState, schedule: {...formState.schedule, start: e.target.value}})} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                      </div>
                      <div className="relative group">
                          <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">End Time</label>
                          <input type="datetime-local" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer outline-none focus:border-purple-500" style={{ colorScheme: 'dark' }} value={formState.schedule.end} onChange={e => setFormState({...formState, schedule: {...formState.schedule, end: e.target.value}})} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                      </div>
                  </div>
              </div>
          )}
      </div>

      <div className="space-y-8">
          {questions.map((q, qIndex) => (
              <QuestionEditor 
                  key={q.id}
                  question={q}
                  qIndex={qIndex}
                  updateQ={(field, value) => updateQ(qIndex, field, value)}
                  onDelete={() => {const n=[...questions]; n.splice(qIndex,1); setQuestions(n)}}
                  API_URL={API_URL}
              />
          ))}
      </div>

      <div className="flex gap-4 mb-20 mt-8">
          <button onClick={() => setQuestions([...questions, { id: Date.now(), type: 'mcq', text: '**New Question**', marks: 5, options: [{text:'', image:''}, {text:'', image:''}], isMultiSelect: false, correctIndices: [0], testCases: [{input:'', output:''}]}])} className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-purple-400 font-bold flex justify-center gap-2 transition hover:border-purple-500/50"><Plus size={20}/> Add Manually</button>
          <label className="flex-1 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 font-bold flex justify-center gap-2 transition hover:border-blue-500/50 cursor-pointer">
              <FileUp size={20}/> Import from PDF
              <input type="file" accept=".pdf" hidden onChange={handlePdfUpload} />
          </label>
      </div>
    </div>
  );
};

export default QuizEditor;