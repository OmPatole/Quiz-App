import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, BookOpen, LogIn } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/features', label: 'Features', icon: BookOpen },
        { to: '/about', label: 'About', icon: BookOpen },
    ];

    return (
        <nav className="border-b border-emerald-900/20 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Logo className="scale-110" />

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-neutral-400 hover:text-emerald-400 font-medium transition-colors">
                        Login
                    </Link>
                    <Link to="/login" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 text-sm shadow-lg shadow-emerald-900/20">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-white hover:bg-neutral-800 rounded-lg transition-colors z-50 relative"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`
                    md:hidden 
                    absolute top-16 left-0 w-full 
                    bg-neutral-950 border-b border-neutral-800 
                    shadow-2xl shadow-black/50
                    transition-all duration-300 ease-in-out
                    ${isMenuOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                    }
                `}
            >
                <div className="px-4 py-4 space-y-2 max-w-7xl mx-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400 transition-colors"
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-neutral-800">
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-neutral-800 font-medium transition-colors"
                        >
                            <LogIn className="w-5 h-5" />
                            Login / Get Started
                        </Link>
                    </div>
                </div>
            </div>

            {/* Optional: Backdrop/Overlay for dimming background when menu is open */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-16"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </nav>
    );
};

export default Navbar;
