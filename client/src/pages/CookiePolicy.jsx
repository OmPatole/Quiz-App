import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/common/Logo';

const CookiePolicy = () => {
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
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
                    <p className="text-gray-500 dark:text-neutral-500 text-sm font-medium">Last Updated: February 2026</p>
                </div>

                <div className="space-y-12 text-gray-600 dark:text-neutral-400 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. What Are Cookies?</h2>
                        <p>
                            Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Cookies</h2>
                        <p>
                            We use cookies strictly for essential functionality:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-600 dark:marker:text-emerald-500">
                            <li><strong>Session Management:</strong> To remember your login status (via JWT stored securely) so you don't have to log in on every page refresh.</li>
                            <li><strong>Preferences:</strong> To remember user preferences such as theme settings (e.g., Dark Mode) or dashboard view filters.</li>
                            <li><strong>Security:</strong> To detect and prevent unauthorized access or malicious activity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Types of Cookies We Use</h2>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-600 dark:marker:text-emerald-500">
                            <li><strong>Strictly Necessary Cookies:</strong> Essential for you to browse the website and use its features, such as accessing secure areas.</li>
                            <li><strong>Functionality Cookies:</strong> Allow the website to remember choices you make (such as your user name, language or the region you are in).</li>
                        </ul>
                    </section>


                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Managing Cookies</h2>
                        <p>
                            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="http://www.aboutcookies.org" className="text-blue-600 dark:text-emerald-500 hover:underline">www.aboutcookies.org</a> or <a href="http://www.allaboutcookies.org" className="text-blue-600 dark:text-emerald-500 hover:underline">www.allaboutcookies.org</a>.
                        </p>
                        <p className="mt-4 text-sm text-gray-600 dark:text-neutral-500 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl">
                            <strong>Note:</strong> Since our application relies on secure tokens for authentication, disabling cookies or local storage may prevent you from logging in or using core features.
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

export default CookiePolicy;
