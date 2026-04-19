import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
    return (
        <footer className="bg-[#f7f4ef] text-[#586073] py-16 border-t border-[#d8d0c6] font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Logo />
                        <p className="text-sm leading-relaxed text-[#61697b]">
                            Official Aptitude Enhancement Portal of the School of Engineering and Technology.
                        </p>
                        <p className="text-xs text-[#7b8395] pt-4">
                            &copy; {new Date().getFullYear()} T&P Cell School of Engineering & Technology, Shivaji University. All rights reserved.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[#202534] font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-[#5f6eea] transition-colors">Home</Link></li>
                            <li><Link to="/features" className="hover:text-[#5f6eea] transition-colors">Features</Link></li>
                            <li><Link to="/about" className="hover:text-[#5f6eea] transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[#202534] font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/terms" className="hover:text-[#5f6eea] transition-colors">Terms of Service</Link></li>
                            <li><Link to="/data-safety" className="hover:text-[#5f6eea] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/cookie-usage" className="hover:text-[#5f6eea] transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[#202534] font-semibold mb-4 text-sm uppercase tracking-wide">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-[#5f6eea] flex-shrink-0 mt-0.5" />
                                <span className="text-[#61697b]">tpo.tech@unishivaji.ac.in</span>
                            </li>

                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[#5f6eea] flex-shrink-0 mt-0.5" />
                                <span className="text-[#61697b]">School of Engineering and Technology, Shivaji University, Kolhapur</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#ddd4c9] mt-12 pt-8 text-center">
                    <p className="text-sm text-[#70788b]">Tool made by student for students</p>
                    <p className="mt-2 text-xs text-[#848da0] hover:text-[#5f6eea] transition-colors">
                        <a href="https://github.com/ompatole" target="_blank" rel="noopener noreferrer">Developer</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
