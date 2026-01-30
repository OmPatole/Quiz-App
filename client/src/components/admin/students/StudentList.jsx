import React, { useState, useMemo } from 'react';
import { Search, Filter, User, ChevronRight, ArrowUpDown } from 'lucide-react';

// --- CONFIG: PREDEFINED BRANCHES ---
// These will always appear in the dropdown, matching your image requirements.
const PREDEFINED_BRANCHES = [
  "Computer Science",
  "Electronics and Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Food and Technology",
  "Information Technology",
  "Electrical Engineering"
];

const StudentList = ({ students = [], onSelectStudent }) => {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [sortBy, setSortBy] = useState('name'); 

  // --- 1. GENERATE DROPDOWN OPTIONS ---
  const uniqueBranches = useMemo(() => {
    // Start with the fixed list you requested
    const branchSet = new Set(PREDEFINED_BRANCHES);

    // Also add any dynamic branches found in the actual student data (just in case)
    if (students && students.length > 0) {
      students.forEach(s => {
        if (s.branch) branchSet.add(s.branch);
      });
    }

    // Convert to sorted array with "All Branches" at the top
    return ['All Branches', ...Array.from(branchSet).sort()];
  }, [students]);

  // --- 2. FILTER & SORT LOGIC ---
  const processedStudents = useMemo(() => {
    if (!students) return [];

    // A. FILTERING
    const filtered = students.filter(student => {
      // Search (Name or PRN)
      const matchesSearch = 
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.prn && student.prn.toString().toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Branch Filter
      const matchesBranch = 
        selectedBranch === 'All Branches' || 
        student.branch === selectedBranch;

      return matchesSearch && matchesBranch;
    });

    // B. SORTING
    return filtered.sort((a, b) => {
      const val = (v) => (v || '').toString().toLowerCase();

      switch (sortBy) {
        case 'branch_year': 
          // Branch A-Z, then Year
          return val(a.branch).localeCompare(val(b.branch)) || val(a.year).localeCompare(val(b.year));
        
        case 'year_branch':
          // Year, then Branch A-Z
          return val(a.year).localeCompare(val(b.year)) || val(a.branch).localeCompare(val(b.branch));
        
        case 'prn':
           return val(a.prn).localeCompare(val(b.prn));

        case 'name':
        default:
          return val(a.name).localeCompare(val(b.name));
      }
    });
  }, [students, searchTerm, selectedBranch, sortBy]);

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* --- CONTROLS BAR --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm w-full">
        
        {/* Title & Stats */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-purple-500" size={20}/> 
            Students Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {processedStudents.length} students found
          </p>
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          
          {/* 1. SEARCH INPUT */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Name or PRN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
            />
          </div>

          {/* 2. BRANCH FILTER (Updated with your list) */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer hover:bg-slate-900 transition"
            >
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <Filter size={14} />
            </div>
          </div>

          {/* 3. SORTING DROPDOWN */}
          <div className="relative min-w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer hover:bg-slate-900 transition"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="branch_year">Sort by Branch & Year</option>
              <option value="year_branch">Sort by Year & Branch</option>
              <option value="prn">Sort by PRN</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <ArrowUpDown size={14} />
            </div>
          </div>

        </div>
      </div>

      {/* --- TABLE LIST VIEW --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg w-full">
        {processedStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              {/* Header */}
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">PRN</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {processedStudents.map((student) => (
                  <tr 
                    key={student._id || student.prn}
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                    className="hover:bg-slate-800/50 transition duration-150 cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="font-medium text-white group-hover:text-purple-400 transition">
                          {student.name || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* PRN */}
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {student.prn || '-'}
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {student.branch || 'N/A'}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="px-6 py-4 text-slate-400">
                      {student.year || '-'}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={16} className="ml-auto text-slate-600 group-hover:text-white transition transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <User size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No Students Found</h3>
            <p className="text-sm text-slate-500 mt-2">
              Try changing the Branch Filter or Class Year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;