import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell,
    Legend
} from 'recharts';
import { Filter, User, TrendingUp, Award, Grid } from 'lucide-react';

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

    // --- Custom Tooltip ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-lg shadow-xl">
                    <p className="text-yellow-400 font-bold mb-1">{label}</p>
                    <p className="text-neutral-300 text-sm">
                        {payload[0].name}: <span className="text-white font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // --- Colors ---
    const COLORS = ['#f1e100dc', '#ef4444']; // Yellow (Pass), Red (Fail)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-yellow-500" />
                        Performance Analytics
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Track student progress and performance metrics
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <select
                            name="academicYear"
                            value={filters.academicYear}
                            onChange={handleFilterChange}
                            className="appearance-none bg-neutral-950 border border-neutral-700 text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                        >
                            {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            className="appearance-none bg-neutral-950 border border-neutral-700 text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                        >
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            name="batchYear"
                            value={filters.batchYear}
                            onChange={handleFilterChange}
                            className="appearance-none bg-neutral-950 border border-neutral-700 text-neutral-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                        >
                            {batchYears.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 1. Activity Trends (Line Chart) */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-yellow-500" />
                                30-Day Activity Trend
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
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
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Grid size={18} className="text-yellow-500" />
                                Category Performance (Avg %)
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.categoryPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="#737373" hide />
                                    <YAxis
                                        dataKey="category"
                                        type="category"
                                        stroke="#737373"
                                        tick={{ fill: '#d4d4d4', fontSize: 12 }}
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
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Award size={18} className="text-yellow-500" />
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
                                        formatter={(value) => <span className="text-neutral-400 ml-2">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Leaderboard */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <User size={18} className="text-yellow-500" />
                                Top Performers
                            </h3>
                        </div>
                        <div className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-xs text-neutral-500 uppercase border-b border-neutral-800">
                                    <tr>
                                        <th className="py-3 font-medium">Rank</th>
                                        <th className="py-3 font-medium">Student</th>
                                        <th className="py-3 font-medium text-right">Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {data.leaderboard.map((student, index) => (
                                        <tr key={index} className="group hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-4">
                                                <span className={`
                                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                    ${index === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                        index === 1 ? 'bg-neutral-600/20 text-neutral-400' :
                                                            index === 2 ? 'bg-amber-700/20 text-amber-700' : 'text-neutral-600'}
                                                `}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 font-medium text-white group-hover:text-yellow-400 transition-colors">
                                                {student.name}
                                            </td>
                                            <td className="py-4 text-right font-bold text-yellow-500">
                                                {student.avgScore}%
                                            </td>
                                        </tr>
                                    ))}
                                    {data.leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-neutral-500 italic">
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
        </div>
    );
};

export default AdminAnalytics;
