import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            // Priority: Check localStorage first (Persistent Login)
            const localToken = localStorage.getItem('token');
            const localUser = localStorage.getItem('user');

            if (localToken && localUser) {
                try {
                    // Found in localStorage - user clicked "Remember Me"
                    api.defaults.headers.common['Authorization'] = `Bearer ${localToken}`;
                    setUser(JSON.parse(localUser));
                    setLoading(false);
                    return; // Stop here, we found a valid session
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }

            // If not in localStorage, check sessionStorage (Session-only Login)
            const sessionToken = sessionStorage.getItem('token');
            const sessionUser = sessionStorage.getItem('user');

            if (sessionToken && sessionUser) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`;
                    setUser(JSON.parse(sessionUser));
                } catch (e) {
                    console.error("Failed to parse user from sessionStorage", e);
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                }
            }

            // Done checking
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (prn, password, rememberMe = false) => {
        try {
            // Changed from /auth/login to /session/signin to avoid Brave Shields blocking
            const response = await api.post('/session/signin', { prn, password });
            const { token, user: userData } = response.data;

            if (rememberMe && userData.role !== 'Admin') {
                // Students: Allow 30-day persistent login
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                // Admins: ALWAYS use session storage (clears on browser close)
                // Students (who didn't check remember me): Session storage
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(userData));
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        isStudent: user?.role === 'Student'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
