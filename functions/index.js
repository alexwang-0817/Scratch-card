/**
 * Cloud Functions for Scratch Card Stats Aggregation
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Import lottery data (CommonJS)
const lotteries = require("./lotteries");

// Limit max instances to control costs
setGlobalOptions({ maxInstances: 10 });

/**
 * Trigger: When a new contribution is added to "contributions/{docId}"
 * Action: Update "stats/summary" document with aggregated data.
 */
exports.aggregateStats = onDocumentCreated("contributions/{docId}", async (event) => {
    const newData = event.data.data();
    if (!newData) return;

    const { count, win_amount, lottery_id, ticket_no, location } = newData;

    // Convert string inputs to numbers
    const addCount = parseInt(count) || 0;
    const winAmount = parseInt(win_amount) || 0;

    // Get lottery info for price calculation
    const lottery = lotteries.find(l => l.id === lottery_id);
    const price = lottery ? lottery.price : 0;
    const spentAmount = price * addCount;

    const summaryRef = db.doc("stats/summary");

    try {
        await db.runTransaction(async (transaction) => {
            const summaryDoc = await transaction.get(summaryRef);

            let data = summaryDoc.exists ? summaryDoc.data() : {
                totalCount: 0,
                totalWinAmount: 0,
                lotteryStats: {},
                ticketStats: {},
                regionMap: {}
            };

            // 1. Update Global Totals
            data.totalCount = (data.totalCount || 0) + addCount;
            data.totalWinAmount = (data.totalWinAmount || 0) + winAmount;

            // 2. Update Lottery Stats
            if (!data.lotteryStats) data.lotteryStats = {};
            if (!data.lotteryStats[lottery_id]) {
                data.lotteryStats[lottery_id] = {
                    id: lottery_id,
                    name: lottery ? lottery.name : lottery_id,
                    count: 0,
                    win: 0,
                    spent: 0,
                    reports: 0,
                    winCount: 0,
                    prizeDist: {}
                };
            }

            const ls = data.lotteryStats[lottery_id];
            ls.count += addCount;
            ls.win += winAmount;
            ls.spent += spentAmount;
            ls.reports += 1;

            if (winAmount > 0) {
                ls.winCount += addCount;
                if (!ls.prizeDist) ls.prizeDist = {};
                // Initialize prize key if not exists
                const waKey = winAmount.toString();
                ls.prizeDist[waKey] = (ls.prizeDist[waKey] || 0) + addCount;
            } else {
                if (!ls.prizeDist) ls.prizeDist = {};
                const waKey = "0";
                ls.prizeDist[waKey] = (ls.prizeDist[waKey] || 0) + addCount;
            }

            // Update Ticket Stats for this lottery (for bar chart)
            if (ticket_no && winAmount > 0) {
                if (!ls.ticketStats) ls.ticketStats = {};
                ls.ticketStats[ticket_no] = (ls.ticketStats[ticket_no] || 0) + addCount;
            }

            // 3. Update Metaphysics Data (Simplified Top Lists in Summary)
            // Note: For full metaphysics, we might want separate collections, 
            // but here we can keep simple counters in checking large maps.
            // CAUTION: Firestore document max size is 1MB. 
            // Storing ALL ticket stats or regions here is risky if data grows huge.
            // Strategy: We will store "ticketStats" and "regionMap" in the summary doc for now.
            // If it grows too large, we should split. But for valid tickets (001-100) and regions, it fits.

            // 3.1 Ticket Number Global Stats (Profitable & CP)
            if (ticket_no) {
                if (!data.ticketStats) data.ticketStats = {};
                if (!data.ticketStats[ticket_no]) {
                    data.ticketStats[ticket_no] = {
                        ticketNo: ticket_no,
                        totalWin: 0,
                        totalSpent: 0,
                        count: 0
                    };
                }
                const ts = data.ticketStats[ticket_no];
                ts.totalWin += winAmount;
                ts.totalSpent += spentAmount;
                ts.count += addCount;
            }

            // 3.2 Region Stats
            if (location) {
                if (!data.regionMap) data.regionMap = {};
                if (!data.regionMap[location]) {
                    data.regionMap[location] = {
                        location: location,
                        totalWin: 0,
                        totalSpent: 0,
                        count: 0
                    };
                }
                const rs = data.regionMap[location];
                rs.totalWin += winAmount;
                rs.totalSpent += spentAmount;
                rs.count += addCount;
            }

            // Write back
            transaction.set(summaryRef, data);
        });

        console.log(`Aggregated contribution: ${lottery_id} - ${winAmount}`);
    } catch (error) {
        console.error("Aggregation failed: ", error);
        // We do not re-throw to avoid infinite retry loops on malformed data, 
        // but for critical logic, you might want to.
    }
});
