import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BrainCircuit, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        <nav className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50 shadow-lg shadow-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
                        <BrainCircuit className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold text-white hidden sm:block">
                        Aptitude Portal
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {!user ? (
                        <Link
                            to="/login"
                            className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all text-sm shadow-lg shadow-yellow-900/20"
                        >
                            Login
                        </Link>
                    ) : (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-900 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm">
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
                                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-neutral-800">
                                        <p className="text-sm font-bold text-white">{user.name}</p>
                                        <p className="text-xs text-neutral-500">{user.prn}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            to={dashboardLink}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-neutral-300 hover:bg-neutral-800 hover:text-yellow-400 transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-neutral-800 transition-colors"
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
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-white hover:bg-neutral-900 rounded-lg transition-colors z-50 relative"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`
                    md:hidden 
                    absolute top-full left-0 w-full 
                    bg-neutral-950 border-b border-neutral-800 
                    shadow-2xl shadow-black/50
                    z-[100]
                    transition-all duration-300 ease-in-out
                    ${isMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                    }
                `}
            >
                <div className="px-4 py-4 space-y-2 max-w-7xl mx-auto">
                    {user && (
                        <div className="px-4 py-3 mb-2 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                                {getUserInitial()}
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{user.name}</p>
                                <p className="text-xs text-neutral-500">{user.prn} • {user.role}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {!user ? (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors"
                            >
                                Login
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to={dashboardLink}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white bg-neutral-900 hover:bg-neutral-800 font-medium transition-colors border border-neutral-800"
                                >
                                    <LayoutDashboard className="w-5 h-5 text-yellow-500" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-neutral-900 font-medium transition-colors"
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
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] top-full"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </nav>
    );
};

export default Navbar;
