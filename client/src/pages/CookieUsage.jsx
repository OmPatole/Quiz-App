import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CookieUsage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black font-sans text-white flex flex-col">
            <Navbar />

            <main className="flex-grow max-w-3xl mx-auto px-4 py-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12 border-b border-white/10 pb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-4">Cookie Usage</h1>
                    <p className="text-gray-500 text-sm font-medium">Last Updated: February 2026</p>
                </div>

                <div className="space-y-12 text-gray-400 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
                        <p>
                            Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
                        <p>
                            We use cookies strictly for essential functionality:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-500">
                            <li><strong>Session Management:</strong> To remember your login status (via JWT stored securely) so you don't have to log in on every page refresh.</li>
                            <li><strong>Preferences:</strong> To remember user preferences such as theme settings (e.g., Dark Mode) or dashboard view filters.</li>
                            <li><strong>Security:</strong> To detect and prevent unauthorized access or malicious activity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Types of Cookies We Use</h2>
                        <ul className="list-disc pl-6 mt-4 space-y-2 marker:text-blue-500">
                            <li><strong>Strictly Necessary Cookies:</strong> Essential for you to browse the website and use its features, such as accessing secure areas.</li>
                            <li><strong>Functionality Cookies:</strong> Allow the website to remember choices you make (such as your user name, language or the region you are in).</li>
                        </ul>
                    </section>


                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
                        <p>
                            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="http://www.aboutcookies.org" className="text-blue-600 hover:underline">www.aboutcookies.org</a> or <a href="http://www.allaboutcookies.org" className="text-blue-600 hover:underline">www.allaboutcookies.org</a>.
                        </p>
                        <p className="mt-4 text-sm text-gray-400 bg-white/5 border border-white/10 p-4 rounded-xl">
                            <strong>Note:</strong> Since our application relies on secure tokens for authentication, disabling cookies or local storage may prevent you from logging in or using core features.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CookieUsage;
