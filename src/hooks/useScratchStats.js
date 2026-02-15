

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

export function useScratchStats() {
    const [stats, setStats] = useState({
        totalCount: 0,
        totalWinAmount: 0,
        lotteryStats: {}
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

                // Restore nickname if exists
                const storedNickname = localStorage.getItem('scratch_nickname');
                if (storedNickname) {
                    // Could save to user profile if needed
                }
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

        // The original `q` for recent contributions is commented out in the prompt,
        // so I'll assume it's not needed for the current scope of changes,
        // but keep the comment about it.
        // const q = query(collection(db, "contributions"), orderBy("timestamp", "desc"), limit(100));

        // const unsubscribe = onSnapshot(q, (snapshot) => {
        //     let totalC = 0;
        //     let totalW = 0;
        //     const lStats = {};
        //     const recent = [];

        //     snapshot.forEach((doc) => {
        //         const data = doc.data();
        //         recent.push({ id: doc.id, ...data });
        //     });
        // });

        // Real implementation for totals (Demo scale)
        const allQ = query(collection(db, "contributions"));
        const unsubAll = onSnapshot(allQ, (snapshot) => {
            let tc = 0;
            let tw = 0;
            const ls = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const count = parseInt(data.count) || 0;
                const dist = parseInt(data.win_amount) || 0;

                tc += count;
                tw += dist;

                if (!ls[data.lottery_id]) {
                    ls[data.lottery_id] = { count: 0, win: 0, reports: 0 };
                }
                ls[data.lottery_id].count += count;
                ls[data.lottery_id].win += dist;
                ls[data.lottery_id].reports += 1;
            });

            setStats({
                totalCount: tc,
                totalWinAmount: tw,
                lotteryStats: ls
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
            // Save nickname
            localStorage.setItem('scratch_nickname', data.nickname);

            await addDoc(collection(db, "contributions"), {
                ...data,
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

