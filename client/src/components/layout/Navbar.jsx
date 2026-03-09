import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate('/');
    };

    const dashboardLink = user?.role === 'Admin' ? '/admin' : '/student';

    // Get user initials for avatar
    const getUserInitial = () => {
        if (!user?.name) return 'U';
        return user.name.charAt(0).toUpperCase();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Logo />

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    {!user ? (
                        <Link
                            to="/login"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                            Login
                        </Link>
                    ) : (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {getUserInitial()}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-white leading-none">
                                        Hi, {user.name?.split(' ')[0] || 'Student'}
                                    </p>
                                    <p className="text-xs text-neutral-500 leading-none mt-0.5">{user.role}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-sm font-bold text-white">{user.name}</p>
                                        <p className="text-xs text-neutral-500">{user.prn}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            to={dashboardLink}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:bg-white/5 hover:text-blue-400 transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-white/5 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors z-50 relative"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden absolute top-16 left-0 w-full bg-neutral-900 border-b border-neutral-800 z-[100] transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            >
                <div className="px-4 py-4 space-y-2 max-w-7xl mx-auto">
                    {user && (
                        <div className="px-4 py-3 mb-2 border-b border-white/10 flex items-center gap-3 bg-neutral-900 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {getUserInitial()}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{user.name}</p>
                                <p className="text-xs text-neutral-500">{user.prn} â€¢ {user.role}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {!user ? (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                            >
                                Login
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to={dashboardLink}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-neutral-900 hover:bg-white/10 font-medium transition-colors border border-white/10"
                                >
                                    <LayoutDashboard className="w-5 h-5 text-blue-400" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 font-medium transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile menu */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-[90] top-full"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </header>
    );
};

export default Navbar;
