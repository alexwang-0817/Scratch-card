
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function PrizeStructureModal({ lottery, isOpen, onClose }) {
    if (!lottery) return null;

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
                            <GlassCard className="bg-white border-gray-200 shadow-2xl max-h-[80vh] flex flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <Trophy className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{lottery.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                每本 {lottery.price} 元 | 發行量 {lottery.total_tickets?.toLocaleString()} 張
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

                                {/* Content - Scrollable Table */}
                                <div className="overflow-y-auto pr-2 custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold text-gray-600 rounded-l-lg">獎項</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600 text-right">中獎張數</th>
                                                <th className="px-4 py-3 font-semibold text-gray-600 text-right rounded-r-lg">機率 (約)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {lottery.prizes && lottery.prizes.length > 0 ? (
                                                lottery.prizes.map((prize, idx) => {
                                                    const probability = (prize.count / lottery.total_tickets) * 100;
                                                    return (
                                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                NT${prize.amount.toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-600">
                                                                {prize.count.toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-500">
                                                                {probability < 0.01 ? "< 0.01%" : `${probability.toFixed(2)}%`}
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                                                        暫無獎金結構資料
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-yellow-50/50 font-semibold text-gray-900 border-t border-yellow-100">
                                            <tr>
                                                <td className="px-4 py-3">總計</td>
                                                <td className="px-4 py-3 text-right">
                                                    {lottery.prizes?.reduce((acc, p) => acc + p.count, 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-yellow-600">
                                                    {lottery.win_rate}%
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    <div className="mt-4 text-xs text-gray-400 text-center">
                                        * 機率僅供參考，實際中獎率以台彩官方公告與實際發行為準。
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
