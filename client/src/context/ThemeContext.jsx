import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        // Force dark mode always
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('aptitude-theme', 'dark');
    }, []);

    // Provide a no-op toggleTheme for backward compatibility
    const toggleTheme = () => {
        // Dark mode only - no toggle
    };

    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
