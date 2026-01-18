/**
 * Plus Icon - Иконка плюса
 */

import React from 'react';

interface PlusProps {
    className?: string;
}

const Plus: React.FC<PlusProps> = ({ className = "w-3 h-3" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6 1V11M1 6H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Plus;

