import { rankSubmissions, calculateROI, calculatePayouts, calculateReputationChanges, Submission, Stake } from "./resolve";

/**
 * Simple test runner
 */
async function runTests() {
  console.log("🚀 Starting Game Engine Tests...");

  try {
    testRanking();
    testROI();
    testPayouts();
    testReputation();
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  }
}

function testRanking() {
  console.log("🧪 Testing Ranking...");
  
  const submissions: Submission[] = [
    { id: "s1", user_id: "u1", pod_id: "p1", track_name: "T1", artist_name: "A1", created_at: "2026-02-18T10:00:00Z" },
    { id: "s2", user_id: "u2", pod_id: "p1", track_name: "T2", artist_name: "A2", created_at: "2026-02-18T10:05:00Z" },
    { id: "s3", user_id: "u3", pod_id: "p1", track_name: "T3", artist_name: "A3", created_at: "2026-02-18T10:10:00Z" },
  ];

  const stakes: Stake[] = [
    { id: "st1", user_id: "u4", submission_id: "s1", amount: 100 },
    { id: "st2", user_id: "u5", submission_id: "s1", amount: 50 },  // s1 Total: 150 (2 backers)
    { id: "st3", user_id: "u4", submission_id: "s2", amount: 200 }, // s2 Total: 200 (1 backer)
    { id: "st4", user_id: "u6", submission_id: "s3", amount: 150 }, // s3 Total: 150 (1 backer)
  ];

  const ranked = rankSubmissions(submissions, stakes);

  // Checks
  if (ranked[0].id !== "s2") throw new Error("Rank 1 should be s2 (highest score)");
  if (ranked[1].id !== "s1") throw new Error("Rank 2 should be s1 (tie score with s3 but more backers)");
  if (ranked[2].id !== "s3") throw new Error("Rank 3 should be s3");
  
  console.log("   - Ranking & Tie-breakers OK");
}

function testROI() {
  console.log("🧪 Testing ROI...");
  if (calculateROI(1) !== 2.0) throw new Error("Rank 1 ROI should be 2.0");
  if (calculateROI(10) !== 2.0) throw new Error("Rank 10 ROI should be 2.0");
  if (calculateROI(11) !== 1.5) throw new Error("Rank 11 ROI should be 1.5");
  if (calculateROI(25) !== 1.5) throw new Error("Rank 25 ROI should be 1.5");
  if (calculateROI(26) !== 1.2) throw new Error("Rank 26 ROI should be 1.2");
  if (calculateROI(50) !== 1.2) throw new Error("Rank 50 ROI should be 1.2");
  if (calculateROI(51) !== 0) throw new Error("Rank 51+ ROI should be 0");
  console.log("   - ROI Multipliers OK");
}

function testPayouts() {
  console.log("🧪 Testing Payouts...");
  
  const submissions: Submission[] = Array.from({ length: 60 }).map((_, i) => ({
    id: `s${i}`, user_id: `u${i}`, pod_id: "p1", track_name: "T", artist_name: "A", created_at: "2026-02-18T10:00:00Z"
  }));
  
  // Give first 50 some points
  const stakes: Stake[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `st${i}`, user_id: "u_extra", submission_id: `s${i}`, amount: 10 + i
  }));
  
  // Add a stake on s55 (outside top 50)
  stakes.push({ id: "st_lost", user_id: "u_loser", submission_id: "s55", amount: 100 });
  
  const ranked = rankSubmissions(submissions, stakes);
  const payouts = calculatePayouts(stakes, ranked);
  
  const won = payouts.filter(p => p.result === 'won');
  const lost = payouts.filter(p => p.result === 'lost');
  
  if (won.length !== 50) throw new Error(`Expected 50 winners, got ${won.length}`);
  if (lost.length !== 1) throw new Error(`Expected 1 loser, got ${lost.length}`);
  if (lost[0].payout !== 0) throw new Error("Loser payout should be 0");
  
  // Check Rank 1 payout (ROI x2.0)
  const rank1Sub = ranked.find(r => r.global_rank === 1)!;
  const rank1Stake = stakes.find(st => st.submission_id === rank1Sub.id)!;
  const rank1Payout = payouts.find(p => p.stake_id === rank1Stake.id)!;
  if (rank1Payout.payout !== Math.floor(rank1Stake.amount * 2.0)) throw new Error("Rank 1 payout mismatch");

  console.log("   - Payout calculation OK");
}

function testReputation() {
  console.log("🧪 Testing Reputation Changes...");
  
  const payouts: Payout[] = [
    { user_id: "u1", stake_id: "st1", submission_id: "s1", amount_staked: 10, result: "won", payout: 20 },
    { user_id: "u1", stake_id: "st2", submission_id: "s2", amount_staked: 10, result: "won", payout: 20 },
    { user_id: "u2", stake_id: "st3", submission_id: "s3", amount_staked: 10, result: "lost", payout: 0 },
  ];

  const changes = calculateReputationChanges(payouts);
  
  const u1 = changes.find(c => c.user_id === "u1")!;
  const u2 = changes.find(c => c.user_id === "u2")!;
  
  if (u1.delta !== 20) throw new Error("u1 should have +20 reputation (2 wins)");
  if (u2.delta !== -5) throw new Error("u2 should have -5 reputation (1 loss)");
  
  console.log("   - Reputation deltas OK");
}

runTests();
