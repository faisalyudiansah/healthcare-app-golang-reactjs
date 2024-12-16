import React from 'react';

export const PencilSvg: React.FC<{
    className: string;
}> = ({ className }) => {
    return (
        <svg
            className={className}
            width="70"
            height="70"
            viewBox="0 0 33 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M16.5 0C7.3755 0 0 7.3755 0 16.5C0 25.6245 7.3755 33 16.5 33C25.6245 33 33 25.6245 33 16.5C33 7.3755 25.6245 0 16.5 0ZM21.615 8.3655C21.846 8.3655 22.077 8.448 22.275 8.6295L24.3705 10.725C24.75 11.088 24.75 11.6655 24.3705 12.012L22.7205 13.662L19.338 10.2795L20.988 8.6295C21.153 8.448 21.384 8.3655 21.615 8.3655ZM18.3645 11.2365L21.7635 14.6355L11.7645 24.6345H8.3655V21.2355L18.3645 11.2365Z"
                fill="#fcba03"
            />
        </svg>
    );
};
