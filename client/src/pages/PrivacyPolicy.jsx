import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import Logo from '../components/common/Logo';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">

            <nav className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-20 relative z-10">
                <div className="mb-12 border-b border-neutral-800 pb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
                            <p className="text-blue-400 text-sm font-medium">Last Updated: February 2026</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
                    </p>
                </div>

                <div className="space-y-12 text-gray-400 leading-relaxed text-lg">
                    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
                        </div>
                        <p className="mb-4">
                            We collect basic information required to facilitate your learning and track your progress. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-500">
                            <li>Personal identifiers: Name, PRN (Permanent Registration Number), Branch, and Batch.</li>
                            <li>Performance Data: Quiz scores, time taken, streaks, and engagement metrics.</li>
                            <li>Technical Data: IP address, browser type, and device information for security and optimization.</li>
                        </ul>
                    </section>

                    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">2. How We Use Your Data</h2>
                        </div>
                        <p className="mb-4">
                            Your data is used entirely for educational and placement purposes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-500">
                            <li>To generate performance analytics and identify improvement areas.</li>
                            <li>To provide personalized recommendations for study materials.</li>
                            <li>To maintain academic records for the Training & Placement Cell.</li>
                            <li>To secure your account and prevent unauthorized access.</li>
                        </ul>
                    </section>

                    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">3. Data Sharing</h2>
                        </div>
                        <p className="mb-4">
                            We do <strong className="text-white">not</strong> sell your data to third parties. Your data is accessible only to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-500">
                            <li>Authorized Faculty Administrators of the institution.</li>
                            <li>System maintainers for debugging and updates (under strict NDA).</li>
                        </ul>
                    </section>

                    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">4. Security</h2>
                        </div>
                        <p>
                            We implement industry-standard security measures, including password hashing (bcrypt) and secure session management (JWT), to protect your information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
                        </div>
                        <p>
                            If you have any questions about this Privacy Policy, please contact the T&P Cell administration.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-neutral-800 bg-neutral-950 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
