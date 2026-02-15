import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, Coins, X, ChevronDown, ChevronUp, Plus, Trash2, Trophy } from 'lucide-react';
import mockLotteries from '../data/lotteries';

export function SubmissionForm({ onSubmit, loading }) {
    // Structure: [{ id, lotteryId, expanded, items: [{ id, ticketNo: '', winAmount: '' }] }]
    const [entries, setEntries] = useState(() => [{
        id: Date.now(),
        lotteryId: '',
        expanded: true,
        items: [{ id: Date.now() + 1, ticketNo: '', winAmount: '' }]
    }]);
    const [nickname, setNickname] = useState('');
    const [location, setLocation] = useState(''); // Add location state
    const [submitted, setSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem('scratch_nickname');
        const savedLocation = localStorage.getItem('scratch_location'); // Restore location
        if (savedNickname) setNickname(savedNickname);
        if (savedLocation) setLocation(savedLocation);
    }, []);

    // --- Entry (Lottery Type) Management ---
    const handleAddEntry = () => {
        setEntries([
            ...entries,
            {
                id: Date.now(),
                lotteryId: '',
                expanded: true,
                items: [{ id: Date.now() + 1, ticketNo: '', winAmount: '' }]
            }
        ]);
    };

    const handleRemoveEntry = (id) => {
        if (entries.length > 1) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const toggleExpand = (id) => {
        setEntries(entries.map(e => e.id === id ? { ...e, expanded: !e.expanded } : e));
    };

    const updateEntryLottery = (id, lotteryId) => {
        setEntries(entries.map(e => e.id === id ? { ...e, lotteryId } : e));
    };

    // --- Item (Ticket & Win) Management ---
    const handleAddItem = (entryId) => {
        setEntries(entries.map(e => {
            if (e.id === entryId) {
                return {
                    ...e,
                    items: [...e.items, { id: Date.now(), ticketNo: '', winAmount: '' }]
                };
            }
            return e;
        }));
    };

    const handleRemoveItem = (entryId, itemId) => {
        setEntries(entries.map(e => {
            if (e.id === entryId && e.items.length > 1) {
                return {
                    ...e,
                    items: e.items.filter(item => item.id !== itemId)
                };
            }
            return e;
        }));
    };

    const updateItem = (entryId, itemId, field, value) => {
        setEntries(entries.map(e => {
            if (e.id === entryId) {
                return {
                    ...e,
                    items: e.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
                };
            }
            return e;
        }));
    };

    // --- Summary Calculation ---
    const summary = entries.reduce((acc, entry) => {
        const lottery = mockLotteries.find(l => l.id === entry.lotteryId);
        const price = lottery ? lottery.price : 0;

        entry.items.forEach(item => {
            const win = parseInt(item.winAmount) || 0;
            if (entry.lotteryId) {
                acc.totalTickets += 1;
                acc.totalWin += win;
                acc.totalSpent += price;
            }
        });
        return acc;
    }, { totalTickets: 0, totalWin: 0, totalSpent: 0 });

    const roi = summary.totalSpent > 0 ? (summary.totalWin / summary.totalSpent) * 100 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nickname || !location) return; // Validate location

        // Flatten entries
        const submissions = [];
        entries.forEach(entry => {
            if (!entry.lotteryId) return;
            entry.items.forEach(item => {
                const winAmount = parseInt(item.winAmount) || 0;
                submissions.push({
                    nickname,
                    location, // Add location to submission
                    lottery_id: entry.lotteryId,
                    count: 1,
                    win_amount: winAmount,
                    ticket_no: item.ticketNo ? item.ticketNo.padStart(3, '0') : null,
                });
            });
        });

        if (submissions.length === 0) return;

        try {
            for (const sub of submissions) {
                await onSubmit(sub);
            }

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setIsOpen(false);
                setEntries([{
                    id: Date.now(),
                    lotteryId: '',
                    expanded: true,
                    items: [{ id: Date.now() + 1, ticketNo: '', winAmount: '' }]
                }]);
            }, 3000);
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    // Lock body scroll when modal is open
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

    return (
        <div className="w-full relative">
            {/* 1. Trigger Button in the original block position */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 group mb-4"
            >
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                <span className="text-xl tracking-wide">我要回報戰績</span>
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
            </button>

            {/* 2. The Modal Popup */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
                        >
                            <div className="w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh] h-full">
                                <div className="bg-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-full w-full">

                                    {/* Modal Header */}
                                    <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center flex-shrink-0 z-20 relative">
                                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            回報戰績
                                        </h2>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Form Container (Wraps Body & Footer) */}
                                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden relative">

                                        {/* Modal Body (Scrollable) */}
                                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24">
                                            <AnimatePresence mode="wait">
                                                {submitted ? (
                                                    <GlassCard whileHover={{}} className="w-full relative bg-white border border-gray-200 shadow-sm overflow-hidden">
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex flex-col items-center justify-center py-12 text-center"
                                                        >
                                                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg text-white">
                                                                <Check className="w-8 h-8" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-800 mb-2">感謝回報！</h3>
                                                            <p className="text-gray-500">祝您蛇年行大運，發大財！</p>
                                                        </motion.div>
                                                    </GlassCard>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col space-y-3"
                                                    >
                                                        {/* Nickname & Location Block */}
                                                        <GlassCard whileHover={{}} className="w-full relative bg-white border border-gray-200 shadow-sm overflow-hidden p-4">
                                                            <div className="flex gap-4">
                                                                <div className="flex-1">
                                                                    <label className="block text-sm font-bold text-gray-700 mb-1">發財外號</label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-sm"
                                                                        placeholder="例如：刮刮樂股神"
                                                                        value={nickname}
                                                                        onChange={(e) => setNickname(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="w-1/3">
                                                                    <label className="block text-sm font-bold text-gray-700 mb-1">所在地區</label>
                                                                    <div className="relative">
                                                                        <select
                                                                            required
                                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm appearance-none"
                                                                            value={location}
                                                                            onChange={(e) => setLocation(e.target.value)}
                                                                        >
                                                                            <option value="" disabled>請選擇...</option>
                                                                            <option value="基隆市">基隆市</option>
                                                                            <option value="台北市">台北市</option>
                                                                            <option value="新北市">新北市</option>
                                                                            <option value="桃園市">桃園市</option>
                                                                            <option value="新竹市">新竹市</option>
                                                                            <option value="新竹縣">新竹縣</option>
                                                                            <option value="苗栗縣">苗栗縣</option>
                                                                            <option value="台中市">台中市</option>
                                                                            <option value="彰化縣">彰化縣</option>
                                                                            <option value="南投縣">南投縣</option>
                                                                            <option value="雲林縣">雲林縣</option>
                                                                            <option value="嘉義市">嘉義市</option>
                                                                            <option value="嘉義縣">嘉義縣</option>
                                                                            <option value="台南市">台南市</option>
                                                                            <option value="高雄市">高雄市</option>
                                                                            <option value="屏東縣">屏東縣</option>
                                                                            <option value="宜蘭縣">宜蘭縣</option>
                                                                            <option value="花蓮縣">花蓮縣</option>
                                                                            <option value="台東縣">台東縣</option>
                                                                            <option value="澎湖縣">澎湖縣</option>
                                                                            <option value="金門縣">金門縣</option>
                                                                            <option value="連江縣">連江縣</option>
                                                                        </select>
                                                                        <div className="absolute right-2 top-2.5 pointer-events-none text-gray-400">
                                                                            <ChevronDown className="w-4 h-4" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-2">這個暱稱與地區只會用來當作回報者的區隔，沒有其他實質用途喔～</p>
                                                        </GlassCard>

                                                        {/* Form Block */}
                                                        <GlassCard whileHover={{}} className="w-full relative bg-white border border-gray-200 shadow-sm overflow-hidden">
                                                            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                                                                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                                                                戰績細節
                                                                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                                                            </h2>

                                                            {/* Entries List */}
                                                            <div className="space-y-4 mb-4">
                                                                {entries.map((entry, index) => (
                                                                    <div key={entry.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                                                        {/* Entry Header */}
                                                                        <div
                                                                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                                                            onClick={() => toggleExpand(entry.id)}
                                                                        >
                                                                            <h4 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                                                                {entry.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                                                                中獎回報 #{index + 1}
                                                                                {!entry.expanded && entry.lotteryId && (
                                                                                    <span className="text-xs font-normal text-gray-400 ml-2">
                                                                                        - {mockLotteries.find(l => l.id === entry.lotteryId)?.name}
                                                                                    </span>
                                                                                )}
                                                                            </h4>
                                                                            {entries.length > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleRemoveEntry(entry.id);
                                                                                    }}
                                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Entry Body */}
                                                                        <motion.div
                                                                            initial={false}
                                                                            animate={{ height: entry.expanded ? 'auto' : 0 }}
                                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                                                                <div className="space-y-4">
                                                                                    {/* Lottery Selection */}
                                                                                    <div>
                                                                                        <label className="block text-xs text-gray-500 mb-1">刮刮樂款式</label>
                                                                                        <select
                                                                                            required
                                                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                                                                                            value={entry.lotteryId}
                                                                                            onChange={(e) => updateEntryLottery(entry.id, e.target.value)}
                                                                                        >
                                                                                            <option value="" disabled className="text-gray-400">請選擇款式...</option>
                                                                                            {mockLotteries.map(l => (
                                                                                                <option key={l.id} value={l.id}>
                                                                                                    ${l.price} - {l.name}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>

                                                                                    {/* Items List */}
                                                                                    <div className="space-y-3">
                                                                                        {entry.items.map((item, itemIdx) => (
                                                                                            <div key={item.id} className="flex gap-2 items-end">
                                                                                                {/* Win Amount */}
                                                                                                <div className="flex-[2]">
                                                                                                    <label className="block text-xs text-gray-500 mb-1">中獎金額</label>
                                                                                                    <div className="relative">
                                                                                                        <select
                                                                                                            required
                                                                                                            disabled={!entry.lotteryId}
                                                                                                            className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                                                                                                            value={item.winAmount}
                                                                                                            onChange={(e) => updateItem(entry.id, item.id, 'winAmount', e.target.value)}
                                                                                                        >
                                                                                                            <option value="" disabled>金額...</option>
                                                                                                            <option value="0">未中獎 ($0)</option>
                                                                                                            {entry.lotteryId && mockLotteries.find(l => l.id === entry.lotteryId)?.prizes.map((prize, idx) => (
                                                                                                                <option key={idx} value={prize.amount}>
                                                                                                                    ${prize.amount.toLocaleString()}
                                                                                                                </option>
                                                                                                            ))}
                                                                                                        </select>
                                                                                                        <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                                                                                                            <ChevronDown className="w-4 h-4" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="flex-1">
                                                                                                    <label className="block text-xs text-gray-500 mb-1">
                                                                                                        編號 <span className="text-[10px] text-gray-400 font-normal">(3碼數字)</span>
                                                                                                    </label>
                                                                                                    <div className="relative">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            inputMode="numeric"
                                                                                                            maxLength={3}
                                                                                                            required
                                                                                                            placeholder="001"
                                                                                                            disabled={!entry.lotteryId}
                                                                                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center font-mono text-sm disabled:bg-gray-50 disabled:text-gray-400 appearance-none"
                                                                                                            value={item.ticketNo || ''}
                                                                                                            onChange={(e) => {
                                                                                                                const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                                                                                                                updateItem(entry.id, item.id, 'ticketNo', val);
                                                                                                            }}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Action Buttons */}
                                                                                                <div className="flex gap-1">
                                                                                                    {itemIdx === entry.items.length - 1 && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => handleAddItem(entry.id)}
                                                                                                            className="h-[38px] w-[38px] flex items-center justify-center text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors shadow-sm"
                                                                                                        >
                                                                                                            <Plus className="w-5 h-5" />
                                                                                                        </button>
                                                                                                    )}
                                                                                                    {(entry.items.length > 1) && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => handleRemoveItem(entry.id, item.id)}
                                                                                                            className="h-[38px] w-[38px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Add Type Button */}
                                                            <button
                                                                type="button"
                                                                onClick={handleAddEntry}
                                                                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center justify-center gap-1 text-sm font-bold mb-6"
                                                            >
                                                                新增種類 +
                                                            </button>
                                                        </GlassCard>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Modal Footer (Sticky Bottom) - Only show when not submitted */}
                                        {!submitted && (
                                            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                                                {/* Summary & Submit - Moved from inside scrollable area to here */}
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center border-b border-gray-200 pb-1">本次回報試算</h5>
                                                    <div className="flex items-center text-center justify-between">
                                                        <div className="flex flex-col items-center flex-1 border-r border-gray-200">
                                                            <span className="text-[10px] text-gray-400">總花費</span>
                                                            <span className="text-sm font-bold text-gray-700">${summary.totalSpent.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center flex-[1.5] border-r border-gray-200 px-2">
                                                            <span className="text-[10px] text-gray-400">總中獎</span>
                                                            <span className="text-xl font-black text-red-600">${summary.totalWin.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center flex-1">
                                                            <span className="text-[10px] text-gray-400">回本率</span>
                                                            <span className={`text-sm font-bold ${roi >= 100 ? 'text-green-600' : roi >= 60 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                                {roi.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading ? <Loader2 className="animate-spin" /> : <Coins className="w-5 h-5" />}
                                                    送出戰績
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
