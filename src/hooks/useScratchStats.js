

import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import mockLotteries from '../data/mockLotteries.json'; // Import mockLotteries

export function useScratchStats() {
    const [stats, setStats] = useState({
        totalCount: 0,
        totalWinAmount: 0,
        lotteryStats: {},
        metaphysics: { // Add default structure
            topProfitable: [],
            topCP: [],
            topLotteries: [],
            topRegions: []
        }
    });
    // const [recentContributions, setRecentContributions] = useState([]); // Unused
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auth & Initial Setup
    useEffect(() => {
        const initAuth = async () => {
            try {
                const userCred = await signInAnonymously(auth);
                setUser(userCred.user);
            } catch (error) {
                console.error("Auth error:", error);
                setError("無法匿名登入：請確認 Firebase Console 已啟用 Anonymous Auth。");
            }
        };
        initAuth();
    }, []);

    // Real-time Data Listener
    useEffect(() => {
        if (!user) return;
        const allQ = query(collection(db, "contributions"));
        const unsubAll = onSnapshot(allQ, (snapshot) => {
            let tc = 0;
            let tw = 0;
            const ls = {};
            const lsPast = {}; // Past stats for Lottery Types
            const ticketMap = {}; // Map for ticket statistics
            const ticketMapPast = {}; // Past stats for Ticket Numbers
            const regionMap = {}; // Map for region statistics

            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);

            snapshot.forEach((doc) => {
                const data = doc.data();
                const count = parseInt(data.count) || 0;
                const dist = parseInt(data.win_amount) || 0;
                const ticketNo = data.ticket_no;
                const location = data.location;
                const lotteryId = data.lottery_id;

                // Handle timestamp (estimate if null for local pending writes)
                const docTime = data.timestamp ? data.timestamp.toMillis() : now;
                const isPast = docTime < oneDayAgo;

                tc += count;
                tw += dist;

                // --- Lottery Stats (Current & Past) ---
                if (!ls[lotteryId]) {
                    const lottery = mockLotteries.find(l => l.id === lotteryId);
                    ls[lotteryId] = {
                        id: lotteryId,
                        name: lottery ? lottery.name : lotteryId,
                        count: 0, win: 0, spent: 0, reports: 0
                    };
                }
                if (isPast && !lsPast[lotteryId]) {
                    const lottery = mockLotteries.find(l => l.id === lotteryId);
                    lsPast[lotteryId] = {
                        id: lotteryId,
                        count: 0, win: 0, spent: 0
                    };
                }

                // Get price
                const lottery = mockLotteries.find(l => l.id === lotteryId);
                const price = lottery ? lottery.price : 0;

                // Update Current Lottery Stats
                ls[lotteryId].count += count;
                ls[lotteryId].win += dist;
                ls[lotteryId].spent += (price * count);
                ls[lotteryId].reports += 1;

                // Update Past Lottery Stats
                if (isPast) {
                    lsPast[lotteryId].count += count;
                    lsPast[lotteryId].win += dist;
                    lsPast[lotteryId].spent += (price * count);
                }

                // --- Ticket Number Stats (Current & Past) ---
                if (ticketNo) {
                    if (!ticketMap[ticketNo]) {
                        ticketMap[ticketNo] = { ticketNo, totalWin: 0, totalSpent: 0, count: 0 };
                    }
                    ticketMap[ticketNo].totalWin += dist;
                    ticketMap[ticketNo].totalSpent += (price * count);
                    ticketMap[ticketNo].count += count;

                    if (isPast) {
                        if (!ticketMapPast[ticketNo]) {
                            ticketMapPast[ticketNo] = { ticketNo, totalWin: 0, totalSpent: 0, count: 0 };
                        }
                        ticketMapPast[ticketNo].totalWin += dist;
                        ticketMapPast[ticketNo].totalSpent += (price * count);
                        ticketMapPast[ticketNo].count += count;
                    }
                }

                // --- Region Stats (Current only for now) ---
                if (location) {
                    if (!regionMap[location]) {
                        regionMap[location] = { location, totalWin: 0, totalSpent: 0 };
                    }
                    regionMap[location].totalWin += dist;
                    regionMap[location].totalSpent += (price * count);
                }
            });

            // --- Helper to calculate rankings ---
            const getRankMap = (items, sortFn) => {
                const sorted = [...items].sort(sortFn);
                const rankMap = new Map();
                sorted.forEach((item, index) => {
                    // Use unique ID (ticketNo or id)
                    rankMap.set(item.ticketNo || item.id, index + 1);
                });
                return rankMap;
            };

            // Calculate Metaphysics Results
            const ticketArray = Object.values(ticketMap);
            const ticketArrayPast = Object.values(ticketMapPast);

            const lsArray = Object.values(ls);
            const lsArrayPast = Object.values(lsPast);

            // 1. Top Profitable Numbers (Trend Calculation)
            const sortProfitable = (a, b) => b.totalWin - a.totalWin;
            const pastRankProfitable = getRankMap(ticketArrayPast, sortProfitable);

            const topProfitable = [...ticketArray]
                .sort(sortProfitable)
                .slice(0, 3)
                .map((item, index) => {
                    const currentRank = index + 1;
                    const pastRank = pastRankProfitable.get(item.ticketNo);
                    let trend = 0; // 0 = same, >0 = up, <0 = down. 
                    // Wait, usually Trend + means Position Improved (Rank number decreased).
                    // e.g. Rank 5 -> Rank 1. Diff is 4.
                    // So Trend = PastRank - CurrentRank.
                    if (pastRank) {
                        trend = pastRank - currentRank;
                    } else {
                        trend = 999; // New/Skyrocketed
                    }
                    return { ...item, trend };
                });


            // 2. Best CP Numbers (Trend)
            const sortCP = (a, b) => {
                const roiA = a.totalSpent > 0 ? (a.totalWin / a.totalSpent) : 0;
                const roiB = b.totalSpent > 0 ? (b.totalWin / b.totalSpent) : 0;
                return roiB - roiA;
            };
            // Note: ticketArrayPast items need 'roi' calculated for sorting? No, sort logic handles it?
            // sortCP calculates ROI inline.
            // But ticketArray items in `topCP` need ROI property for display?
            // The previous logic added `roi` property.

            const pastRankCP = getRankMap(ticketArrayPast, sortCP);

            const topCP = [...ticketArray]
                .filter(t => t.totalSpent > 0)
                .map(t => ({ ...t, roi: (t.totalWin / t.totalSpent) * 100 }))
                .sort((a, b) => b.roi - a.roi) // Sort using pre-calculated ROI to match display
                .slice(0, 3)
                .map((item, index) => {
                    const currentRank = index + 1;
                    const pastRank = pastRankCP.get(item.ticketNo);
                    let trend = 0;
                    if (pastRank) {
                        trend = pastRank - currentRank;
                    } else {
                        trend = 999;
                    }
                    return { ...item, trend };
                });

            // 3. Top Profitable Lotteries (Trend)
            const sortLotteryROI = (a, b) => {
                const roiA = a.spent > 0 ? (a.win / a.spent) : 0;
                const roiB = b.spent > 0 ? (b.win / b.spent) : 0;
                return roiB - roiA;
            };
            const pastRankLottery = getRankMap(lsArrayPast, sortLotteryROI);

            const topLotteries = lsArray
                .filter(l => l.spent > 0)
                .map(l => ({
                    ...l,
                    roi: (l.win / l.spent) * 100
                }))
                .sort((a, b) => b.roi - a.roi)
                .slice(0, 3)
                .map((item, index) => {
                    const currentRank = index + 1;
                    const pastRank = pastRankLottery.get(item.id);
                    let trend = 0;
                    if (pastRank) {
                        trend = pastRank - currentRank;
                    } else {
                        trend = 999;
                    }
                    return { ...item, trend };
                });

            // 4. Top Regions (No Trend required per user request "Number and Type", but harmless? Leave out for simplicity)
            const topRegions = Object.values(regionMap)
                .sort((a, b) => b.totalWin - a.totalWin)
                .slice(0, 3);

            setStats({
                totalCount: tc,
                totalWinAmount: tw,
                lotteryStats: ls,
                metaphysics: {
                    topProfitable,
                    topCP,
                    topLotteries,
                    topRegions
                }
            });
            setLoading(false);
        }, (err) => {
            console.error("Snapshot error:", err);
            if (err.code === 'permission-denied') {
                setError("讀取數據失敗：權限不足。請檢查 Firestore Rules。");
            } else {
                setError(`數據讀取錯誤: ${err.message}`);
            }
            setLoading(false);
        });

        return () => unsubAll();
    }, [user]);

    const submitData = async (data) => {
        if (!user) {
            setError("未登入，無法提交。");
            return;
        }

        try {
            // Save nickname and location
            localStorage.setItem('scratch_nickname', data.nickname);
            localStorage.setItem('scratch_location', data.location);

            await addDoc(collection(db, "contributions"), {
                ...data,
                // Ensure ticket_no is recorded (passed from SubmissionForm)
                ticket_no: data.ticket_no || null,
                uid: user.uid,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Submit error:", err);
            if (err.code === 'permission-denied') {
                alert("提交失敗：權限不足 (Firestore Rules)。");
            } else {
                alert("提交失敗：" + err.message);
            }
            throw err; // Re-throw to let component know
        }
    };

    return { stats, submitData, loading, user, error };
}

