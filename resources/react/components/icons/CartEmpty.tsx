/**
 * CartEmpty Icon - Иконка пустой корзины
 */

import React from 'react';

interface CartEmptyProps {
    className?: string;
}

const CartEmpty: React.FC<CartEmptyProps> = ({ className = "w-16 h-16" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 66 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M33 0C14.775 0 0 13.425 0 30C0 46.575 14.775 60 33 60C51.225 60 66 46.575 66 30C66 13.425 51.225 0 33 0ZM33 54C18.075 54 6 41.925 6 30C6 18.075 18.075 6 33 6C47.925 6 60 18.075 60 30C60 41.925 47.925 54 33 54Z"
                fill="#D1D5DB"
            />
            <path
                d="M45 20H21L18 35H48L45 20Z"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M24 35V40"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M33 35V40"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M42 35V40"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default CartEmpty;

