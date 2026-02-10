import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell,
    Legend
} from 'recharts';
import { Filter, User, TrendingUp, Award, Grid, FileText, Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminAnalytics = () => {
    // --- State ---
    const [filters, setFilters] = useState({
        academicYear: 'All Years',
        branch: 'All Branches',
        batchYear: 'All Batches'
    });
    const [data, setData] = useState({
        activityTrends: [],
        categoryPerformance: [],
        passFailRatio: [],
        leaderboard: []
    });
    const [loading, setLoading] = useState(true);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [monthlyPerformanceData, setMonthlyPerformanceData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // --- Options ---
    const academicYears = ['All Years', 'First Year', 'Second Year', 'Third Year', 'Last Year'];
    const branches = ['All Branches', 'CST', 'E&TC', 'Mechanical', 'Food', 'Chemical'];
    const batchYears = ['All Batches', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();

                if (filters.academicYear && filters.academicYear !== 'All Years') {
                    queryParams.append('academicYear', filters.academicYear);
                }
                if (filters.branch && filters.branch !== 'All Branches') {
                    queryParams.append('branch', filters.branch);
                }
                if (filters.batchYear && filters.batchYear !== 'All Batches') {
                    queryParams.append('batchYear', filters.batchYear);
                }

                const response = await api.get(`/admin/analytics?${queryParams.toString()}`);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    // --- Handlers ---
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const generateReport = async () => {
        if (!selectedMonth) return;
        setReportLoading(true);
        try {
            // Fetch both reports
            const [basicReport, performanceReport] = await Promise.all([
                api.get(`/admin/reports/monthly?month=${selectedMonth}`),
                api.get(`/admin/reports/monthly-performance?month=${selectedMonth}`)
            ]);
            setMonthlyReport(basicReport.data);
            setMonthlyPerformanceData(performanceReport.data);
        } catch (error) {
            console.error("Failed to generate report:", error);
        } finally {
            setReportLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!monthlyReport) return;

        const { month, totalQuizzesTaken, uniqueStudents, averageScore, weeklyBreakdown, quizMetadata } = monthlyReport;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Monthly Report for ${month}\n\n`;
        csvContent += `Total Quizzes Taken,${totalQuizzesTaken}\n`;
        csvContent += `Unique Students,${uniqueStudents}\n`;
        csvContent += `Average Score,${averageScore}%\n\n`;

        csvContent += "Weekly Breakdown\n";
        Object.keys(weeklyBreakdown).forEach(week => {
            csvContent += `${week},${weeklyBreakdown[week]}\n`;
        });

        csvContent += "\nQuiz Performance\n";
        csvContent += "Quiz Title,Category,Attempts,Average Score\n";
        quizMetadata.forEach(q => {
            csvContent += `"${q.title}",${q.category},${q.attempts},${q.averageScore}%\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `monthly_report_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = () => {
        if (!monthlyPerformanceData || monthlyPerformanceData.length === 0) {
            alert("No performance data available for PDF generation.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Parse month for title
        const [year, monthNum] = selectedMonth.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[parseInt(monthNum) - 1];

        // Main Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Monthly Aptitude Report - ${monthName} ${year}`, pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: 'center' });

        // Group data by Year and Branch
        const yearOrder = ['Last Year', 'Third Year', 'Second Year', 'First Year'];
        const groupedData = {};

        monthlyPerformanceData.forEach(student => {
            const year = student.academicYear || 'Unknown Year';
            const branch = student.branch || 'Unknown Branch';

            if (!groupedData[year]) groupedData[year] = {};
            if (!groupedData[year][branch]) groupedData[year][branch] = [];

            groupedData[year][branch].push(student);
        });

        let yPosition = 30;

        // Iterate through years in order
        yearOrder.forEach(year => {
            if (!groupedData[year]) return;

            // Year Section Header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(59, 130, 246); // Blue
            doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
            doc.setTextColor(255, 255, 255); // White text
            doc.text(`Year: ${year}`, 12, yPosition + 5.5);
            doc.setTextColor(0, 0, 0); // Reset to black
            yPosition += 12;

            // Iterate through branches
            const branches = Object.keys(groupedData[year]).sort();
            branches.forEach(branch => {
                const students = groupedData[year][branch];

                // Check if we need a new page
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Branch Sub-Header
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(31, 41, 55); // Dark gray
                doc.text(`Branch: ${branch}`, 12, yPosition);
                yPosition += 8;

                // Table for this branch
                const tableData = students.map(student => {
                    let status = 'Low';
                    if (student.avgScore >= 80) status = 'High';
                    else if (student.avgScore >= 50) status = 'Avg';

                    return [
                        student.prn || 'N/A',
                        student.name || 'N/A',
                        student.quizzesAttended,
                        `${student.avgScore}%`,
                        status
                    ];
                });

                doc.autoTable({
                    head: [['PRN', 'Student Name', 'Quizzes Attended', 'Avg Score (%)', 'Status']],
                    body: tableData,
                    startY: yPosition,
                    margin: { left: 12, right: 12 },
                    theme: 'grid',
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [229, 231, 235], // Light gray
                        textColor: [31, 41, 55], // Dark gray
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 30 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 35, halign: 'center' },
                        3: { cellWidth: 30, halign: 'center' },
                        4: { cellWidth: 25, halign: 'center' }
                    },
                    didParseCell: function(data) {
                        // Color-code status column
                        if (data.column.index === 4 && data.section === 'body') {
                            const status = data.cell.raw;
                            if (status === 'High') {
                                data.cell.styles.fillColor = [209, 250, 229]; // Green
                                data.cell.styles.textColor = [22, 101, 52];
                            } else if (status === 'Avg') {
                                data.cell.styles.fillColor = [254, 243, 199]; // Yellow
                                data.cell.styles.textColor = [146, 64, 14];
                            } else if (status === 'Low') {
                                data.cell.styles.fillColor = [254, 226, 226]; // Red
                                data.cell.styles.textColor = [153, 27, 27];
                            }
                        }
                    }
                });

                yPosition = doc.lastAutoTable.finalY + 10;
            });

            yPosition += 5; // Extra spacing between years
        });

        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('Generated by Aptitude Portal', pageWidth / 2, pageHeight - 6, { align: 'center' });
        }

        doc.save(`Monthly_Aptitude_Report_${monthName}_${year}.pdf`);
    };

    // --- Custom Tooltip ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-3 rounded-lg shadow-xl">
                    <p className="text-blue-600 dark:text-blue-400 font-bold mb-1">{label}</p>
                    <p className="text-gray-600 dark:text-neutral-300 text-sm">
                        {payload[0].name}: <span className="text-gray-900 dark:text-white font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // --- Colors ---
    const COLORS = ['#3b82f6', '#ef4444']; // Blue (Pass), Red (Fail)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm dark:shadow-none">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-blue-600 dark:text-blue-500" />
                        Performance Analytics
                    </h2>
                    <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">
                        Track student progress and performance metrics
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <select
                            name="academicYear"
                            value={filters.academicYear}
                            onChange={handleFilterChange}
                            className="appearance-none bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                            {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            className="appearance-none bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            name="batchYear"
                            value={filters.batchYear}
                            onChange={handleFilterChange}
                            className="appearance-none bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                            {batchYears.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 1. Activity Trends (Line Chart) */}
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg dark:shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-600 dark:text-blue-500" />
                                30-Day Activity Trend
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#525252" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="#737373"
                                        tick={{ fill: '#737373', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                    />
                                    <YAxis
                                        stroke="#737373"
                                        tick={{ fill: '#737373', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Quizzes"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 0, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Category Performance (Bar Chart) */}
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg dark:shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Grid size={18} className="text-blue-600 dark:text-blue-500" />
                                Category Performance (Avg %)
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.categoryPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#525252" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="#737373" hide />
                                    <YAxis
                                        dataKey="category"
                                        type="category"
                                        stroke="#737373"
                                        tick={{ fill: '#a3a3a3', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#262626' }} />
                                    <Bar
                                        dataKey="avgScore"
                                        name="Avg Score"
                                        fill="#10b981"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Pass/Fail Ratio (Pie Chart) */}
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg dark:shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Award size={18} className="text-blue-600 dark:text-blue-500" />
                                Pass / Fail Ratio
                            </h3>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.passFailRatio}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        stroke="none"
                                    >
                                        {data.passFailRatio.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry._id === 'Pass' ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-gray-600 dark:text-neutral-400 ml-2">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Leaderboard */}
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-lg dark:shadow-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={18} className="text-blue-600 dark:text-blue-500" />
                                Top Performers
                            </h3>
                        </div>
                        <div className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 dark:text-neutral-500 uppercase border-b border-gray-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="py-3 font-medium">Rank</th>
                                        <th className="py-3 font-medium">Student</th>
                                        <th className="py-3 font-medium text-right">Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                    {data.leaderboard.map((student, index) => (
                                        <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-4">
                                                <span className={`
                                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                    ${index === 0 ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500' :
                                                        index === 1 ? 'bg-gray-200 dark:bg-neutral-600/20 text-gray-600 dark:text-neutral-400' :
                                                            index === 2 ? 'bg-blue-200 dark:bg-blue-800/20 text-blue-700 dark:text-blue-800' : 'text-gray-500 dark:text-neutral-600'}
                                                `}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {student.name}
                                            </td>
                                            <td className="py-4 text-right font-bold text-blue-600 dark:text-blue-500">
                                                {student.avgScore}%
                                            </td>
                                        </tr>
                                    ))}
                                    {data.leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-gray-500 dark:text-neutral-500 italic">
                                                No data available for current selection
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* Monthly Report Section */}
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm dark:shadow-none mt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-600 dark:text-blue-500" />
                            Monthly Report Generator
                        </h3>
                        <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">
                            Generate detailed performance reports for a specific month
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Select Month</label>
                        <div className="relative">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                max={new Date().toISOString().slice(0, 7)}
                                className="input-field appearance-none [color-scheme:dark]"
                            />
                            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        onClick={generateReport}
                        disabled={reportLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {reportLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        Generate Report
                    </button>

                    {monthlyReport && (
                        <>
                            <button
                                onClick={downloadCSV}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                CSV
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                        </>
                    )}
                </div>

                {monthlyReport && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                            <p className="text-sm text-gray-500 dark:text-neutral-400">Total Quizzes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyReport.totalQuizzesTaken}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                            <p className="text-sm text-gray-500 dark:text-neutral-400">Unique Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyReport.uniqueStudents}</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                            <p className="text-sm text-gray-500 dark:text-neutral-400">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyReport.averageScore}%</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                            <p className="text-sm text-gray-500 dark:text-neutral-400">Active Quizzes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyReport.quizMetadata.length}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;
