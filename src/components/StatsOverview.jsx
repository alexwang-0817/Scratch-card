
import React from 'react';
import { StatItem } from './StatItem';
import { GlassCard } from './GlassCard';
import mockLotteries from '../data/mockLotteries.json';
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
        <GlassCard whileHover={{}} className="w-full text-center relative overflow-hidden mb-8 py-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200">
            {/* Primary Stat: Total Win Amount */}
            <div className="mb-6 relative z-10">
                <h2 className="text-gray-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2">全台中獎總金額</h2>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 font-mono"
                >
                    <StatItem value={totalWin} prefix="" suffix=" $" />
                </motion.div>
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
    );
}
