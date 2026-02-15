import React from 'react';
import { GlassCard } from './GlassCard';
import { Sparkles, TrendingUp, DollarSign, Trophy, MapPin, TrendingDown, Minus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function MetaphysicsReveal({ stats }) {
    const { metaphysics } = stats;

    if (!metaphysics || (metaphysics.topProfitable.length === 0 && metaphysics.topCP.length === 0)) {
        return null;
    }

    return (
        <GlassCard whileHover={{}} className="mt-8 p-6 bg-white/80 backdrop-blur-md border border-purple-200/50 shadow-xl relative overflow-hidden w-full">
            <h3 className="text-xl font-black text-purple-900 mb-6 flex items-center gap-2 relative z-10">
                玄學開獎
            </h3>

            {/* Grid Layout: Mobile 2 cols, Desktop 1 col (because sidebar is narrow) or 2 cols if space permits. 
                User asked for "side by side on mobile". 
                I will use grid-cols-2 on mobile. 
                On desktop, the sidebar is narrow (col-span-4 out of 12). 2 cols might be too squeezed. 
                But user complained about text overflow. 
                So 1 col on desktop might be safer? 
                Or user wants the *card itself* to be wider. 
                I will stick to grid-cols-2 for mobile, and grid-cols-1 for desktop to give more space for text, 
                OR grid-cols-2 but carefully styled.
                Actually, "兩組、兩組統計資料並排" refers to the 4 categories (Profit, CP, Type, Region).
                So the *sections* should be 2x2 on mobile.
            */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 relative z-10">

                {/* Helper for rendering ranking list with emphasis on 1st place */}
                {renderCategoryBlock(metaphysics.topProfitable, "最賺號碼", DollarSign, "from-yellow-50 to-orange-50", "border-orange-100", "text-orange-800", "bg-orange-500", "bg-orange-100", "text-red-600")}

                {renderCategoryBlock(metaphysics.topCP, "CP值之王", TrendingUp, "from-purple-50 to-pink-50", "border-purple-100", "text-purple-800", "bg-purple-500", "bg-purple-100", "text-gray-800", true)}

                {renderCategoryBlock(metaphysics.topLotteries, "最賺款式", Trophy, "from-blue-50 to-cyan-50", "border-blue-100", "text-blue-800", "bg-blue-500", "bg-blue-100", "text-green-600", true, true)}

                {renderCategoryBlock(metaphysics.topRegions, "最賺地區", MapPin, "from-green-50 to-emerald-50", "border-green-100", "text-green-800", "bg-green-500", "bg-green-100", "text-red-600", false, false, true)}

            </div>

            <p className="text-[10px] text-gray-400 mt-4 text-center">
                * 數據基於所有玩家回報統計，純屬趣味玄學，不代表中獎保證。
            </p>
        </GlassCard>
    );
}

// Helper function to render a category block
function renderCategoryBlock(items, title, Icon, bgGradient, borderColor, titleColor, badgeColor1, badgeColorRest, valueColor, isPercent = false, isLottery = false, isRegion = false) {
    if (!items || items.length === 0) return (
        <div className={`rounded-xl p-3 border ${borderColor} bg-gradient-to-br ${bgGradient} col-span-1`}>
            <h4 className={`font-bold ${titleColor} mb-2 flex items-center gap-1 text-sm`}>
                <Icon className="w-4 h-4" /> {title}
            </h4>
            <p className="text-xs text-gray-400 text-center py-2">尚無數據</p>
        </div>
    );

    const first = items[0];
    const rest = items.slice(1);

    return (
        <div className={`rounded-xl p-3 border ${borderColor} bg-gradient-to-br ${bgGradient} col-span-1 flex flex-col h-full`}>
            {/* Header */}
            <h4 className={`font-bold ${titleColor} mb-3 flex items-center gap-1 text-sm whitespace-nowrap`}>
                <Icon className="w-4 h-4" /> {title}
            </h4>

            {/* 1st Place (Prominent) */}
            <div className="bg-white/80 rounded-lg p-3 border border-white/50 mb-2 shadow-sm flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-bold text-white ${badgeColor1} rounded-br-lg flex items-center gap-1 z-10`}>
                    TOP 1
                </div>


                {/* Main Content */}
                <div className="mt-2 w-full">
                    <span className="block text-2xl font-black text-gray-800 leading-tight truncate w-full">
                        {isLottery ? first.name : (isRegion ? first.location : `#${first.ticketNo}`)}
                    </span>
                    <span className={`block text-lg font-bold ${valueColor} mt-1`}>
                        {isPercent ? `${first.roi.toFixed(0)}%` : `$${first.totalWin ? first.totalWin.toLocaleString() : (first.win ? first.win.toLocaleString() : 0)}`}
                    </span>
                    {/* Sub-info for 1st place */}
                    <span className="text-[10px] text-gray-400 block mt-1">
                        {isLottery ? `${first.count}張` : (isRegion ? `本:$${first.totalSpent.toLocaleString()}` : (isPercent ? `樣本:${first.count}` : ''))}
                    </span>
                </div>
            </div>

            {/* 2nd & 3rd Place (Compact) */}
            <div className="space-y-1.5">
                {rest.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/40 rounded px-2 py-1 text-xs border border-white/30">
                        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                            <span className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${badgeColorRest} ${titleColor.replace('text-', 'text-opacity-80 ')}`}>
                                {index + 2}
                            </span>
                            <span className="font-bold text-gray-700 truncate max-w-[60px]">
                                {isLottery ? item.name : (isRegion ? item.location : `#${item.ticketNo}`)}
                            </span>

                        </div>
                        <span className={`font-bold ${valueColor} flex-shrink-0`}>
                            {isPercent ? `${item.roi.toFixed(0)}%` : `$${item.totalWin ? item.totalWin.toLocaleString() : (item.win ? item.win.toLocaleString() : 0)}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

