import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Search, Filter, Eye, Trash2, Trophy } from 'lucide-react';
import api from '../../api/axios';
import StudentProfile from '../StudentProfile';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';

const StudentManager = () => {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    // Filter StateTh
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

    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteTarget, setBulkDeleteTarget] = useState({ academicYear: '', batchYear: '' });
    const [processingAction, setProcessingAction] = useState(false);

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Confirmation Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'promote', 'bulkDelete', 'deleteStudent'
        data: null,
        title: '',
        description: '',
        variant: 'danger',
        confirmText: 'Confirm'
    });

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Fetch all students and filter on client side for better UX with search
            const response = await api.get('/admin/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
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
            if (response.data.created > 0) {
                toast.success(`Successfully added ${response.data.created} students`);
            } else if (response.data.errors > 0) {
                toast.warning(`Upload completed with ${response.data.errors} errors`);
            }
            fetchStudents(); // Refresh list after upload
        } catch (error) {
            setResult({
                message: 'Upload failed',
                errors: [error.response?.data?.message || 'An error occurred'],
            });
            toast.error('Upload failed');
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
            toast.error("Failed to fetch student statistics");
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

    // Modal Triggers
    const triggerPromoteAll = () => {
        setModalConfig({
            isOpen: true,
            type: 'promote',
            title: 'Promote All Students',
            description: "Are you sure you want to promote ALL students to the next academic year? (e.g. Third Year -> Last Year). This action is irreversible.",
            variant: 'warning',
            confirmText: 'Promote All'
        });
    };

    const triggerBulkDelete = () => {
        if (!bulkDeleteTarget.academicYear && !bulkDeleteTarget.batchYear) {
            toast.error("Please select an Academic Year or Batch Year to delete.");
            return;
        }
        setModalConfig({
            isOpen: true,
            type: 'bulkDelete',
            title: 'Confirm Bulk Delete',
            description: `Are you sure you want to delete all students in ${bulkDeleteTarget.academicYear || bulkDeleteTarget.batchYear}? This will delete ALL associated data including quiz results.`,
            variant: 'danger',
            confirmText: 'Delete All'
        });
    };

    const triggerDeleteStudent = (studentId) => {
        setModalConfig({
            isOpen: true,
            type: 'deleteStudent',
            data: studentId,
            title: 'Delete Student',
            description: "Are you sure you want to delete this student account? This will remove all their quiz results.",
            variant: 'danger',
            confirmText: 'Delete'
        });
    };

    // Unified Action Handler
    const handleConfirmAction = async () => {
        const { type, data } = modalConfig;
        setProcessingAction(true);

        try {
            if (type === 'promote') {
                const res = await api.post('/admin/promote-students');
                toast.success(res.data.message + ` (${res.data.count} students promoted)`);
                fetchStudents();
            } else if (type === 'bulkDelete') {
                const res = await api.delete('/admin/students/delete-bulk', { data: bulkDeleteTarget });
                toast.success(res.data.message + ` (${res.data.deletedCount} students deleted)`);
                setShowBulkDeleteModal(false);
                setBulkDeleteTarget({ academicYear: '', batchYear: '' });
                fetchStudents();
            } else if (type === 'deleteStudent') {
                await api.delete(`/admin/students/${data}`);
                toast.success("Student deleted successfully");
                fetchStudents();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingAction(false);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
    };


    // Filter Students
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.prn.includes(searchTerm);

        const matchesYear = !filters.academicYear || student.academicYear === filters.academicYear;
        const matchesBranch = !filters.branch || student.branch === filters.branch;
        const matchesBatch = !filters.batchYear || student.batchYear === filters.batchYear;

        return matchesSearch && matchesYear && matchesBranch && matchesBatch;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            academicYear: '',
            branch: '',
            batchYear: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Batch Actions */}
            <div className="card border-l-4 border-l-blue-600 bg-gray-50 dark:bg-neutral-900/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Batch Lifecycle Actions</h2>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">Manage academic year rollovers and bulk deletions.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={triggerPromoteAll}
                            disabled={processingAction}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                        >
                            <Trophy className="w-4 h-4" />
                            Promote All Students
                        </button>
                        <button
                            onClick={() => setShowBulkDeleteModal(true)}
                            disabled={processingAction}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-900/50 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Bulk Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Delete Selection Modal (Not the confirmation modal, but the filter selection) */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Trash2 className="w-6 h-6 text-red-500" /> Bulk Delete Students
                        </h3>
                        <p className="text-gray-500 dark:text-neutral-400 mb-6">Select a criteria to delete students. <strong className="text-red-600 dark:text-red-400 font-semibold">This action is irreversible.</strong></p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">By Academic Year</label>
                                <select
                                    className="input-field w-full bg-gray-50 dark:bg-neutral-950/50 border-gray-200 dark:border-neutral-700 focus:border-blue-500 text-gray-900 dark:text-white [color-scheme:dark]"
                                    value={bulkDeleteTarget.academicYear}
                                    onChange={(e) => setBulkDeleteTarget({ ...bulkDeleteTarget, academicYear: e.target.value, batchYear: '' })}
                                >
                                    <option value="" className="bg-white dark:bg-neutral-900">Select Year...</option>
                                    <option value="First Year" className="bg-white dark:bg-neutral-900">First Year</option>
                                    <option value="Second Year" className="bg-white dark:bg-neutral-900">Second Year</option>
                                    <option value="Third Year" className="bg-white dark:bg-neutral-900">Third Year</option>
                                    <option value="Last Year" className="bg-white dark:bg-neutral-900">Last Year</option>
                                    <option value="Graduated" className="bg-white dark:bg-neutral-900">Graduated</option>
                                </select>
                            </div>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-neutral-600 text-xs uppercase">Or By Batch</span>
                                <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">By Batch Year</label>
                                <select
                                    className="input-field w-full bg-gray-50 dark:bg-neutral-950/50 border-gray-200 dark:border-neutral-700 focus:border-blue-500 text-gray-900 dark:text-white [color-scheme:dark]"
                                    value={bulkDeleteTarget.batchYear}
                                    onChange={(e) => setBulkDeleteTarget({ ...bulkDeleteTarget, batchYear: e.target.value, academicYear: '' })}
                                >
                                    <option value="" className="bg-white dark:bg-neutral-900">Select Batch...</option>
                                    <option value="2023-2024" className="bg-white dark:bg-neutral-900">2023-2024</option>
                                    <option value="2024-2025" className="bg-white dark:bg-neutral-900">2024-2025</option>
                                    <option value="2025-2026" className="bg-white dark:bg-neutral-900">2025-2026</option>
                                    <option value="2026-2027" className="bg-white dark:bg-neutral-900">2026-2027</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="px-4 py-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={triggerBulkDelete}
                                disabled={!bulkDeleteTarget.academicYear && !bulkDeleteTarget.batchYear}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 shadow-lg shadow-red-500/20"
                            >
                                Proceed to Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Toolbar */}
            <div className="card sticky top-0 z-10 bg-gray-50/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-neutral-800 rounded-none md:rounded-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative flex-1 w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search by Name or PRN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10 w-full bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Upload className="w-4 h-4" />
                                Import CSV
                            </button>
                            {(searchTerm || filters.academicYear || filters.branch || filters.batchYear) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-gray-300 dark:hover:border-neutral-600"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange} className="input-field text-sm w-full md:w-auto bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 [color-scheme:dark]">
                            <option value="" className="bg-white dark:bg-neutral-900">All Years</option>
                            <option value="First Year" className="bg-white dark:bg-neutral-900">First Year</option>
                            <option value="Second Year" className="bg-white dark:bg-neutral-900">Second Year</option>
                            <option value="Third Year" className="bg-white dark:bg-neutral-900">Third Year</option>
                            <option value="Last Year" className="bg-white dark:bg-neutral-900">Last Year</option>
                        </select>
                        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="input-field text-sm w-full md:w-auto bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 [color-scheme:dark]">
                            <option value="" className="bg-white dark:bg-neutral-900">All Branches</option>
                            <option value="CST" className="bg-white dark:bg-neutral-900">CST</option>
                            <option value="E&TC" className="bg-white dark:bg-neutral-900">E&TC</option>
                            <option value="Mechanical" className="bg-white dark:bg-neutral-900">Mechanical</option>
                            <option value="Food" className="bg-white dark:bg-neutral-900">Food</option>
                            <option value="Chemical" className="bg-white dark:bg-neutral-900">Chemical</option>
                        </select>
                        <select name="batchYear" value={filters.batchYear} onChange={handleFilterChange} className="input-field text-sm w-full md:w-auto bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 [color-scheme:dark]">
                            <option value="" className="bg-white dark:bg-neutral-900">Batch Year</option>
                            <option value="2023-2024" className="bg-white dark:bg-neutral-900">2023-2024</option>
                            <option value="2024-2025" className="bg-white dark:bg-neutral-900">2024-2025</option>
                            <option value="2025-2026" className="bg-white dark:bg-neutral-900">2025-2026</option>
                            <option value="2026-2027" className="bg-white dark:bg-neutral-900">2026-2027</option>
                            <option value="2027-2028" className="bg-white dark:bg-neutral-900">2027-2028</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                    Bulk Import Students
                                </h3>
                                <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Upload a CSV file to add multiple students at once.</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 text-sm text-gray-600 dark:text-neutral-400">
                                <p className="mb-2 font-medium text-gray-900 dark:text-white">Required CSV Columns:</p>
                                <code className="block bg-gray-50 dark:bg-neutral-900 p-2 rounded text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-neutral-800 mb-2 font-mono">
                                    Name, PRN, DOB, Academic Year, Branch, Batch Year
                                </code>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>DOB Format: DD-MM-YYYY (e.g. 15-08-2004)</li>
                                    <li>Passwords are auto-generated: Initials@DOB (e.g. OP@15082004)</li>
                                </ul>
                            </div>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                    : 'border-gray-200 dark:border-neutral-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-4">
                                    {uploading ? (
                                        <>
                                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-900 dark:text-white font-medium">Processing CSV...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <Upload className="w-6 h-6 text-gray-400 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                    {isDragActive ? 'Drop file now' : 'Click or Drag CSV file'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-neutral-500">Only .csv files supported</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {result && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 ${result.created > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                    {result.created > 0 ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <div className="text-sm">
                                        <p className="font-bold">{result.message}</p>
                                        {result.created > 0 && <p>Successfully added {result.created} students.</p>}
                                        {result.errors > 0 && <p>Failed rows: {result.errors}</p>}
                                        {result.details?.errors?.length > 0 && (
                                            <div className="mt-2 max-h-32 overflow-y-auto pr-2">
                                                <p className="font-bold mb-1">Error Details:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
                                                    {result.details.errors.map((err, i) => <li key={i}>{err}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Student List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <div className="min-w-[640px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-neutral-700">
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">Name</th>
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">PRN</th>
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">Year</th>
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">Branch</th>
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">Batch</th>
                                    <th className="p-3 text-sm font-semibold text-gray-500 dark:text-neutral-400 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-neutral-500">Loading...</td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-neutral-500">No students found matching criteria</td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(student => (
                                        <tr key={student._id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="p-3 text-gray-900 dark:text-neutral-200 whitespace-nowrap font-medium">{student.name}</td>
                                            <td className="p-3 text-gray-500 dark:text-neutral-400 font-mono text-sm whitespace-nowrap">{student.prn}</td>
                                            <td className="p-3 text-gray-600 dark:text-neutral-400 whitespace-nowrap">{student.academicYear || '-'}</td>
                                            <td className="p-3 text-gray-600 dark:text-neutral-400 whitespace-nowrap">{student.branch || '-'}</td>
                                            <td className="p-3 text-gray-600 dark:text-neutral-400 whitespace-nowrap">{student.batchYear || '-'}</td>
                                            <td className="p-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewProfile(student)}
                                                    className="text-gray-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors p-1"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => triggerDeleteStudent(student._id)}
                                                    className="text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                description={modalConfig.description}
                variant={modalConfig.variant}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
};

export default StudentManager;
