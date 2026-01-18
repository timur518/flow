/**
 * Sort Icon - Иконка сортировки
 */

import React from 'react';

interface SortProps {
    className?: string;
}

const Sort: React.FC<SortProps> = ({ className = "w-4 h-4" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4 6L8 2L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4 10L8 14L12 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Sort;

