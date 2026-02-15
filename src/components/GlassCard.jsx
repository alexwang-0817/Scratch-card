
import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function GlassCard({ children, className, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            className={cn(
                "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-6 text-white relative overflow-hidden",
                className
            )}
            {...props}
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
            {children}
        </motion.div>
    );
}
