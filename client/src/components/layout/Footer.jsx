import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
    return (
        <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-800 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-sm leading-relaxed">
                            Official Aptitude Enhancement Portal of the School of Engineering and Technology.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link></li>
                            <li><Link to="/features" className="hover:text-yellow-400 transition-colors">Features</Link></li>
                            <li><Link to="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
                            <li><Link to="/login" className="hover:text-yellow-400 transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/data-safety" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/cookie-usage" className="hover:text-yellow-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <span>tlp20@unishivaji.ac.in</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <span>+91-9876543210</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <span>School of Engineering and Technology, Campus, Shivaji University, Vidyanagar, Kolhapur</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} School of Engineering and Technology, Training and Placement Cell. All rights reserved.</p>
                    <p className="mt-2 text-neutral-500 font-medium">Tool made by students for students</p>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-500 text-xs hover:text-white transition-colors">
                        <a href="https://github.com/ompatole" target="_blank" rel="noopener noreferrer">Developer</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
