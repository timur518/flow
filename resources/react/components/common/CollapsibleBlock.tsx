/**
 * CollapsibleBlock - Раскрывающийся блок (аккордеон)
 * Используется в формах оформления заказа
 */

import React, { useState } from 'react';

interface CollapsibleBlockProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

const CollapsibleBlock: React.FC<CollapsibleBlockProps> = ({
    title,
    children,
    defaultOpen = true,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`collapsible-block white-block ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`collapsible-block-header ${isOpen ? 'open' : ''}`}
            >
                <span className="collapsible-block-title">{title}</span>
                <svg
                    className={`collapsible-block-icon ${isOpen ? 'open' : ''}`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                >
                    <path
                        d="M1 1L6 6L11 1"
                        stroke="#222222"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <div className={`collapsible-block-content ${isOpen ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default CollapsibleBlock;

