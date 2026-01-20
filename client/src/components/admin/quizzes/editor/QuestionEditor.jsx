import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import MDEditor from '@uiw/react-md-editor';
import { Trash2, Plus, Image as ImageIcon, X, CheckSquare, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// --- HELPERS MOVED OUTSIDE (Crucial Fix) ---
const OptionImageUploader = ({ onUpload, API_URL }) => {
  const onDrop = useCallback(files => {
    const formData = new FormData(); 
    formData.append('file', files[0]);
    const load = toast.loading("Uploading...");
    
    axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
      .then(res => { 
          toast.dismiss(load); 
          onUpload(res.data.imageUrl); 
      })
      .catch(() => { 
          toast.dismiss(load); 
          toast.error("Failed"); 
      });
  }, [onUpload, API_URL]);
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
  
  return (
    <div {...getRootProps()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer border border-slate-700 text-slate-400 hover:text-white" title="Upload Image">
        <input {...getInputProps()} /> 
        <ImageIcon size={16} />
    </div>
  );
};

const MarkdownImageInserter = ({ onInsert, API_URL }) => {
  const onDrop = useCallback(files => {
    const formData = new FormData(); 
    formData.append('file', files[0]);
    const load = toast.loading("Uploading...");
    
    axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
      .then(res => { 
          toast.dismiss(load); 
          onInsert(`\n![img](${API_URL}${res.data.imageUrl})\n`); 
      })
      .catch(() => { 
          toast.dismiss(load); 
          toast.error("Failed"); 
      });
  }, [onInsert, API_URL]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {'image/*': []} });
  
  return (
    <div {...getRootProps()} className="inline-flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
        <input {...getInputProps()} /> 
        <ImageIcon size={14} /> Insert Image
    </div>
  );
};

// --- MAIN COMPONENT ---
const QuestionEditor = ({ question, qIndex, updateQ, onDelete, API_URL }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative shadow-lg group">
        <button onClick={onDelete} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
        <div className="absolute -left-3 top-6 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg">{qIndex+1}</div>

        <div className="pl-6 space-y-4">
            {/* Question Type & Marks */}
            <div className="flex gap-4">
                <select className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-slate-300 outline-none focus:border-purple-500" value={question.type} onChange={e=>updateQ('type',e.target.value)}><option value="mcq">MCQ</option><option value="code">Code</option></select>
                <input type="number" className="w-20 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-right text-white focus:border-purple-500 outline-none" value={question.marks} onChange={e=>updateQ('marks',e.target.value)} placeholder="Pts"/>
            </div>

            {/* Question Text Editor */}
            <div data-color-mode="dark">
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Question Content</label>
                    <MarkdownImageInserter onInsert={(markdown) => updateQ('text', question.text + markdown)} API_URL={API_URL} />
                </div>
                <MDEditor value={question.text} onChange={(val) => updateQ('text', val)} preview="edit" height={200} className="!bg-slate-950 !border !border-slate-800 rounded-lg" />
            </div>

            {/* --- MCQ OPTIONS SECTION --- */}
            {question.type === 'mcq' && (
                <div className="space-y-3 mt-6 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Answer Options & Correct Choice</label>
                    {question.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex gap-3 items-start">
                            {/* Checkbox for correct answer */}
                            <button onClick={()=>{const n=[...question.options]; const isSel=question.correctIndices.includes(oIndex); let newIndices; if(question.isMultiSelect) newIndices = isSel ? question.correctIndices.filter(i=>i!==oIndex) : [...question.correctIndices, oIndex]; else newIndices=[oIndex]; updateQ('correctIndices', newIndices);}} className={`mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${question.correctIndices.includes(oIndex) ? 'bg-purple-600 border-purple-600' : 'border-slate-600'}`}>{question.correctIndices.includes(oIndex) && <CheckSquare size={14} className="text-white" />}</button>
                            
                            {/* Option Text */}
                            <div className="flex-1 space-y-2">
                                <input className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-sm text-white focus:border-purple-500 outline-none" value={opt.text} onChange={e=>{const n=[...question.options]; n[oIndex].text=e.target.value; updateQ('options', n)}} placeholder={`Option ${oIndex + 1} Text`}/>
                                {opt.image && (
                                  <div className="relative w-fit group/img">
                                    <img src={`${opt.image.startsWith('http') ? '' : API_URL}${opt.image}`} className="h-20 rounded border border-slate-700" alt="option"/>
                                    <button onClick={()=>{const n=[...question.options]; n[oIndex].image=''; updateQ('options', n)}} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover/img:opacity-100 transition"><X size={12}/></button>
                                  </div>
                                )}
                            </div>

                            {/* Image Uploader Helper */}
                            <OptionImageUploader onUpload={(url)=>{const n=[...question.options]; n[oIndex].image=url; updateQ('options', n)}} API_URL={API_URL} />
                            
                            <button onClick={()=>{const n=[...question.options]; n.splice(oIndex,1); updateQ('options', n)}} className="mt-1"><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                        </div>
                    ))}
                    <div className="flex justify-between mt-2">
                        <button onClick={()=>{const n=[...question.options]; n.push({text:'', image:''}); updateQ('options', n)}} className="text-xs text-purple-400 font-bold flex gap-1 hover:text-purple-300"><Plus size={14}/> Add Option</button>
                        <label className="flex gap-2 text-xs text-slate-400 cursor-pointer select-none"><input type="checkbox" checked={question.isMultiSelect} onChange={e=>updateQ('isMultiSelect',e.target.checked)} /> Multi-Select</label>
                    </div>
                </div>
            )}

            {/* --- CODE TEST CASES SECTION --- */}
            {question.type === 'code' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4">
                    <div className="flex gap-2 mb-3 text-emerald-400 text-sm font-bold uppercase"><Code size={16} /> Test Cases</div>
                    {question.testCases.map((tc, tIndex) => (
                        <div key={tIndex} className="flex gap-2 mb-2">
                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" placeholder="Input" value={tc.input} onChange={e => {const n=[...question.testCases]; n[tIndex].input=e.target.value; updateQ('testCases', n)}} />
                            <input className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" placeholder="Output" value={tc.output} onChange={e => {const n=[...question.testCases]; n[tIndex].output=e.target.value; updateQ('testCases', n)}} />
                            <button onClick={()=>{const n=[...question.testCases]; n.splice(tIndex,1); updateQ('testCases', n)}}><Trash2 size={16} className="text-slate-600 hover:text-red-400"/></button>
                        </div>
                    ))}
                    <button onClick={()=>{const n=[...question.testCases]; n.push({input:'',output:''}); updateQ('testCases', n)}} className="text-xs text-emerald-500 font-bold flex gap-1 hover:text-emerald-400"><Plus size={14}/> Add Case</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default QuestionEditor;