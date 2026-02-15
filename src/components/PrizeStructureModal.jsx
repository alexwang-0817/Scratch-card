
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function PrizeStructureModal({ lottery, stats, isOpen, onClose }) {
    const [showReal, setShowReal] = useState(true);
    const [showOfficial, setShowOfficial] = useState(false);

    if (!lottery) return null;

    // Use reported stats or default to 0
    const reportedStats = stats || { count: 0, win: 0, spent: 0, winCount: 0, prizeDist: {} };
    const totalSpent = reportedStats.spent;
    const totalWin = reportedStats.win;
    const roi = totalSpent > 0 ? (totalWin / totalSpent) * 100 : 0;
    const winRate = reportedStats.count > 0 ? (reportedStats.winCount / reportedStats.count) * 100 : 0;

    const toggleReal = () => setShowReal(!showReal);
    const toggleOfficial = () => setShowOfficial(!showOfficial);

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
                        <div className="w-full max-w-lg pointer-events-auto">
                            <GlassCard className="bg-white border-gray-200 shadow-2xl max-h-[85vh] flex flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4 flex-shrink-0">
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

                                {/* Summary Stats (Always Visible) */}
                                <div className="grid grid-cols-3 gap-2 mb-4 px-2 flex-shrink-0">
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">中獎總金額</div>
                                        <div className="text-lg font-bold text-gray-800">${totalWin.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">中獎機率</div>
                                        <div className="text-lg font-bold text-blue-600">{winRate.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">回本率</div>
                                        <div className={`text-lg font-bold ${roi >= 100 ? 'text-green-600' : roi >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                                            {roi.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Content - Scrollable Tables */}
                                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">

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

                                    <div className="mt-4 text-xs text-gray-400 text-center">
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
