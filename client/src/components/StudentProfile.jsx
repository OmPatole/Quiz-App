import React, { useMemo, useState } from 'react';
import { ArrowLeft, Code, GraduationCap, CheckSquare, BarChart2, Hash, Calendar } from 'lucide-react';

// --- HELPER: Contribution Graph Component ---
const ActivityHeatmap = ({ activityMap }) => {
    // 1. Determine Available Years
    const { availableYears } = useMemo(() => {
        const years = new Set();
        const today = new Date();
        const y = today.getFullYear();

        if (Object.keys(activityMap).length > 0) {
            Object.keys(activityMap).forEach(dateStr => {
                years.add(new Date(dateStr).getFullYear());
            });
        }
        years.add(2026);
        years.add(y);

        return {
            availableYears: Array.from(years).sort((a, b) => b - a),
        };
    }, [activityMap]);

    const [selectedYear, setSelectedYear] = useState(2026);

    // 2. Generate Calendar Data (Monday Start)
    const { weeks, monthLabels } = useMemo(() => {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);

        // Adjust Start Date to previous MONDAY to maintain grid structure
        // (If Jan 1 is Thu, we need empty slots for Mon, Tue, Wed)
        const dayOfWeek = (startDate.getDay() + 6) % 7;
        const gridStartDate = new Date(startDate);
        gridStartDate.setDate(startDate.getDate() - dayOfWeek);

        const weeksData = [];
        const monthsData = [];
        let currentWeek = Array(7).fill(null);
        let currentDate = new Date(gridStartDate);
        let lastMonthLabelIndex = -1;

        // Loop until we pass the end date AND finish the week
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const monthName = currentDate.toLocaleString('default', { month: 'short' });

            // ISO Day: Mon(0) -> Sun(6)
            const isoDayIndex = (currentDate.getDay() + 6) % 7;
            const yearVal = currentDate.getFullYear();

            if (currentDate > endDate && isoDayIndex === 0) break;

            // --- Month Label Logic ---
            if (isoDayIndex === 0) {
                const currentWeekIndex = weeksData.length;
                const nextWeekDate = new Date(currentDate);
                nextWeekDate.setDate(currentDate.getDate() + 7);

                // Logic: Use the month of the upcoming week to decide label
                // This ensures if a week starts Dec 29 but ends Jan 4, we label it "Jan"
                let labelMonth = nextWeekDate.toLocaleString('default', { month: 'short' });

                // FORCE JAN START: If it's the very first column, always label it the starting month of selected year
                if (currentWeekIndex === 0) {
                    labelMonth = "Jan";
                }

                // Add label if month changed or it's the start
                if (monthName !== labelMonth || currentWeekIndex === 0) {
                    // Gap check
                    if (currentWeekIndex - lastMonthLabelIndex > 3 || lastMonthLabelIndex === -1) {
                        monthsData.push({ name: labelMonth, index: currentWeekIndex });
                        lastMonthLabelIndex = currentWeekIndex;
                    }
                }
            }

            // --- Fill Data ---
            if (yearVal === selectedYear) {
                currentWeek[isoDayIndex] = {
                    date: dateStr,
                    count: activityMap[dateStr] || 0,
                };
            }

            // --- Push Week ---
            if (isoDayIndex === 6) {
                weeksData.push(currentWeek);
                currentWeek = Array(7).fill(null);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { weeks: weeksData, monthLabels: monthsData };
    }, [activityMap, selectedYear]);

    // 3. Color Scale
    const getColor = (item) => {
        if (!item) return 'bg-transparent';
        if (item.count === 0) return 'bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700/50';
        if (item.count <= 1) return 'bg-blue-200 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-900';
        if (item.count <= 3) return 'bg-blue-400 dark:bg-blue-700/80 border border-blue-500 dark:border-blue-700';
        if (item.count <= 5) return 'bg-blue-600 border border-blue-700 dark:border-blue-500';
        return 'bg-blue-700 dark:bg-blue-500 border border-blue-800 dark:border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    };

    return (
        <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl mb-8 font-sans flex flex-col md:flex-row gap-6">
            {/* --- LEFT SIDE: GRAPH --- */}
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-600 dark:text-neutral-400 uppercase flex items-center gap-2">
                        <Calendar size={16} /> {selectedYear} Activity
                    </h3>
                </div>

                <div className="flex">

                    <div className="relative w-8 h-[96px] mr-2 text-[10px] text-gray-500 dark:text-neutral-500 font-bold">
                        {/* Mon aligns with first box (Row 0) */}
                        <span className="absolute top-[30px] right-0">Mon</span>
                        {/* Wed aligns with third box (Row 2) -> 14px * 2 = 28px */}
                        <span className="absolute top-[58px] right-0">Wed</span>
                        {/* Fri aligns with fifth box (Row 4) -> 14px * 4 = 56px */}
                        <span className="absolute top-[89px] right-0">Fri</span>
                    </div>

                    {/* Heatmap Scroll Container */}
                    <div className="overflow-x-auto flex-1 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-800">
                        {/* Month Labels */}
                        <div className="flex text-[10px] text-gray-500 dark:text-neutral-500 font-bold mb-2 relative h-3">
                            {monthLabels.map((m, i) => (
                                <span
                                    key={i}
                                    style={{ left: `${m.index * 14}px` }}
                                    className="absolute top-0"
                                >
                                    {m.name}
                                </span>
                            ))}
                        </div>

                        {/* The Grid */}
                        <div className="flex gap-[2px]">
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-[2px]">
                                    {week.map((day, dIndex) => (
                                        <div
                                            key={dIndex}
                                            className={`w-3 h-3 rounded-[2px] transition-all duration-300 ${getColor(day)} ${day ? 'hover:scale-125 hover:z-10 cursor-pointer' : ''}`}
                                            title={day ? `${new Date(day.date).toDateString()}: ${day.count} quizzes` : ''}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 mt-4 text-[10px] text-gray-500 dark:text-neutral-500 justify-end">
                    <span className="mr-1">Less</span>
                    <div className="w-3 h-3 rounded-[2px] bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700/50"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-blue-200 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-900"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-blue-400 dark:bg-blue-700/80 border border-blue-500 dark:border-blue-700"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-blue-600 border border-blue-700 dark:border-blue-500"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-blue-700 dark:bg-blue-500 border border-blue-800 dark:border-blue-400"></div>
                    <span className="ml-1">More</span>
                </div>
            </div>

            {/* --- RIGHT SIDE: YEAR SELECTOR --- */}
            <div className="flex flex-row md:flex-col gap-2 md:pl-6 md:border-l border-gray-200 dark:border-neutral-800/50 text-xs font-bold text-gray-500 dark:text-neutral-500 min-w-[80px]">
                {availableYears.map(year => (
                    <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-3 py-1.5 rounded-lg transition-all text-left w-full ${year === selectedYear ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300 border border-transparent'}`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    );
};

const StudentProfile = ({ student, stats, onBack }) => {
    if (!student || !stats) return null;

    const profileStats = stats.stats || {};
    const history = stats.recentActivity || [];
    const activityMap = stats.activityMap || {};

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20 w-full">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">
                {onBack && (
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-600 transition"><ArrowLeft size={18} /></button>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                    <div className="flex gap-3 text-sm text-gray-600 dark:text-neutral-400 mt-1">
                        <span className="flex items-center gap-1"><Code size={12} /> {student.prn}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><GraduationCap size={12} /> {student.branch}</span>
                    </div>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl flex items-center gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><CheckSquare size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileStats.totalTests || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">Total Attempts</div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl flex items-center gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition">
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400"><Hash size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileStats.accuracy || 0}%</div>
                        <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">Accuracy</div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl flex items-center gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><BarChart2 size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{profileStats.avgScore || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">Avg. Score</div>
                    </div>
                </div>
            </div>

            {/* --- CONTRIBUTION HEATMAP --- */}
            <ActivityHeatmap activityMap={activityMap} />

            {/* RECENT ACTIVITY TABLE */}
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-neutral-400">
                        <thead className="text-xs text-gray-500 dark:text-neutral-500 uppercase bg-gray-100 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-4">Quiz ID</th>
                                <th className="px-6 py-4">Submitted At</th>
                                <th className="px-6 py-4 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} className="border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800/30 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {h.quizTitle || h.quizId || "Unknown Quiz"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {h.submittedAt ? new Date(h.submittedAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">
                                        {h.score}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-8 text-gray-500 dark:text-neutral-500 italic">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
