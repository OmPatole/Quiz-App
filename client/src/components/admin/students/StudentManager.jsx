import React, { useState, useEffect } from 'react';
import { Calendar, Users, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentList from './StudentList';

const StudentManager = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeYear, setActiveYear] = useState('2026');
  const [years, setYears] = useState(['2026', '2027', '2028', '2029']); // Default fallback
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH AVAILABLE YEARS (Dynamic Sidebar) ---
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const token = localStorage.getItem('token');
        // FIXED: Port 3001
        const res = await axios.get('http://localhost:3001/api/admin/grad-years', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // If backend returns years, use them.
        if (res.data && res.data.length > 0) {
            setYears(res.data);
            // Optional: Switch to the first available year if current one is not in list
            if (!res.data.includes(activeYear)) setActiveYear(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch years", err);
      }
    };
    fetchYears();
  }, []);

  // --- 2. FETCH STUDENTS ---
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // FIXED: Port 3001 and added Authorization
        const response = await axios.get(`http://localhost:3001/api/admin/students?year=${activeYear}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [activeYear]);

  // --- HANDLERS ---
  const handleSelectStudent = (student) => {
    navigate('/admin/student-profile', { state: { student } });
  };

  const handleUploadCSV = () => {
    // You can trigger your upload modal here
    console.log("Trigger Upload Modal");
    // Ensure your upload component also points to http://localhost:3001/api/admin/upload-students
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> Graduation Years
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeYear === year 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Class of {year}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h1 className="text-2xl font-bold text-white">Class of {activeYear}</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Users size={14}/> {students.length} Students Enrolled
            </p>
          </div>
          
           {/* Upload Button */}
           <button 
            onClick={handleUploadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            <Upload size={16} />
            Upload CSV
          </button>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              Loading students...
            </div>
          ) : (
            <StudentList 
              students={students} 
              onSelectStudent={handleSelectStudent} 
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentManager;