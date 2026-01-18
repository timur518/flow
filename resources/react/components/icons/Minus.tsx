/**
 * Minus Icon - Иконка минуса
 */

import React from 'react';

interface MinusProps {
    className?: string;
}

const Minus: React.FC<MinusProps> = ({ className = "w-3 h-3" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2 6H10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Minus;

