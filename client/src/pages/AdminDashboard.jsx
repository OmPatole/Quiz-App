import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BookOpen, Library, Menu, X } from 'lucide-react';
import StudentManager from '../components/admin/StudentManager';
import QuizManager from '../components/admin/QuizManager';
import MaterialsManager from '../components/admin/MaterialsManager';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'quizzes', label: 'Quiz Management', icon: BookOpen },
        { id: 'materials', label: 'Study Materials', icon: Library },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            {/* Header */}
            <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">
                                Admin Dashboard
                            </h1>
                            <p className="hidden md:block text-sm text-neutral-400">
                                Welcome back, {user?.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={logout}
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border border-red-800"
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
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-neutral-900 border-t border-neutral-800 px-4 py-2 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-neutral-800 text-white'
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
                )}
            </header>

            {/* Desktop Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="hidden md:flex gap-2 border-b border-neutral-800">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id
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
                    {activeTab === 'students' && <StudentManager />}
                    {activeTab === 'quizzes' && <QuizManager />}
                    {activeTab === 'materials' && <MaterialsManager />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
