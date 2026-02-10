import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ className = "", iconSize = 8, textSize = "text-xl" }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`flex items-center gap-2 font-bold tracking-tight cursor-pointer ${className}`}
            onClick={() => navigate('/')}
        >
            <div className={`w-${iconSize} h-${iconSize} bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/30 dark:shadow-blue-900/30`}>
                <BrainCircuit className="w-1/2 h-1/2" strokeWidth={2} />
            </div>
            <span className={`${textSize} text-gray-900 dark:text-white`}>
                Aptitude<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Portal</span>
            </span>
        </div>
    );
};

export default Logo;
