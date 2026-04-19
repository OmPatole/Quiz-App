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
        // Force light mode to match the global website theme.
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('aptitude-theme', 'light');
    }, []);

    // Provide a no-op toggleTheme for backward compatibility
    const toggleTheme = () => {
        // Light mode only - no toggle
    };

    return (
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
