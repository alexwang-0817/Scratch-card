import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Heart, ShieldCheck, BarChart2, Sparkles, Send, AlertTriangle } from 'lucide-react';

const ONBOARDING_KEY = 'scratch_card_onboarding_completed_v1';

const slides = [
    {
        id: 'intro',
        icon: Heart,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        title: '初心',
        content: '我是一個因為喜歡到處嘗試的人，想說過年到了，賭徒如我也會玩刮刮樂，但是從來都不知道真實的機率是怎麼樣。\n\n為此我製作了這個網頁，希望大家可以一起來把自己的成績分享出來，同時也來看看神秘的東方玄學是不是真的有用！'
    },
    {
        id: 'honesty',
        icon: ShieldCheck,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        title: '誠實至上',
        content: '為了這個網站的數據的真實性（是真的才有趣啊！），還懇請大家都是誠實填寫喔！\n\n每一筆真實的分享，都能幫助大家更接近真相。'
    },
    {
        id: 'feature-1',
        icon: BarChart2,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        title: '即時數據公開',
        content: '匯集全台玩家回報，打破官方數據迷思，找出真正高勝率的隱藏版刮刮樂。看大家都在買什麼、贏多少！'
    },
    {
        id: 'feature-2',
        icon: Sparkles,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        title: '玄學靈感加持',
        content: '探索尾數、地區等神秘規律。哪個尾數最旺？哪個縣市手氣最好？或許你的幸運密碼就藏在這裡。'
    },
    {
        id: 'feature-3',
        icon: Send,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        title: '只需三秒回報',
        content: '簡單幾步即可分享戰績，累積大家的福氣。中獎與否都值得紀錄，讓我們一起建立最真實的資料庫！'
    },
    {
        id: 'disclaimer',
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        title: '免責聲明',
        content: '此網站都是根據各位的誠實回報，可能與真實數據存在偏差，不進行任何投資建議。'
    }
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
        if (!hasOnboarded) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(curr => curr - 1);
        }
    };

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsOpen(false);
    };

    // Swipe Support
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        }
        if (isRightSwipe) {
            handlePrev();
        }
    };

    if (!isOpen) return null;

    const CurrentIcon = slides[currentSlide].icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Header Image/Icon Area */}
                        <div className={`h-32 ${slides[currentSlide].bgColor || 'bg-gray-50'} flex items-center justify-center relative overflow-hidden transition-colors duration-500`}>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-400 via-gray-100 to-transparent" />

                            <motion.div
                                key={`icon-${currentSlide}`}
                                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <CurrentIcon className={`w-16 h-16 ${slides[currentSlide].color}`} />
                            </motion.div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 flex flex-col items-center text-center">
                            <motion.div
                                key={`content-${currentSlide}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                    {slides[currentSlide].title}
                                </h2>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
                                    {slides[currentSlide].content}
                                </div>
                            </motion.div>
                        </div>

                        {/* Footer / Navigation */}
                        <div className="p-6 pt-0 flex flex-col items-center gap-6">
                            {/* Dots Indicator */}
                            <div className="flex gap-2">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-gray-800 w-6' : 'bg-gray-300'}`}
                                    />
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex w-full gap-3">
                                {currentSlide > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transform transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        上一步
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className={`flex-[2] py-3.5 px-6 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-white shadow-lg
                                      ${currentSlide === slides.length - 1
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-orange-200'
                                            : 'bg-gray-900 hover:bg-black shadow-gray-200'
                                        }`}
                                >
                                    {currentSlide === slides.length - 1 ? (
                                        "開刮！"
                                    ) : (
                                        <>下一步 <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
