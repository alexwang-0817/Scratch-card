import React, { useState } from 'react';
import { StatItem } from './StatItem';
import { GlassCard } from './GlassCard';
import mockLotteries from '../data/lotteries';
import { motion, AnimatePresence } from 'framer-motion';
import { PrizeStructureModal } from './PrizeStructureModal';
import { ChevronRight, Flame } from 'lucide-react';
import { LotteryAvatar } from './LotteryAvatar';

export function Dashboard({ stats, loading }) {
    const [selectedLottery, setSelectedLottery] = useState(null);

    // Find the max count to determine the most popular lottery
    const maxCount = React.useMemo(() => {
        if (!stats || !stats.lotteryStats) return 0;
        return Math.max(...Object.values(stats.lotteryStats).map(s => s.count), 0);
    }, [stats]);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
        </div>
    );

    return (
        <>
            <div className="w-full space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-yellow-500 pl-3">各款刮刮樂戰況</h3>
                <p className="text-xs text-gray-400 mb-2">點擊卡片查看詳細獎金結構與機率</p>

                <div className="grid grid-cols-1 gap-4">
                    {mockLotteries.map((l, index) => {
                        const lStat = stats.lotteryStats[l.id] || { count: 0, win: 0, reports: 0, winCount: 0 };
                        const spent = lStat.count * l.price;
                        // const lRoi = spent > 0 ? (lStat.win / spent) * 100 : 0; // Deprecated
                        const lWinRate = lStat.count > 0 ? (lStat.winCount / lStat.count) * 100 : 0;

                        // Actual Return Rate (ROI) based on reported stats
                        const actualRoi = spent > 0 ? (lStat.win / spent) * 100 : 0;

                        const isMostPopular = maxCount > 0 && lStat.count === maxCount;

                        return (
                            <div
                                key={l.id}
                                onClick={() => setSelectedLottery(l)}
                                className="p-4 flex flex-row items-center gap-4 hover:shadow-lg hover:border-yellow-200 transition-all bg-white border border-gray-100 rounded-xl cursor-pointer group"
                            >
                                {/* Avatar */}
                                <LotteryAvatar
                                    name={l.name}
                                    price={l.price}
                                    className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg shadow-inner group-hover:scale-105 transition-transform duration-300 text-2xl md:text-3xl"
                                />

                                {/* Info */}
                                <div className="flex-grow text-left">
                                    <h4 className="font-bold text-lg text-gray-800 relative inline-flex items-center gap-2 group-hover:text-yellow-600 transition-colors">
                                        {l.name}
                                        {isMostPopular && (
                                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                                        )}
                                    </h4>
                                    <div className="mt-1">
                                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 group-hover:border-yellow-100 group-hover:bg-yellow-50">${l.price}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap justify-start gap-3">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> 總張數: {lStat.count}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex flex-col items-end min-w-[90px] md:min-w-[130px] bg-gray-50 p-2 md:p-3 rounded-lg group-hover:bg-yellow-50/30 transition-colors">
                                    <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold group-hover:text-yellow-600/70">中獎率</div>
                                    {lStat.count === 0 ? (
                                        <div className="text-xl md:text-2xl font-black text-gray-300">
                                            -
                                        </div>
                                    ) : (
                                        <div className={`text-xl md:text-2xl font-black ${lWinRate > 50 ? 'text-green-600' :
                                            lWinRate >= 30 ? 'text-yellow-500' :
                                                'text-gray-400'
                                            }`}>
                                            {lWinRate.toFixed(1)}%
                                        </div>
                                    )}
                                    <div className="text-[10px] md:text-xs text-gray-400 mt-1 flex items-center justify-end gap-1 w-full">
                                        <span className="whitespace-nowrap">回本率: {lStat.count > 0 ? `${actualRoi.toFixed(1)}%` : '-'}</span>
                                        <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-all hidden md:block" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLottery && (
                <PrizeStructureModal
                    lottery={selectedLottery}
                    stats={selectedLottery ? (stats.lotteryStats[selectedLottery.id] || { count: 0, win: 0, spent: 0, reports: 0, winCount: 0, prizeDist: {}, ticketStats: {} }) : null}
                    isOpen={!!selectedLottery}
                    onClose={() => setSelectedLottery(null)}
                />
            )}
        </>
    );
}
