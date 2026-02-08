import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white">AP</div>
                        <span>Aptitude<span className="text-yellow-500">Portal</span></span>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12 border-b border-neutral-800 pb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
                    <p className="text-neutral-500 text-sm font-medium">Last Updated: February 2026</p>
                </div>

                <div className="space-y-12 text-neutral-400 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>
                            We collect basic information required to facilitate your learning and track your progress. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-yellow-500">
                            <li>Personal identifiers: Name, PRN (Permanent Registration Number), Branch, and Batch.</li>
                            <li>Performance Data: Quiz scores, time taken, streaks, and engagement metrics.</li>
                            <li>Technical Data: IP address, browser type, and device information for security and optimization.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Data</h2>
                        <p>
                            Your data is used entirely for educational and placement purposes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-yellow-500">
                            <li>To generate performance analytics and identify improvement areas.</li>
                            <li>To provide personalized recommendations for study materials.</li>
                            <li>To maintain academic records for the Training & Placement Cell.</li>
                            <li>To secure your account and prevent unauthorized access.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing</h2>
                        <p>
                            We do <strong>not</strong> sell your data to third parties. Your data is accessible only to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-yellow-500">
                            <li>Authorized Faculty Administrators of the institution.</li>
                            <li>System maintainers for debugging and updates (under strict NDA).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Security</h2>
                        <p>
                            We implement industry-standard security measures, including password hashing (bcrypt) and secure session management (JWT), to protect your information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact the T&P Cell administration.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-neutral-800 bg-neutral-950 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-neutral-500 text-sm">
                        &copy; {new Date().getFullYear()} Aptitude Portal. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
