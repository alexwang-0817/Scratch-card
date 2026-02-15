

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
import mockLotteries from '../data/lotteries'; // Import lotteries.js

export function useScratchStats() {
    const [stats, setStats] = useState({
        totalCount: 0,
        totalWinAmount: 0,
        lotteryStats: {},
        metaphysics: { // Add default structure
            topProfitable: [],
            topCP: [],
            topLotteries: [],
            topRegions: [],
            allProfitable: [],
            allCP: [],
            allLotteries: [],
            allRegions: []
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
                        count: 0, win: 0, spent: 0, reports: 0,
                        winCount: 0, // Track number of winning tickets
                        prizeDist: {} // Track distribution of prizes
                    };
                }
                if (isPast && !lsPast[lotteryId]) {
                    const lottery = mockLotteries.find(l => l.id === lotteryId);
                    lsPast[lotteryId] = {
                        id: lotteryId,
                        count: 0, win: 0, spent: 0,
                        winCount: 0,
                        prizeDist: {}
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

                if (dist > 0) {
                    ls[lotteryId].winCount += count; // Assuming 'count' tickets all won 'dist' total? 
                    // WAIT. 'dist' is 'win_amount' from data.
                    // If submission has count=1, dist is separate.
                    // If count > 1 (bulk), dist is total? Or per ticket?
                    // Submission form says: entries have items. one item one ticket.
                    // `result.push({ ..., count: 1, win_amount: ... })`.
                    // So usually count is 1.
                    // If count > 1, and win_amount > 0, does it mean ALL won?
                    // User submission flow implies 1 ticket per entry if using detail mode.
                    // So assuming dist > 0 means it's a winning ticket.
                    if (!ls[lotteryId].prizeDist[dist]) ls[lotteryId].prizeDist[dist] = 0;
                    ls[lotteryId].prizeDist[dist] += count;
                } else {
                    // Record $0 wins (losses) in prizeDist too?
                    if (!ls[lotteryId].prizeDist[0]) ls[lotteryId].prizeDist[0] = 0;
                    ls[lotteryId].prizeDist[0] += count; // 0 amount
                }

                // Update Past Lottery Stats
                if (isPast) {
                    lsPast[lotteryId].count += count;
                    lsPast[lotteryId].win += dist;
                    lsPast[lotteryId].spent += (price * count);
                    if (dist > 0) {
                        lsPast[lotteryId].winCount += count;
                    }
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
                        regionMap[location] = { location, totalWin: 0, totalSpent: 0, count: 0 };
                    }
                    regionMap[location].totalWin += dist;
                    regionMap[location].totalSpent += (price * count);
                    regionMap[location].count += count;
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

            // --- Helper to calculate rankings with trend ---
            const getRankedList = (items, sortFn, pastRankMap, idKey = 'ticketNo') => {
                // 1. Sort
                const sorted = [...items].sort(sortFn);

                // 2. Map with Trend
                return sorted.map((item, index) => {
                    const currentRank = index + 1;
                    const id = item[idKey] || item.id; // handle ticketNo or lottery id
                    const pastRank = pastRankMap ? pastRankMap.get(id) : undefined;

                    let trend = 0;
                    if (pastRank) {
                        trend = pastRank - currentRank;
                    } else {
                        trend = 999; // New
                    }
                    return { ...item, trend, rank: currentRank };
                });
            };

            // 1. Profitable Numbers
            const sortProfitable = (a, b) => b.totalWin - a.totalWin;
            const pastRankProfitable = getRankMap(ticketArrayPast, sortProfitable);
            const allProfitable = getRankedList(ticketArray, sortProfitable, pastRankProfitable, 'ticketNo');
            const topProfitable = allProfitable.slice(0, 3);

            // 2. Best CP Numbers
            const sortCP = (a, b) => {
                const roiA = a.totalSpent > 0 ? (a.totalWin / a.totalSpent) : 0;
                const roiB = b.totalSpent > 0 ? (b.totalWin / b.totalSpent) : 0;
                return roiB - roiA;
            };
            const pastRankCP = getRankMap(ticketArrayPast, sortCP);
            // Pre-calculate ROI for all items before ranking
            const ticketArrayWithROI = ticketArray
                .filter(t => t.totalSpent > 0)
                .map(t => ({ ...t, roi: (t.totalWin / t.totalSpent) * 100 }));

            const allCP = getRankedList(ticketArrayWithROI, (a, b) => b.roi - a.roi, pastRankCP, 'ticketNo');
            const topCP = allCP.slice(0, 3);

            // 3. Profitable Lotteries
            const sortLotteryROI = (a, b) => {
                const roiA = a.spent > 0 ? (a.win / a.spent) : 0;
                const roiB = b.spent > 0 ? (b.win / b.spent) : 0;
                return roiB - roiA;
            };
            const pastRankLottery = getRankMap(lsArrayPast, sortLotteryROI);

            const lsArrayWithROI = lsArray
                .filter(l => l.spent > 0)
                .map(l => ({ ...l, roi: (l.win / l.spent) * 100 }));

            const allLotteries = getRankedList(lsArrayWithROI, (a, b) => b.roi - a.roi, pastRankLottery, 'id');
            const topLotteries = allLotteries.slice(0, 3);

            // 4. Top Regions
            const allRegions = getRankedList(Object.values(regionMap), (a, b) => b.totalWin - a.totalWin, undefined, 'location');
            const topRegions = allRegions.slice(0, 3);

            setStats({
                totalCount: tc,
                totalWinAmount: tw,
                lotteryStats: ls,
                metaphysics: {
                    topProfitable,
                    topCP,
                    topLotteries,
                    topRegions,
                    // Full Lists for Detail View
                    allProfitable,
                    allCP,
                    allLotteries,
                    allRegions
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

