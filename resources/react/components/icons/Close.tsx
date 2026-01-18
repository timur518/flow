/**
 * Close Icon - Иконка закрытия
 */

import React from 'react';

interface CloseProps {
    className?: string;
}

const Close: React.FC<CloseProps> = ({ className = "w-2 h-2" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1 1L7 7M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Close;

