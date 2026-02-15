

import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    serverTimestamp,
    doc
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

    // Real-time Data Listener (Aggregated Stats)
    useEffect(() => {
        if (!user) return;

        // Listen to the single aggregated document
        const summaryRef = doc(db, "stats", "summary");

        const unsub = onSnapshot(summaryRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : {
                totalCount: 0,
                totalWinAmount: 0,
                lotteryStats: {},
                ticketStats: {},
                regionMap: {}
            };

            // Parse Lottery Stats
            const ls = data.lotteryStats || {};

            // Parse Metaphysics Base Data
            const ticketMap = data.ticketStats || {};
            const regionMap = data.regionMap || {};

            // --- Aggregation Logic for Rankings (Frontend) ---

            // Helper: Sort and Rank
            const getRankedList = (items, sortFn) => {
                return items.sort(sortFn).map((item, index) => ({
                    ...item,
                    rank: index + 1,
                    trend: 0 // History tracking requires a separate "daily snapshot" collection, simplified for performance.
                }));
            };

            // 1. Profitable Numbers (Ticket Stats)
            const ticketArray = Object.values(ticketMap);
            const allProfitable = getRankedList([...ticketArray], (a, b) => b.totalWin - a.totalWin);

            // 2. Best CP Numbers (ROI)
            const ticketArrayWithROI = ticketArray
                .filter(t => t.totalSpent > 0)
                .map(t => ({ ...t, roi: (t.totalWin / t.totalSpent) * 100 }));
            const allCP = getRankedList([...ticketArrayWithROI], (a, b) => b.roi - a.roi);

            // 3. Profitable Lotteries
            const lsArray = Object.values(ls);
            const lsArrayWithROI = lsArray
                .filter(l => l.spent > 0)
                .map(l => ({ ...l, roi: (l.win / l.spent) * 100 }));
            const allLotteries = getRankedList([...lsArrayWithROI], (a, b) => b.roi - a.roi);

            // 4. Top Regions
            const regionArray = Object.values(regionMap);
            const allRegions = getRankedList([...regionArray], (a, b) => b.totalWin - a.totalWin);

            setStats({
                totalCount: data.totalCount || 0,
                totalWinAmount: data.totalWinAmount || 0,
                lotteryStats: ls,
                metaphysics: {
                    topProfitable: allProfitable.slice(0, 3),
                    topCP: allCP.slice(0, 3),
                    topLotteries: allLotteries.slice(0, 3),
                    topRegions: allRegions.slice(0, 3),
                    allProfitable,
                    allCP,
                    allLotteries,
                    allRegions
                }
            });
            setLoading(false);

        }, (err) => {
            console.error("Snapshot error:", err);
            setError(`數據讀取錯誤: ${err.message}`);
            setLoading(false);
        });

        return () => unsub();
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

