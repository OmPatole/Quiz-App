import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye } from 'lucide-react';
import api from '../../api/axios';
import StudentProfile from '../StudentProfile';

const StudentManager = () => {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        academicYear: '',
        branch: '',
        batchYear: ''
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Profile View State
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentStats, setSelectedStudentStats] = useState(null);
    const [selectedStudentData, setSelectedStudentData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.academicYear) params.append('academicYear', filters.academicYear);
            if (filters.branch) params.append('branch', filters.branch);
            if (filters.batchYear) params.append('batchYear', filters.batchYear);

            const response = await api.get(`/admin/students?${params.toString()}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/admin/upload-students', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult(response.data);
            fetchStudents(); // Refresh list after upload
        } catch (error) {
            setResult({
                message: 'Upload failed',
                errors: [error.response?.data?.message || 'An error occurred'],
            });
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });

    const handleViewProfile = async (student) => {
        setSelectedStudentId(student._id);
        setSelectedStudentData(student);
        setLoadingStats(true);
        try {
            const response = await api.get(`/admin/student-stats/${student._id}`);
            setSelectedStudentStats(response.data);
        } catch (error) {
            console.error("Error fetching student stats:", error);
            alert("Failed to fetch student statistics");
            setSelectedStudentId(null);
        } finally {
            setLoadingStats(false);
        }
    };

    if (selectedStudentId) {
        if (loadingStats) {
            return (
                <div className="flex items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }
        return (
            <StudentProfile
                student={selectedStudentData}
                stats={selectedStudentStats}
                onBack={() => {
                    setSelectedStudentId(null);
                    setSelectedStudentStats(null);
                    setSelectedStudentData(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">
                    Upload Student Credentials
                </h2>
                <div className="space-y-3 text-sm text-neutral-400">
                    <p>Upload a CSV file containing student credentials with the following columns:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Name</strong> - Full name</li>
                        <li><strong>PRN</strong> - Student PRN (unique)</li>
                        <li><strong>Password</strong> - Login password</li>
                        <li><strong>Academic Year</strong> - e.g. "Third Year"</li>
                        <li><strong>Branch</strong> - e.g. "CST"</li>
                        <li><strong>Batch Year</strong> - e.g. "2026-2027"</li>
                    </ul>
                    <p className="text-xs text-neutral-500 mt-2">
                        Example: <code className="bg-neutral-800 px-2 py-1 rounded">Name,PRN,Password,Academic Year,Branch,Batch Year</code>
                    </p>
                </div>
            </div>

            {/* Upload Area */}
            <div className="card">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-white bg-neutral-800'
                        : 'border-neutral-700 hover:border-neutral-500'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-neutral-400">Uploading and processing...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white mb-1">
                                        {isDragActive ? 'Drop the CSV file here' : 'Drag & drop CSV file here'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card">
                    <div className="flex items-start gap-3 mb-4">
                        {result.created > 0 ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {result.message}
                            </h3>
                            <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-neutral-400">
                                        Created: <strong className="text-emerald-400">{result.created || 0}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-neutral-400">
                                        Errors: <strong className="text-red-400">{result.errors || 0}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Error List */}
                    {result.details?.errors?.length > 0 && (
                        <div className="bg-red-900/20 rounded-lg p-3 max-h-40 overflow-y-auto mt-4">
                            <ul className="space-y-1 text-sm text-red-400">
                                {result.details.errors.map((error, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Student List & Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-white" />
                        Student List
                    </h2>

                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange} className="input-field text-sm md:w-36">
                            <option value="">All Years</option>
                            <option value="First Year">First Year</option>
                            <option value="Second Year">Second Year</option>
                            <option value="Third Year">Third Year</option>
                            <option value="Last Year">Last Year</option>
                        </select>
                        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="input-field text-sm md:w-36">
                            <option value="">All Branches</option>
                            <option value="CST">CST</option>
                            <option value="E&TC">E&TC</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Food">Food</option>
                            <option value="Chemical">Chemical</option>
                        </select>
                        <select
                            name="batchYear"
                            value={filters.batchYear}
                            onChange={handleFilterChange}
                            className="input-field text-sm md:w-36"
                        >
                            <option value="">Batch Year</option>
                            <option value="2023-2024">2023-2024</option>
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                            <option value="2027-2028">2027-2028</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-700">
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">Name</th>
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">PRN</th>
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">Year</th>
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">Branch</th>
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">Batch</th>
                                <th className="p-3 text-sm font-semibold text-neutral-400 whitespace-nowrap">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500">Loading...</td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500">No students found</td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student._id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                                        <td className="p-3 text-neutral-200 whitespace-nowrap">{student.name}</td>
                                        <td className="p-3 text-neutral-400 font-mono text-sm whitespace-nowrap">{student.prn}</td>
                                        <td className="p-3 text-neutral-400 whitespace-nowrap">{student.academicYear || '-'}</td>
                                        <td className="p-3 text-neutral-400 whitespace-nowrap">{student.branch || '-'}</td>
                                        <td className="p-3 text-neutral-400 whitespace-nowrap">{student.batchYear || '-'}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleViewProfile(student)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-emerald-400 transition-colors bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-full border border-neutral-700"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentManager;
