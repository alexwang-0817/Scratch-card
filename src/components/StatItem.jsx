
import React, { useEffect, useState } from 'react';

export function StatItem({ label, value, prefix = "", suffix = "", className = "" }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {label && <div className="text-gray-500 text-xs sm:text-sm uppercase tracking-wider mb-1 font-bold">{label}</div>}
            <div className="font-black">
                {prefix + Math.round(displayValue).toLocaleString() + suffix}
            </div>
        </div>
    );
}
