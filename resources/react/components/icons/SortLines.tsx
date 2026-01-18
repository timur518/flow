/**
 * SortLines Icon - Иконка сортировки (три полоски)
 */

import React from 'react';

interface SortLinesProps {
    className?: string;
}

const SortLines: React.FC<SortLinesProps> = ({ className = "w-4 h-4" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <line
                x1="2"
                y1="4"
                x2="14"
                y2="4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="4"
                y1="8"
                x2="12"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1="6"
                y1="12"
                x2="10"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default SortLines;

