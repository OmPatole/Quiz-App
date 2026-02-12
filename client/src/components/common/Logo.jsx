import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Logo = ({ className = "", iconSize = 9, textSize = "text-xl" }) => {
    const navigate = useNavigate();

    return (
        <div
            className={`flex items-center gap-3 font-bold tracking-tight cursor-pointer group ${className}`}
            onClick={() => navigate('/')}
        >
            <div className={`relative w-${iconSize} h-${iconSize} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <GraduationCap
                    className="w-full h-full text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    strokeWidth={1.5}
                />
            </div>
            <span className={`${textSize} text-white flex items-center`}>
                Aptitude<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ml-0.5">Portal</span>
            </span>
        </div>
    );
};

export default Logo;
