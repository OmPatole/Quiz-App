import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-800 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <GraduationCap className="w-8 h-8 text-emerald-500" />
                            <span className="text-xl font-bold tracking-tight">AptitudePortal</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Official Aptitude Enhancement Portal of the School of Engineering and Technology.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                            <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span>tnp@collegeapp.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span>+91-9876543210</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span>School of Engineering and Technology, Campus, Pune</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} School of Engineering and Technology, Training and Placement Cell. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
