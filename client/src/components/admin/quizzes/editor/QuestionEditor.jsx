import React, { useRef, useEffect } from 'react';
import { Trash2, Image as ImageIcon, List, Bold, Italic, Plus, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- RICH TEXT EDITOR (Preserved from previous step) ---
const RichTextEditor = ({ value, onChange, onUpload }) => {
    const editorRef = useRef(null);
    const isFocused = useRef(false);

    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    useEffect(() => {
        if (editorRef.current && !isFocused.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCmd = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const handleImageClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) onUpload(file, (url) => execCmd('insertImage', url));
        };
        input.click();
    };

    return (
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 focus-within:border-purple-500 transition-colors">
            <div className="bg-slate-900 border-b border-slate-800 p-2 flex gap-1 items-center">
                <button type="button" onClick={() => execCmd('bold')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Bold"><Bold size={14}/></button>
                <button type="button" onClick={() => execCmd('italic')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition" title="Italic"><Italic size={14}/></button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button type="button" onClick={handleImageClick} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition flex items-center gap-2" title="Insert Image">
                    <ImageIcon size={14}/> <span className="text-[10px] font-bold">Image</span>
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                className="w-full bg-transparent p-4 text-slate-200 outline-none min-h-[100px] prose prose-invert max-w-none prose-p:my-1 prose-img:rounded-lg prose-img:max-h-64 prose-img:border prose-img:border-slate-700"
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onFocus={() => isFocused.current = true}
                onBlur={(e) => { isFocused.current = false; onChange(e.currentTarget.innerHTML); }}
                style={{ whiteSpace: 'pre-wrap' }} 
            />
        </div>
    );
};

const QuestionEditor = ({ question, qIndex, onUpdate, onDelete, API_URL }) => {
  if (!question) return null;

  const handleFileUpload = async (file, callback) => {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const toastId = toast.loading("Uploading...");
      try {
          const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
          callback(res.data.url); 
          toast.dismiss(toastId);
      } catch (error) {
          const localUrl = URL.createObjectURL(file);
          callback(localUrl);
          toast.dismiss(toastId);
      }
  };

  const updateField = (field, value) => {
    onUpdate(qIndex, field, value);
  };

  // --- NEW: Add Option Handler ---
  const handleAddOption = () => {
      const currentOptions = question.options || [];
      const newOptions = [...currentOptions, { text: '', image: null }];
      updateField('options', newOptions);
  };

  // --- NEW: Remove Option Handler ---
  const handleRemoveOption = (optIndex) => {
      const currentOptions = question.options || [];
      if (currentOptions.length <= 2) {
          toast.error("Minimum 2 options required");
          return;
      }
      const newOptions = currentOptions.filter((_, i) => i !== optIndex);
      
      // Also fix correct indices if they shift
      let newCorrect = (question.correctIndices || []).map(idx => {
          if (idx === optIndex) return -1; // Removed
          if (idx > optIndex) return idx - 1; // Shift down
          return idx;
      }).filter(idx => idx !== -1);

      updateField('options', newOptions);
      updateField('correctIndices', newCorrect);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative group transition hover:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex gap-2">
                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-slate-700 flex items-center">Q{qIndex + 1}</span>
                <select value={question.type || 'mcq'} onChange={(e) => updateField('type', e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 text-sm font-bold rounded-lg px-3 py-1 outline-none focus:border-purple-500 cursor-pointer hover:bg-slate-900">
                    <option value="mcq">Multiple Choice</option>
                    <option value="descriptive">Descriptive</option>
                </select>
            </div>
            <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-slate-500 uppercase">Marks</span>
                    <input type="number" value={question.marks || 0} onChange={(e) => updateField('marks', parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-white font-bold text-sm text-center outline-none"/>
                </div>
                <button type="button" onClick={() => onDelete(qIndex)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"><Trash2 size={16} /></button>
            </div>
        </div>

        {/* Question Content */}
        <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Question Content</label>
            <RichTextEditor 
                value={question.text} 
                onChange={(html) => updateField('text', html)} 
                onUpload={handleFileUpload}
            />
        </div>

        {/* Options Editor */}
        {question.type === 'mcq' && question.options && (
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><List size={14}/> Answer Options</label>
                
                {question.options.map((opt, i) => (
                    <div key={i} className="flex gap-3 items-start group/opt">
                        {/* Correct Selection Button */}
                        <button type="button" onClick={() => {
                                let newIndices = [...(question.correctIndices || [])];
                                if (question.isMultiSelect) {
                                    newIndices = newIndices.includes(i) ? newIndices.filter(idx => idx !== i) : [...newIndices, i];
                                } else { newIndices = [i]; }
                                updateField('correctIndices', newIndices);
                            }}
                            className={`mt-2 w-6 h-6 rounded flex items-center justify-center border transition ${question.correctIndices?.includes(i) ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700 hover:border-slate-500 text-slate-700'}`}
                        >
                            <span className="text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                        </button>
                        
                        {/* Option Input */}
                        <div className="flex-1">
                             <input 
                                type="text" 
                                value={opt.text || ''}
                                onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[i] = { ...newOptions[i], text: e.target.value };
                                    updateField('options', newOptions);
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-purple-500 outline-none"
                            />
                        </div>

                        {/* Remove Option Button */}
                        <button 
                            type="button" 
                            onClick={() => handleRemoveOption(i)}
                            className="mt-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition opacity-0 group-hover/opt:opacity-100"
                            title="Remove Option"
                        >
                            <X size={14}/>
                        </button>
                    </div>
                ))}

                {/* Bottom Actions */}
                <div className="flex justify-between items-center mt-4 pl-9">
                    <button 
                        type="button" 
                        onClick={handleAddOption}
                        className="text-xs font-bold px-3 py-1.5 bg-slate-800 text-blue-400 rounded hover:bg-slate-700 border border-transparent hover:border-blue-500/30 flex items-center gap-2 transition"
                    >
                        <Plus size={14}/> Add Option
                    </button>

                    <button 
                        type="button" 
                        onClick={() => updateField('isMultiSelect', !question.isMultiSelect)} 
                        className={`text-xs font-bold px-3 py-1.5 rounded border transition ${question.isMultiSelect ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
                    >
                        {question.isMultiSelect ? 'Multi-Select Enabled' : 'Single Correct'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default QuestionEditor;