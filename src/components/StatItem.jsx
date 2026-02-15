
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function StatItem({ label, value, prefix = "", suffix = "", delay = 0, className = "" }) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        prefix + Math.round(current).toLocaleString() + suffix
    );

    useEffect(() => {
        // Sync the start of the counting animation with the appearance delay
        const timeout = setTimeout(() => {
            spring.set(value);
        }, delay * 1000); // Convert delay (seconds) to ms

        return () => clearTimeout(timeout);
    }, [value, spring, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring" }}
            className={`flex flex-col items-center justify-center ${className}`}
        >
            {label && <div className="text-gray-500 text-xs sm:text-sm uppercase tracking-wider mb-1 font-bold">{label}</div>}
            <motion.div className="font-black">
                {display}
            </motion.div>
        </motion.div>
    );
}
