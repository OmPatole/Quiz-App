import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 py-16 border-t border-gray-200 dark:border-white/10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-500">
                            Official Aptitude Enhancement Portal of the School of Engineering and Technology.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 pt-4">
                            &copy; {new Date().getFullYear()} T&P Cell. All rights reserved.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link></li>
                            <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/data-safety" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/cookie-usage" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 dark:text-gray-500">tlp20@unishivaji.ac.in</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 dark:text-gray-500">+91-9876543210</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-500 dark:text-gray-500">School of Engineering and Technology, Shivaji University, Kolhapur</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 mt-12 pt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-600">Tool made by students for students</p>
                    <p className="mt-2 text-gray-400 dark:text-gray-700 text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <a href="https://github.com/ompatole" target="_blank" rel="noopener noreferrer">Developer</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
