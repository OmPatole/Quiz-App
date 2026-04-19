import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileRef = useRef(null);

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

    const getUserInitial = () => {
        if (!user?.name) return 'U';
        return user.name.charAt(0).toUpperCase();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#d8d0c6] bg-[#f7f4ef]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Logo />

                <div className="hidden md:flex items-center gap-4">
                    {!user ? (
                        <Link
                            to="/login"
                            className="btn-primary px-5 py-2 rounded-full font-semibold text-sm"
                        >
                            Login
                        </Link>
                    ) : (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#ede8df] transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#5f6eea] flex items-center justify-center text-white font-bold text-sm">
                                    {getUserInitial()}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-[#171a22] leading-none">
                                        Hi, {user.name?.split(' ')[0] || 'Student'}
                                    </p>
                                    <p className="text-xs text-[#687083] leading-none mt-0.5">{user.role}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-[#646d80] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-[#fbf9f6] border border-[#d9d0c5] rounded-2xl shadow-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#e3dbcf]">
                                        <p className="text-sm font-bold text-[#171a22]">{user.name}</p>
                                        <p className="text-xs text-[#697185]">{user.prn}</p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            to={dashboardLink}
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-[#4a5264] hover:bg-[#eee8df] hover:text-[#5f6eea] transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-[#f7ece9] transition-colors"
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

                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-[#2c3240] hover:bg-[#ece6dc] rounded-lg transition-colors z-50 relative"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div
                className={`md:hidden absolute top-16 left-0 w-full bg-[#f7f4ef] border-b border-[#d8d0c6] z-[100] transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            >
                <div className="px-4 py-4 space-y-2 max-w-7xl mx-auto">
                    {user && (
                        <div className="px-4 py-3 mb-2 border border-[#ddd4c9] flex items-center gap-3 bg-[#fbf8f4] rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-[#5f6eea] flex items-center justify-center text-white font-bold">
                                {getUserInitial()}
                            </div>
                            <div>
                                <p className="font-bold text-[#171a22] text-sm">{user.name}</p>
                                <p className="text-xs text-[#687083]">{user.prn} - {user.role}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {!user ? (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5f6eea] hover:bg-[#4f5dd9] text-white font-semibold transition-colors"
                            >
                                Login
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to={dashboardLink}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#2b3140] bg-[#fbf8f4] hover:bg-[#ece6dc] font-medium transition-colors border border-[#ddd4c9]"
                                >
                                    <LayoutDashboard className="w-5 h-5 text-[#5f6eea]" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-[#f8ece9] font-medium transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-[90] top-full"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </header>
    );
};

export default Navbar;
