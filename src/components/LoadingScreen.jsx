import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ isLoading }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            // Add a small delay for smoother transition
            const timer = setTimeout(() => setShow(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                >
                    {/* Coin Animation */}
                    <motion.div
                        className="relative w-24 h-24 mb-8"
                        initial={{ scale: 0.8, rotateY: 0 }}
                        animate={{
                            scale: [0.8, 1.1, 0.8],
                            rotateY: [0, 180, 360],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {/* Simple Coin Graphic */}
                        <div className="absolute inset-0 bg-yellow-400 rounded-full border-4 border-yellow-600 shadow-xl flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-2 border-yellow-500 border-dashed flex items-center justify-center">
                                <span className="text-3xl font-black text-yellow-700">$</span>
                            </div>
                        </div>
                        {/* Shimmer on Coin */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-pulse"></div>
                    </motion.div>

                    {/* Text */}
                    <motion.h2
                        className="text-2xl font-black text-yellow-800 tracking-wider"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        載入好運中...
                    </motion.h2>

                    {/* Progress Bar (Indeterminate) */}
                    <div className="mt-6 w-48 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-yellow-500 rounded-full"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
