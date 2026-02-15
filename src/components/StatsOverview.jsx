
import React from 'react';
import { StatItem } from './StatItem';
import { GlassCard } from './GlassCard';
import mockLotteries from '../data/lotteries';
import { motion } from 'framer-motion';

export function StatsOverview({ stats, loading }) {
    if (loading) return (
        <div className="flex justify-center items-center h-48 text-gray-400 animate-pulse">
            正在加載數據...
        </div>
    );

    const totalSpent = mockLotteries.reduce((acc, l) => {
        const statsForL = stats.lotteryStats[l.id] || { count: 0 };
        return acc + (statsForL.count * l.price);
    }, 0);

    const totalWin = stats.totalWinAmount;
    const roi = totalSpent > 0 ? (totalWin / totalSpent) * 100 : 0;

    return (
        <div className="relative group rounded-xl p-[2px] overflow-hidden mb-8 bg-white/20">
            {/* Rotating colorful beam */}
            <div className="absolute inset-[-200%] animate-[spin-slow_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,#fde047_320deg,#d8b4fe_340deg,#67e8f9_360deg)] opacity-70"></div>

            <GlassCard whileHover={{}} className="w-full text-center relative overflow-hidden py-8 bg-white/95 backdrop-blur-xl rounded-[10px]">
                {/* Primary Stat: Total Win Amount */}
                <div className="mb-6 relative z-10">
                    <h2 className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2">全台中獎總金額</h2>
                    <div
                        className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 font-mono"
                    >
                        <StatItem value={totalWin} prefix="" suffix=" $" />
                    </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-6 mt-8 border-t border-gray-100 pt-8 px-2 md:px-6">

                    {/* Total Count */}
                    <div className="flex flex-col items-center">
                        <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1 font-semibold whitespace-nowrap">全台購買張數</div>
                        <div className="text-lg md:text-3xl font-bold text-gray-800">
                            <StatItem value={stats.totalCount} suffix=" 張" />
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="flex flex-col items-center border-l border-gray-100">
                        <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1 font-semibold whitespace-nowrap">全台購買金額</div>
                        <div className="text-lg md:text-3xl font-bold text-gray-800">
                            <StatItem value={totalSpent} suffix=" $" />
                        </div>
                    </div>

                    {/* ROI */}
                    <div className="flex flex-col items-center border-l border-gray-100">
                        <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1 font-semibold whitespace-nowrap">全台平均回本率</div>
                        <div className={`text-lg md:text-3xl font-bold ${roi >= 60 ? 'text-green-600' : roi >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {roi.toFixed(1)}%
                        </div>
                    </div>

                </div>

                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </GlassCard>
        </div>
    );
}
