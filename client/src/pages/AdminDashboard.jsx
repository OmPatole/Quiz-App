import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, Library, Menu, X, BarChart2, Trophy } from 'lucide-react';
import Logo from '../components/common/Logo';
import StudentManager from '../components/admin/StudentManager';
import QuizManager from '../components/admin/QuizManager';
import MaterialsManager from '../components/admin/MaterialsManager';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminLeaderboard from '../components/admin/AdminLeaderboard';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // Default to analytics for visibility
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'quizzes', label: 'Quiz Management', icon: BookOpen },
        { id: 'materials', label: 'Study Materials', icon: Library },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <div className="hidden md:block w-px h-8 bg-neutral-800"></div>
                        <h1 className="hidden md:block text-sm font-bold text-neutral-400 uppercase tracking-wider">
                            Admin Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border border-red-700"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white hover:bg-neutral-800 rounded-lg"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`md:hidden absolute top-full left-0 w-full bg-neutral-900 border-b border-neutral-800 transition-all duration-300 ease-in-out shadow-2xl ${isMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <div className="px-4 py-4 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                        <div className="pt-2 border-t border-neutral-800">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-neutral-800 rounded-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Desktop Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <div className="hidden md:flex gap-2 border-b border-neutral-800 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-neutral-500 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="mt-6 pb-8">
                    {activeTab === 'analytics' && <AdminAnalytics />}
                    {activeTab === 'students' && <StudentManager />}
                    {activeTab === 'quizzes' && <QuizManager />}
                    {activeTab === 'materials' && <MaterialsManager />}
                    {activeTab === 'leaderboard' && <AdminLeaderboard />}
                </div>
            </div >
        </div >
    );
};

export default AdminDashboard;
