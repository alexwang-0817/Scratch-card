import React from 'react';
import { GlassCard } from './GlassCard';
import { Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export function MetaphysicsReveal({ stats }) {
    const { metaphysics } = stats;

    if (!metaphysics || (metaphysics.topProfitable.length === 0 && metaphysics.topCP.length === 0)) {
        return null;
    }

    return (
        <GlassCard className="mt-8 p-6 bg-white/80 backdrop-blur-md border border-purple-200/50 shadow-xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-purple-600" />
            </div>

            <h3 className="text-xl font-black text-purple-900 mb-6 flex items-center gap-2 relative z-10">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                玄學開獎
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* 1. Most Profitable Numbers */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        最賺號碼 (前三名)
                    </h4>
                    <div className="space-y-2">
                        {metaphysics.topProfitable.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/60 rounded-lg p-2 border border-orange-100/50">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-orange-200 text-orange-800'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="font-mono font-bold text-gray-800 text-lg">#{item.ticketNo}</span>
                                </div>
                                <span className="font-bold text-red-600">
                                    ${item.totalWin.toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {metaphysics.topProfitable.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-2">尚無數據</p>
                        )}
                    </div>
                </div>

                {/* 2. Best CP Numbers */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        CP值之王 (回報率)
                    </h4>
                    <div className="space-y-2">
                        {metaphysics.topCP.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/60 rounded-lg p-2 border border-purple-100/50">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-purple-500 text-white' : 'bg-purple-200 text-purple-800'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="font-mono font-bold text-gray-800 text-lg">#{item.ticketNo}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-bold ${item.roi >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                                        {item.roi.toFixed(0)}%
                                    </span>
                                    <span className="text-[10px] text-gray-400 block -mt-1">
                                        (樣本:{item.count})
                                    </span>
                                </div>
                            </div>
                        ))}
                        {metaphysics.topCP.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-2">尚無數據</p>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-4 text-center">
                * 數據基於所有玩家回報統計，純屬趣味玄學，不代表中獎保證。
            </p>
        </GlassCard>
    );
}
