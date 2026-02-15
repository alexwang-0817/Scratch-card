import React, { useMemo } from 'react';

/**
 * LotteryAvatar: Replaces lottery images with a character avatar.
 * @param {string} name - Lottery name.
 * @param {number} price - Lottery price (used to generate background color).
 * @param {string} className - Additional CSS classes.
 */
export function LotteryAvatar({ name, price, className = "" }) {
    // Extract the first character.
    // Handle cases where name might be empty or undefined.
    const char = name ? name.charAt(0) : "?";

    // Generate a background color based on price or simple hashing of the name if price isn't distinct enough
    // Prices: 100, 200, 300, 500, 1000, 2000.
    // Let's map prices to gradients.
    const bgGradient = useMemo(() => {
        switch (price) {
            case 2000:
                return 'bg-gradient-to-br from-red-500 to-rose-600'; // High value - Red/Rose
            case 1000:
                return 'bg-gradient-to-br from-purple-500 to-indigo-600'; // Purple/Indigo
            case 500:
                return 'bg-gradient-to-br from-yellow-400 to-orange-500'; // Gold/Orange
            case 300:
                return 'bg-gradient-to-br from-emerald-400 to-green-600'; // Green
            case 200:
                return 'bg-gradient-to-br from-blue-400 to-cyan-500'; // Blue
            case 100:
            default:
                return 'bg-gradient-to-br from-pink-400 to-rose-400'; // Pink
        }
    }, [price]);

    return (
        <div className={`flex items-center justify-center text-white font-bold shadow-inner ${bgGradient} ${className}`}>
            <span className="text-[1.5em] leading-none select-none drop-shadow-md">
                {char}
            </span>
        </div>
    );
}
