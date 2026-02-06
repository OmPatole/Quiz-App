import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [prn, setPrn] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(prn, password);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 font-sans">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-900 rounded-2xl mb-4 border border-neutral-800 shadow-lg shadow-emerald-900/10">
                        <LogIn className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-neutral-400">
                        Sign in to access your aptitude dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="card bg-neutral-900 border-neutral-800 hover:border-emerald-900/30 transition-colors">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                PRN (User ID)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="text"
                                    value={prn}
                                    onChange={(e) => setPrn(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Enter your PRN"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-neutral-500 mt-6">
                    Aptitude Enhancement Portal <br /> School of Engineering and Technology
                </p>
            </div>
        </div>
    );
};

export default Login;
