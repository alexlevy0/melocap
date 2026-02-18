/**
 * 🧮 MeloCaps — Game Engine (Pure Logic)
 * Pure, deterministic functions for resolving the weekly drop.
 */

export interface Submission {
  id: string;
  user_id: string;
  pod_id: string;
  track_name: string;
  artist_name: string;
  album_image_url?: string | null;
  spotify_uri?: string | null;
  created_at: string;
}

export interface Stake {
  id: string;
  user_id: string;
  submission_id: string;
  amount: number;
}

export interface ScoredSubmission extends Submission {
  global_score: number;
  backer_count: number;
}

export interface RankedSubmission extends ScoredSubmission {
  global_rank: number;
}

export interface Payout {
  user_id: string;
  stake_id: string;
  submission_id: string;
  amount_staked: number;
  result: "won" | "lost";
  payout: number;
}

export interface ReputationChange {
  user_id: string;
  delta: number;
}

/**
 * Step 1 & 2: Calculate scores and rank submissions
 */
export function rankSubmissions(
  submissions: Submission[],
  stakes: Stake[]
): RankedSubmission[] {
  // 1. Calculate scores
  const scored: ScoredSubmission[] = submissions.map((sub) => {
    const subStakes = stakes.filter((s) => s.submission_id === sub.id);
    const global_score = subStakes.reduce((sum, s) => sum + s.amount, 0);
    const backer_count = new Set(subStakes.map((s) => s.user_id)).size;

    return {
      ...sub,
      global_score,
      backer_count,
    };
  });

  // 2. Rank submissions
  return scored
    .sort((a, b) => {
      // Primary: Score
      if (b.global_score !== a.global_score) return b.global_score - a.global_score;
      // Secondary: Backers
      if (b.backer_count !== a.backer_count) return b.backer_count - a.backer_count;
      // Tertiary: Date (First come first served)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    })
    .map((sub, index) => ({
      ...sub,
      global_rank: index + 1,
    }));
}

/**
 * Step 3: Calculate ROI Multiplier
 */
export function calculateROI(rank: number): number {
  if (rank <= 10) return 2.0;
  if (rank <= 25) return 1.5;
  if (rank <= 50) return 1.2;
  return 0;
}

/**
 * Step 4: Calculate Payouts
 */
export function calculatePayouts(
  stakes: Stake[],
  rankedSubmissions: RankedSubmission[]
): Payout[] {
  const top50Ids = new Set(
    rankedSubmissions
      .filter((s) => s.global_rank <= 50 && s.global_score > 0)
      .map((s) => s.id)
  );

  return stakes.map((stake) => {
    const isWinner = top50Ids.has(stake.submission_id);
    
    if (!isWinner) {
      return {
        user_id: stake.user_id,
        stake_id: stake.id,
        submission_id: stake.submission_id,
        amount_staked: stake.amount,
        result: "lost",
        payout: 0,
      };
    }

    const sub = rankedSubmissions.find((r) => r.id === stake.submission_id)!;
    const roi = calculateROI(sub.global_rank);
    const payout = Math.floor(stake.amount * roi);

    return {
      user_id: stake.user_id,
      stake_id: stake.id,
      submission_id: stake.submission_id,
      amount_staked: stake.amount,
      result: "won",
      payout,
    };
  });
}

/**
 * Step 5: Calculate Reputation Changes
 */
export function calculateReputationChanges(payouts: Payout[]): ReputationChange[] {
  const changes = new Map<string, number>();

  for (const payout of payouts) {
    const current = changes.get(payout.user_id) || 0;
    const delta = payout.result === "won" ? 10 : -5;
    changes.set(payout.user_id, current + delta);
  }

  return Array.from(changes.entries()).map(([user_id, delta]) => ({
    user_id,
    delta,
  }));
}

export interface WeeklyResults {
  top50: RankedSubmission[];
  stats: {
    totalCoinsBurned: number;
    totalCoinsDistributed: number;
    resolvedAt: string;
  };
}
