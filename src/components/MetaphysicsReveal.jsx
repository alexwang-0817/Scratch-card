import React, { useState } from 'react';

import { GlassCard } from './GlassCard';
import { Sparkles, TrendingUp, DollarSign, Trophy, MapPin, TrendingDown, Minus, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MetaphysicsModal } from './MetaphysicsModal';

const DESCRIPTIONS = {
    profitable: "計算所有回報資料中，該號碼累積的中獎金額總和。金額越高排名越前。",
    cp: "計算該號碼的投資報酬率 (ROI) = (總中獎金額 / 總花費金額) * 100%。只列出有花費紀錄的號碼。",
    lottery: "計算該款刮刮樂的整體回本率 = (該款總回報獎金 / 該款總回報成本) * 100%。",
    region: "計算該地區累積的中獎金額總和。"
};

export function MetaphysicsReveal({ stats }) {
    const { metaphysics } = stats;
    const [selectedDetails, setSelectedDetails] = useState(null);

    // Data check removed to allow rendering "No Data" state

    const handleOpen = (categoryKey, title, type) => {
        let items = [];
        if (categoryKey === 'topProfitable') items = metaphysics.allProfitable || [];
        if (categoryKey === 'topCP') items = metaphysics.allCP || [];
        if (categoryKey === 'topLotteries') items = metaphysics.allLotteries || [];
        if (categoryKey === 'topRegions') items = metaphysics.allRegions || [];

        setSelectedDetails({
            title,
            description: DESCRIPTIONS[type],
            type,
            items
        });
    };

    return (
        <>
            <div className="relative group rounded-xl p-[2px] overflow-hidden mt-8 w-full shadow-xl bg-white/20">
                <div className="absolute inset-[-200%] animate-[spin-slow_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,#f9a8d4_320deg,#d8b4fe_340deg,#93c5fd_360deg)] opacity-70"></div>
                <GlassCard whileHover={{}} className="p-6 bg-white/95 backdrop-blur-md relative overflow-hidden w-full h-full rounded-[10px]">
                    <h3 className="text-xl font-black text-purple-900 mb-6 flex items-center gap-2 relative z-10">
                        財富密碼
                    </h3>

                    {/* Grid Layout: Mobile 2 cols, Desktop 1 col */}
                    <div className="grid grid-cols-1 gap-4 relative z-10">

                        {/* Helper for rendering ranking list with emphasis on 1st place */}
                        {renderCategoryBlock(
                            metaphysics.topProfitable,
                            "最賺號碼",
                            DollarSign,
                            "from-yellow-50 to-orange-50", "border-orange-100", "text-orange-800", "bg-orange-500", "bg-orange-100", "text-red-600",
                            false, false, false,
                            () => handleOpen('topProfitable', "最賺號碼", 'profitable')
                        )}

                        {renderCategoryBlock(
                            metaphysics.topCP,
                            "最佳CP值",
                            TrendingUp,
                            "from-purple-50 to-pink-50", "border-purple-100", "text-purple-800", "bg-purple-500", "bg-purple-100", "text-gray-800",
                            true, false, false,
                            () => handleOpen('topCP', "最佳CP值", 'cp')
                        )}

                        {renderCategoryBlock(
                            metaphysics.topLotteries,
                            "最賺款式",
                            Trophy,
                            "from-blue-50 to-cyan-50", "border-blue-100", "text-blue-800", "bg-blue-500", "bg-blue-100", "text-green-600",
                            true, true, false,
                            () => handleOpen('topLotteries', "最賺款式", 'lottery')
                        )}

                        {renderCategoryBlock(
                            metaphysics.topRegions,
                            "最賺地區",
                            MapPin,
                            "from-green-50 to-emerald-50", "border-green-100", "text-green-800", "bg-green-500", "bg-green-100", "text-red-600",
                            false, false, true,
                            () => handleOpen('topRegions', "最賺地區", 'region')
                        )}

                    </div>

                    <p className="text-[10px] text-gray-400 mt-4 text-center">
                        * 點擊各區塊可查看完整排名及統計說明。
                    </p>
                </GlassCard >
            </div >

            <MetaphysicsModal
                isOpen={!!selectedDetails}
                onClose={() => setSelectedDetails(null)}
                details={selectedDetails}
            />
        </>
    );
}

// Helper function to render a category block
function renderCategoryBlock(
    items, title, Icon, bgGradient, borderColor, titleColor, badgeColor1, badgeColorRest, valueColor,
    isPercent = false, isLottery = false, isRegion = false,
    onClick
) {
    if (!items || items.length === 0) return (
        <div className={`rounded-xl p-3 border ${borderColor} bg-gradient-to-br ${bgGradient} col-span-1 opacity-50`}>
            <h4 className={`font-bold ${titleColor} mb-2 flex items-center gap-1 text-sm`}>
                <Icon className="w-4 h-4" /> {title}
            </h4>
            <p className="text-xs text-gray-400 text-center py-2">尚無數據</p>
        </div>
    );

    const first = items[0];
    const rest = items.slice(1);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`rounded-xl p-3 border ${borderColor} bg-gradient-to-br ${bgGradient} col-span-1 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow relative group/block`}
        >
            {/* Header */}
            <h4 className={`font-bold ${titleColor} mb-3 flex items-center justify-between text-sm whitespace-nowrap`}>
                <span className="flex items-center gap-1"><Icon className="w-4 h-4" /> {title}</span>
                <ChevronRight className="w-4 h-4 opacity-60 group-hover/block:opacity-100 group-hover/block:translate-x-1 transition-all" />
            </h4>


            {/* 1st Place (Prominent) */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50 mb-2 shadow-sm flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group-hover/block:bg-white/95 transition-colors">
                <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-bold text-white ${badgeColor1} rounded-br-lg flex items-center gap-1 z-10`}>
                    TOP 1
                </div>

                {/* Main Content */}
                <div className="mt-2 w-full">
                    {/* Shimmer Effect Style */}
                    <style>{`
                        @keyframes shimmer-gold {
                            0% { background-position: -200% center; }
                            100% { background-position: 200% center; }
                        }
                        .shimmer-text {
                            background: linear-gradient(90deg, #92400e 25%, #fcd34d 50%, #92400e 75%);
                            background-size: 200% auto;
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            animation: shimmer-gold 3s linear infinite;
                        }
                    `}</style>
                    <span className="block text-2xl font-black leading-tight truncate w-full shimmer-text">
                        {isLottery ? first.name : (isRegion ? first.location : `#${first.ticketNo}`)}
                    </span>
                    <span className="block text-lg font-bold text-gray-900 mt-1">
                        {isPercent ? `${first.roi.toFixed(0)}%` : `$${first.totalWin ? first.totalWin.toLocaleString() : (first.win ? first.win.toLocaleString() : 0)}`}
                    </span>
                    {/* Sub-info for 1st place: Always count */}
                    <span className="text-[10px] text-gray-400 block mt-1">
                        總共 {first.count} 張
                    </span>
                </div>
            </div>

            {/* 2nd & 3rd Place (Compact) */}
            <div className="space-y-1.5">
                {rest.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/40 rounded px-2 py-1 text-xs border border-white/30 group-hover/block:bg-white/60 transition-colors">
                        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                            <span className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${badgeColorRest} ${titleColor.replace('text-', 'text-opacity-80 ')}`}>
                                {index + 2}
                            </span>
                            <span className="font-bold text-gray-700 truncate max-w-[60px]">
                                {isLottery ? item.name : (isRegion ? item.location : `#${item.ticketNo}`)}
                            </span>
                        </div>
                        <span className="font-bold text-gray-500 flex-shrink-0">
                            {isPercent ? `${item.roi.toFixed(0)}%` : `$${item.totalWin ? item.totalWin.toLocaleString() : (item.win ? item.win.toLocaleString() : 0)}`}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
