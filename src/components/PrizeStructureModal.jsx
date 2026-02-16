
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function PrizeStructureModal({ lottery, stats, isOpen, onClose }) {
    const [showReal, setShowReal] = useState(true);
    const [showOfficial, setShowOfficial] = useState(false);

    const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' | 'frequency'

    // Lock body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!lottery) return null;

    // Use reported stats or default to 0
    const reportedStats = stats || { count: 0, win: 0, spent: 0, winCount: 0, prizeDist: {}, ticketStats: {} };
    const totalSpent = reportedStats.spent;
    const totalWin = reportedStats.win;
    const roi = totalSpent > 0 ? (totalWin / totalSpent) * 100 : 0;
    const winRate = reportedStats.count > 0 ? (reportedStats.winCount / reportedStats.count) * 100 : 0;

    const toggleReal = () => setShowReal(!showReal);
    const toggleOfficial = () => setShowOfficial(!showOfficial);

    // --- Chart Logic ---
    // 1. Pie Chart Data (Prize Distribution)
    // --- Chart Logic ---
    // 1. Pie Chart Data (Prize Distribution)
    const pieData = React.useMemo(() => {
        const dist = reportedStats.prizeDist || {};
        const total = Object.values(dist).reduce((a, b) => a + b, 0);

        // Prepare all possible prize outcomes including 0
        const allPrizes = [
            ...(lottery.prizes || []).map(p => ({ amount: p.amount })),
            { amount: 0 }
        ];

        // Map to data objects
        const data = allPrizes.map(p => {
            const count = dist[p.amount] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return {
                amount: p.amount,
                count,
                percentage,
                hasData: count > 0 // Flag to check if data exists
            };
        }).sort((a, b) => b.amount - a.amount);

        // Colors
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
        return data.map((item, index) => ({
            ...item,
            // Grey if 0 amount OR no data
            color: (item.amount === 0 || !item.hasData) ? '#cbd5e1' : colors[index % colors.length]
        }));
    }, [reportedStats.prizeDist, lottery.prizes]);

    // 2. Bar Chart Data (Frequent Winning Tickets)
    const barData = React.useMemo(() => {
        const tStats = reportedStats.ticketStats || {};
        const realData = Object.entries(tStats)
            .map(([ticketNo, count]) => ({ ticketNo, count, isPlaceholder: false }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Pad to 10 items
        const paddedData = [...realData];
        while (paddedData.length < 10) {
            paddedData.push({ ticketNo: '-', count: 0, isPlaceholder: true });
        }
        return paddedData;
    }, [reportedStats.ticketStats]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-xl pointer-events-auto">
                            {/* Fixed Height: h-[85vh] */}
                            <GlassCard whileHover={{}} className="bg-white border-gray-200 shadow-2xl h-[85vh] flex flex-col transform-none">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-0 border-b border-gray-100 p-4 flex-shrink-0 bg-white z-10 rounded-t-[10px]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <Trophy className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{lottery.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                每張 {lottery.price} 元 | 已回報購買 {reportedStats.count.toLocaleString()} 張
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Scrollable Content Area */}
                                <div className="overflow-y-auto flex-1 custom-scrollbar px-3 py-4 pt-2">

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">中獎總金額</div>
                                            <div className="text-lg font-bold text-gray-800">${totalWin.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">中獎機率</div>
                                            <div className={`text-lg font-bold ${winRate > 50 ? 'text-green-600' : winRate >= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                {winRate.toFixed(1)}%
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                (官方: {lottery.win_rate}%)
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">回本率</div>
                                            <div className={`text-lg font-bold ${roi > 50 ? 'text-green-600' : roi >= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                {roi.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts Section */}
                                    <div className="mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        {/* Tabs */}
                                        <div className="flex bg-gray-200/50 p-1 rounded-lg mb-3">
                                            <button
                                                onClick={() => setActiveTab('distribution')}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'distribution' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                中獎金額分佈
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('frequency')}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'frequency' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                經常中獎編號
                                            </button>
                                        </div>

                                        {/* Chart Content */}
                                        <div className="h-64 relative flex items-center justify-center">
                                            {activeTab === 'distribution' ? (
                                                <div className="relative w-56 h-56">
                                                    {/* Pie Chart (Conic Gradient) */}
                                                    <div className="w-full h-full rounded-full relative"
                                                        style={{
                                                            background: Object.values(reportedStats.prizeDist || {}).reduce((a, b) => a + b, 0) > 0
                                                                ? `conic-gradient(${pieData.reduce((acc, item, idx) => {
                                                                    const prevDeg = idx === 0 ? 0 : acc.currentDeg;
                                                                    const deg = (item.percentage / 100) * 360;
                                                                    const endDeg = prevDeg + deg;
                                                                    acc.stops.push(`${item.color} ${prevDeg}deg ${endDeg}deg`);
                                                                    acc.currentDeg = endDeg;
                                                                    return acc;
                                                                }, { stops: [], currentDeg: 0 }).stops.join(', ')})`
                                                                : '#e5e7eb'
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 rounded-full"></div>
                                                    </div>

                                                    {/* Labels Overlay */}
                                                    {Object.values(reportedStats.prizeDist || {}).reduce((a, b) => a + b, 0) > 0 && (
                                                        <div className="absolute inset-0 pointer-events-none">
                                                            {(() => {
                                                                let currentAngle = 0;
                                                                return pieData.map((item, idx) => {
                                                                    if (!item.hasData || item.percentage < 3) {
                                                                        currentAngle += (item.percentage / 100) * 360;
                                                                        return null; // Skip small or empty slices
                                                                    }

                                                                    const sliceAngle = (item.percentage / 100) * 360;
                                                                    const midAngle = currentAngle + sliceAngle / 2;
                                                                    currentAngle += sliceAngle;

                                                                    // Convert to Radians (CSS 0deg is -90deg trig)
                                                                    // Formula: rad = (midAngle - 90) * PI / 180
                                                                    const rad = (midAngle - 90) * (Math.PI / 180);

                                                                    // Position at 65% radius
                                                                    const xPos = 50 + (32 * Math.cos(rad));
                                                                    const yPos = 50 + (32 * Math.sin(rad));

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className="absolute flex flex-col items-center justify-center text-center transform -translate-x-1/2 -translate-y-1/2"
                                                                            style={{ left: `${xPos}%`, top: `${yPos}%` }}
                                                                        >
                                                                            <span className="text-[10px] font-bold text-white drop-shadow-md whitespace-nowrap px-1 py-0.5 rounded bg-black/20 backdrop-blur-[1px]">
                                                                                {item.amount === 0 ? '未中' : `$${item.amount}`}
                                                                            </span>
                                                                            {item.percentage > 10 && (
                                                                                <span className="text-[9px] text-white/90 drop-shadow-md">
                                                                                    {item.percentage.toFixed(0)}%
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}

                                                    {/* Empty State Label */}
                                                    {Object.values(reportedStats.prizeDist || {}).reduce((a, b) => a + b, 0) === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bold">
                                                            尚無數據
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex items-end justify-between gap-1 px-1">
                                                    {barData.map((item, idx) => {
                                                        const maxCount = Math.max(...barData.filter(d => !d.isPlaceholder).map(d => d.count)) || 1;
                                                        // Max bar height is 50% of container
                                                        const heightPercent = item.isPlaceholder ? 0 : (item.count / maxCount) * 50;

                                                        return (
                                                            <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                                                                {/* Tooltip */}
                                                                {!item.isPlaceholder && (
                                                                    <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                        {item.count}次
                                                                    </div>
                                                                )}

                                                                {/* Label for count (Optional, if users want to see numbers without hover) */}
                                                                {!item.isPlaceholder && (
                                                                    <div className="text-[10px] text-gray-500 font-bold mb-0.5">{item.count}</div>
                                                                )}

                                                                {/* Bar */}
                                                                <div
                                                                    className={`w-full rounded-t-sm transition-all relative ${item.isPlaceholder ? 'bg-gray-200' : 'bg-blue-500 hover:bg-blue-600'}`}
                                                                    style={{
                                                                        height: item.isPlaceholder ? '4px' : `${heightPercent}%`,
                                                                        minHeight: '4px'
                                                                    }}
                                                                ></div>

                                                                {/* Label */}
                                                                <div className="text-[10px] text-gray-400 mt-1 font-mono text-center w-full truncate border-t border-transparent pt-1">
                                                                    {item.ticketNo}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table 1: Real Stats */}
                                    <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
                                        <button
                                            onClick={toggleReal}
                                            className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700"
                                        >
                                            真實回報統計
                                            {showReal ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {showReal && (
                                            <div className="border-t border-gray-100">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-white text-xs uppercase text-gray-400">
                                                        <tr>
                                                            <th className="px-4 py-2 font-semibold">獎項</th>
                                                            <th className="px-4 py-2 font-semibold text-right">張數</th>
                                                            <th className="px-4 py-2 font-semibold text-right">機率</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {lottery.prizes && lottery.prizes.length > 0 ? (
                                                            lottery.prizes.map((prize, idx) => {
                                                                const count = reportedStats.prizeDist ? (reportedStats.prizeDist[prize.amount] || 0) : 0;
                                                                const probability = reportedStats.count > 0 ? (count / reportedStats.count) * 100 : 0;
                                                                return (
                                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="px-4 py-2 font-medium text-gray-900">NT${prize.amount.toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">{count.toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-500">{probability === 0 ? "-" : (probability < 0.1 ? "< 0.1%" : `${probability.toFixed(1)}%`)}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        ) : (
                                                            <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-400">無資料</td></tr>
                                                        )}
                                                        {/* Add Miss row */}
                                                        <tr className="hover:bg-gray-50 transition-colors bg-gray-50/50">
                                                            <td className="px-4 py-2 font-medium text-gray-500">未中獎 ($0)</td>
                                                            <td className="px-4 py-2 text-right text-gray-600">{(reportedStats.prizeDist?.[0] || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-2 text-right text-gray-500">
                                                                {reportedStats.count > 0 ? ((reportedStats.prizeDist?.[0] || 0) / reportedStats.count * 100).toFixed(1) : 0}%
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Table 2: Official Stats */}
                                    <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
                                        <button
                                            onClick={toggleOfficial}
                                            className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700"
                                        >
                                            官方獎金結構
                                            {showOfficial ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {showOfficial && (
                                            <div className="border-t border-gray-100">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-white text-xs uppercase text-gray-400">
                                                        <tr>
                                                            <th className="px-4 py-2 font-semibold">獎項</th>
                                                            <th className="px-4 py-2 font-semibold text-right">總數</th>
                                                            <th className="px-4 py-2 font-semibold text-right">機率</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {lottery.prizes && lottery.prizes.length > 0 ? (
                                                            lottery.prizes.map((prize, idx) => {
                                                                const probability = (prize.count / lottery.total_tickets) * 100;
                                                                return (
                                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="px-4 py-2 font-medium text-gray-900">NT${prize.amount.toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">{prize.count.toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-500">{probability < 0.01 ? "< 0.01%" : `${probability.toFixed(2)}%`}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        ) : (
                                                            <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-400">無資料</td></tr>
                                                        )}
                                                    </tbody>
                                                    <tfoot className="bg-yellow-50/50 font-semibold text-gray-900 text-xs text-center border-t border-yellow-100">
                                                        <tr>
                                                            <td colSpan="3" className="py-2 text-yellow-700">官方中獎率: {lottery.win_rate}%</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 text-xs text-gray-400 text-center pb-4">
                                        * 真實統計可能因樣本數不足產生偏差，僅供參考。
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
