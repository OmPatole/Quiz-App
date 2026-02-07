import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ className = "", iconSize = 8, textSize = "text-xl" }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`flex items-center gap-2 font-bold tracking-tight cursor-pointer ${className}`}
            onClick={() => navigate('/')}
        >
            <div className={`w-${iconSize} h-${iconSize} bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/20`}>
                <GraduationCap className="w-1/2 h-1/2" strokeWidth={1.5} />
            </div>
            <span className={`${textSize} text-white`}>
                Aptitude<span className="text-emerald-500">Portal</span>
            </span>
        </div>
    );
};

export default Logo;
