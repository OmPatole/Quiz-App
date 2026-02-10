import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/common/Logo';

const TermsOfService = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 font-sans text-gray-900 dark:text-white">
            <nav className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12 border-b border-gray-200 dark:border-neutral-800 pb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
                    <p className="text-gray-500 dark:text-neutral-500 text-sm font-medium">Last Updated: February 2026</p>
                </div>

                <div className="space-y-12 text-gray-600 dark:text-neutral-400 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using this Aptitude Portal ("Service"), you agree to comply with and be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                        <p>
                            The Service is an online platform provided by the Training & Placement Cell to assist engineering students with aptitude preparation through quizzes, study materials, and analytics.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Conduct</h2>
                        <p>
                            You agree to use the Service only for lawful purposes. Prohibited activities include:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-600 dark:marker:text-blue-500">
                            <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
                            <li>Creating multiple accounts or impersonating another user.</li>
                            <li>Sharing your account credentials with others.</li>
                            <li>Uploading invalid, malicious, or deceptive content.</li>
                            <li>Cheating or exploiting bugs during quiz attempts.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality (including but not limited to quiz questions, study materials, code, and design) are owned by the Institution and are protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without express permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the results of using the Service will meet your requirements or that the Service will be uninterrupted or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Modification of Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 dark:text-neutral-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default TermsOfService;
