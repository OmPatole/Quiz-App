import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, Library, Menu, X, BarChart2 } from 'lucide-react';
import Logo from '../components/common/Logo';
import StudentManager from '../components/admin/StudentManager';
import QuizManager from '../components/admin/QuizManager';
import MaterialsManager from '../components/admin/MaterialsManager';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics'); // Default to analytics for visibility
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'quizzes', label: 'Quiz Management', icon: BookOpen },
        { id: 'materials', label: 'Study Materials', icon: Library },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 font-sans text-gray-900 dark:text-white">
            {/* Header */}
            <header className="bg-gray-50 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Logo />
                            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-neutral-800"></div>
                            <h1 className="hidden md:block text-sm font-medium text-gray-600 dark:text-neutral-400">
                                Admin Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={logout}
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border border-red-700 dark:border-red-800"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 px-4 py-2 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-white'
                                    : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                        <div className="pt-2 border-t border-gray-200 dark:border-neutral-800">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Desktop Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="hidden md:flex gap-2 border-b border-gray-200 dark:border-neutral-800">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id
                                    ? 'text-blue-600 dark:text-white border-b-2 border-blue-600 dark:border-white'
                                    : 'text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white'
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
