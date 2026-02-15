

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
            const ticketMap = {}; // Map for ticket statistics
            const regionMap = {}; // Map for region statistics

            snapshot.forEach((doc) => {
                const data = doc.data();
                const count = parseInt(data.count) || 0;
                const dist = parseInt(data.win_amount) || 0;
                const ticketNo = data.ticket_no;
                const location = data.location;
                const lotteryId = data.lottery_id;

                tc += count;
                tw += dist;

                // Existing lottery stats logic (Enhanced for "Most Profitable Lottery Type")
                if (!ls[lotteryId]) {
                    const lottery = mockLotteries.find(l => l.id === lotteryId);
                    const price = lottery ? lottery.price : 0;
                    ls[lotteryId] = {
                        id: lotteryId,
                        name: lottery ? lottery.name : lotteryId,
                        count: 0,
                        win: 0,
                        spent: 0,
                        reports: 0
                    };
                }
                // Get price each time in case it changes, but usually static. Better to get from ls if set.
                // For simple accumulation:
                const lottery = mockLotteries.find(l => l.id === lotteryId);
                const price = lottery ? lottery.price : 0;

                ls[lotteryId].count += count;
                ls[lotteryId].win += dist;
                ls[lotteryId].spent += (price * count);
                ls[lotteryId].reports += 1;

                // New Metaphysics Logic (Ticket Statistics)
                if (ticketNo) {
                    if (!ticketMap[ticketNo]) {
                        ticketMap[ticketNo] = { ticketNo, totalWin: 0, totalSpent: 0, count: 0 };
                    }
                    ticketMap[ticketNo].totalWin += dist;
                    ticketMap[ticketNo].totalSpent += (price * count);
                    ticketMap[ticketNo].count += count;
                }

                // Region Statistics
                if (location) {
                    if (!regionMap[location]) {
                        regionMap[location] = { location, totalWin: 0, totalSpent: 0 };
                    }
                    regionMap[location].totalWin += dist;
                    regionMap[location].totalSpent += (price * count);
                }
            });

            // Calculate Metaphysics Results
            const ticketArray = Object.values(ticketMap);

            // 1. Top Profitable Numbers (Total Win Amount)
            const topProfitable = [...ticketArray]
                .sort((a, b) => b.totalWin - a.totalWin)
                .slice(0, 3);

            // 2. Best CP Numbers (ROI)
            const topCP = [...ticketArray]
                .filter(t => t.totalSpent > 0)
                .map(t => ({ ...t, roi: (t.totalWin / t.totalSpent) * 100 }))
                .sort((a, b) => b.roi - a.roi)
                .slice(0, 3);

            // 3. Top Profitable Lotteries
            const topLotteries = Object.values(ls)
                .filter(l => l.spent > 0)
                .map(l => ({
                    ...l,
                    roi: (l.win / l.spent) * 100
                }))
                .sort((a, b) => b.roi - a.roi) // Sort by ROI? User asked for "Most Profitable Type: count, win, roi". Usually sort by ROI or Win? Let's sort by ROI for "Most Profitable" in context of gambling, or total Win? "最賺" usually means Net Profit or ROI. Let's use ROI as primary sort, but show all stats.
                .slice(0, 3);

            // 4. Top Regions (Total Win Amount)
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

