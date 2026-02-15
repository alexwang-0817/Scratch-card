import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Info } from 'lucide-react';

export function MetaphysicsModal({ isOpen, onClose, details }) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !details) return null;
    const { title, description, items, type } = details;

    const renderValue = (item) => {
        if (type === 'cp' || type === 'lottery') {
            return `${item.roi.toFixed(0)}%`;
        }
        return `$${(item.totalWin || item.win || 0).toLocaleString()}`;
    };

    const renderSubInfo = (item) => {
        return `${item.count} 張`;
    };

    const getValueColor = (item) => {
        if (type === 'cp' || type === 'lottery') {
            return item.roi >= 100 ? 'text-red-500' : 'text-green-600'; // High ROI = Red (Good in TW)
        }
        return 'text-red-500'; // High Money = Red
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col h-[70vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center flex-shrink-0 relative z-10">
                                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="overflow-y-auto p-4 custom-scrollbar overscroll-contain">
                                {/* Description Card */}
                                <div className="border border-blue-100 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
                                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                                    <div>
                                        <p className="font-bold mb-1">統計方式說明</p>
                                        <p className="opacity-90 leading-relaxed text-xs">{description}</p>
                                    </div>
                                </div>

                                {/* Ranking List */}
                                <div className="space-y-1">
                                    {items.length > 0 || true ? ( // Always render list, will fill with placeholders if empty? User said "if data < 5, fill".
                                        // But if items is empty (0), user might still want to see 5 empty slots?
                                        // The original code had specific "No Data" UI.
                                        // Let's assume if items > 0 we show them + placeholders. If items = 0 we show "No Data" OR 5 empty slots?
                                        // User said "If current data < 5 ... display placeholders".
                                        // I will assume if items=0, we still show the "No Data" message for clarity, OR we show 5 empty slots.
                                        // Let's stick to "fill to 5". If items is empty, we show 5 empty slots.
                                        // Actually, if completely empty, "No Data" is usually better.
                                        // But if user wants to see "Rank 1, Rank 2..." empty slots, that's different.
                                        // Let's keep "No Data" if 0 items for now unless user insists.
                                        // Wait, user said "if current data is less than 5 entries... the 4th and 5th... should exist...".
                                        // This implies there IS some data, just not enough.
                                        // If there is NO data at all, the "No Data" screen is probably fine.
                                        // However, consistency might be better. Let's stick to: if items > 0, we pad. If items == 0, keep "No Data".
                                        [...items, ...Array(Math.max(0, Math.max(items.length, 7) - items.length)).fill(null)].map((item, idx) => {
                                            // Fading effect for items after the 5th one (index 4)
                                            // Index 5 (6th item) -> lighter
                                            // Index 6 (7th item) -> very light
                                            let opacityClass = 'opacity-100';
                                            if (idx === 5) opacityClass = 'opacity-50';
                                            if (idx >= 6) opacityClass = 'opacity-20';

                                            if (!item) {
                                                // Placeholder
                                                return (
                                                    <div key={`placeholder-${idx}`} className={`flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-transparent ${opacityClass}`}>
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <span className="flex flex-col items-center justify-center w-8 h-8 rounded-lg text-sm font-black flex-shrink-0 bg-gray-200 text-gray-400">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="font-bold text-gray-400 block text-base">—</span>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 pl-2">
                                                            <span className="block font-black text-lg text-gray-300">—</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Real Item
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex justify-between items-center p-3 rounded-xl transition-colors border border-transparent ${idx < 3 ? 'bg-yellow-50/50 border-yellow-100 hover:bg-yellow-50' : 'hover:bg-gray-50'} ${opacityClass}`}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {/* Rank Badge */}
                                                        <span className={`flex flex-col items-center justify-center w-8 h-8 rounded-lg text-sm font-black flex-shrink-0 ${idx === 0 ? 'bg-yellow-400 text-white shadow-sm' :
                                                            idx === 1 ? 'bg-gray-300 text-white' :
                                                                idx === 2 ? 'bg-orange-300 text-white' :
                                                                    'bg-gray-100 text-gray-400'
                                                            }`}>
                                                            {item.rank}
                                                        </span>

                                                        {/* Name */}
                                                        <div className="min-w-0">
                                                            <span className="font-bold text-gray-700 truncate block text-base">
                                                                {type === 'lottery' ? item.name : (type === 'region' ? item.location : `#${item.ticketNo}`)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="text-right flex-shrink-0 pl-2">
                                                        <span className={`block font-black text-lg ${getValueColor(item)}`}>
                                                            {renderValue(item)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                                            {renderSubInfo(item)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            尚無數據
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
