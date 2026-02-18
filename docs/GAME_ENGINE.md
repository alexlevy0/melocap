# 🧮 MeloCaps — Game Engine (Algorithme de Résolution)

## Principe

L'algorithme de résolution est le cœur de MeloCaps. Il est **pur** (sans side effects), **déterministe** (même input → même output) et **open source**.

> **Règle d'or** : 1 Coin misé = 1 Point de vote. Le classement est la somme pondérée des convictions des utilisateurs.

---

## Input

```typescript
interface Submission {
  id: string
  userId: string
  podId: string
  spotifyTrackId: string
  trackName: string
  artistName: string
}

interface Stake {
  id: string
  userId: string
  submissionId: string
  amount: number  // Toujours > 0
}

interface ResolveInput {
  submissions: Submission[]
  stakes: Stake[]
  topN: number  // Défaut : 50
}
```

---

## Algorithme

### Étape 1 : Calcul du Score Global de chaque Submission

```typescript
function calculateScores(submissions: Submission[], stakes: Stake[]): ScoredSubmission[] {
  return submissions.map(sub => {
    // Score = somme de tous les coins misés sur cette submission
    const totalStaked = stakes
      .filter(s => s.submissionId === sub.id)
      .reduce((sum, s) => sum + s.amount, 0)

    // Nombre de "backers" (supporters uniques)
    const backerCount = new Set(
      stakes.filter(s => s.submissionId === sub.id).map(s => s.userId)
    ).size

    return {
      ...sub,
      globalScore: totalStaked,
      backerCount,
    }
  })
}
```

### Étape 2 : Classement

```typescript
function rankSubmissions(scored: ScoredSubmission[]): RankedSubmission[] {
  return scored
    .sort((a, b) => {
      // Tri primaire : score décroissant
      if (b.globalScore !== a.globalScore) return b.globalScore - a.globalScore
      // Tri secondaire (tie-breaker) : nombre de backers décroissant
      if (b.backerCount !== a.backerCount) return b.backerCount - a.backerCount
      // Tri tertiaire : date de soumission (premier arrivé favorisé)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    .map((sub, index) => ({
      ...sub,
      globalRank: index + 1,
    }))
}
```

### Étape 3 : Sélection du Top N

```typescript
function selectTopN(ranked: RankedSubmission[], topN: number): Set<string> {
  const topSubmissionIds = new Set<string>()
  for (let i = 0; i < Math.min(topN, ranked.length); i++) {
    topSubmissionIds.add(ranked[i].id)
  }
  return topSubmissionIds
}
```

### Étape 4 : Distribution des Gains (Payouts)

```typescript
interface Payout {
  userId: string
  stakeId: string
  submissionId: string
  amountStaked: number
  result: 'won' | 'lost'
  payout: number  // 0 si perdu
}

function calculatePayouts(
  stakes: Stake[],
  topSubmissionIds: Set<string>,
  ranked: RankedSubmission[]
): Payout[] {
  return stakes.map(stake => {
    const isWinner = topSubmissionIds.has(stake.submissionId)
    
    if (!isWinner) {
      return {
        userId: stake.userId,
        stakeId: stake.id,
        submissionId: stake.submissionId,
        amountStaked: stake.amount,
        result: 'lost' as const,
        payout: 0,
        // Les coins sont "brûlés"
      }
    }

    // Calcul du ROI basé sur le rang
    const submission = ranked.find(r => r.id === stake.submissionId)!
    const roiMultiplier = calculateROI(submission.globalRank)
    const payout = Math.floor(stake.amount * roiMultiplier)

    return {
      userId: stake.userId,
      stakeId: stake.id,
      submissionId: stake.submissionId,
      amountStaked: stake.amount,
      result: 'won' as const,
      payout,
    }
  })
}
```

### Formule de ROI

Le ROI dépend du rang final du titre dans le Top 50 :

```typescript
function calculateROI(rank: number): number {
  // Top 1-10  : x2.0 (mise doublée)
  // Top 11-25 : x1.5
  // Top 26-50 : x1.2 (mise + 20%)
  // Hors Top  : x0 (tout perdu)

  if (rank <= 10) return 2.0
  if (rank <= 25) return 1.5
  if (rank <= 50) return 1.2
  return 0
}
```

**Justification économique** :
- Les multiplicateurs sont volontairement modestes pour éviter l'hyperinflation de MeloCoins.
- Le système est **déflationniste** : les coins perdus sont brûlés, créant de la rareté.
- L'allocation hebdomadaire de 100 coins compense la déflation.

---

## Output

```typescript
interface ResolveOutput {
  rankedSubmissions: RankedSubmission[]  // Toutes les soumissions classées
  top50: RankedSubmission[]             // Le Top 50 uniquement
  payouts: Payout[]                     // Gains/pertes par stake
  reputationChanges: ReputationChange[] // Changements de réputation
  metadata: {
    totalSubmissions: number
    totalStakes: number
    totalCoinsStaked: number
    totalCoinsBurned: number
    totalCoinsDistributed: number
    codeHash: string                    // Hash SHA-256 du code de résolution
    resolvedAt: string                  // ISO timestamp
  }
}
```

---

## Réputation

La réputation est un score cumulatif qui mesure la qualité des prédictions d'un utilisateur.

```typescript
interface ReputationChange {
  userId: string
  delta: number
  newScore: number
}

function calculateReputationChanges(
  payouts: Payout[],
  users: Map<string, { reputationScore: number }>
): ReputationChange[] {
  const changesByUser = new Map<string, number>()

  for (const payout of payouts) {
    const current = changesByUser.get(payout.userId) || 0
    if (payout.result === 'won') {
      // +10 points par prédiction réussie
      changesByUser.set(payout.userId, current + 10)
    } else {
      // -5 points par prédiction ratée (minimum 0)
      changesByUser.set(payout.userId, current - 5)
    }
  }

  return Array.from(changesByUser.entries()).map(([userId, delta]) => {
    const user = users.get(userId)!
    const newScore = Math.max(0, user.reputationScore + delta)
    return { userId, delta, newScore }
  })
}
```

---

## Fichier JSON Public Hebdomadaire

Généré chaque dimanche à 19h05 et accessible publiquement :

```json
{
  "week": 12,
  "year": 2026,
  "theme": "Disco Funk 80s",
  "resolved_at": "2026-03-22T19:00:00Z",
  "code_hash": "sha256:abc123...",
  "stats": {
    "total_submissions": 350,
    "total_pods": 50,
    "total_stakes": 1200,
    "total_coins_staked": 45000,
    "total_coins_burned": 18000,
    "total_coins_distributed": 32000
  },
  "top_50": [
    {
      "rank": 1,
      "spotify_track_id": "4uLU6hMCjMI75M1A2tKUQC",
      "track_name": "Stayin' Alive",
      "artist_name": "Bee Gees",
      "global_score": 850,
      "backer_count": 34
    }
  ],
  "all_submissions_anonymized": [
    {
      "submission_id": "uuid",
      "spotify_track_id": "...",
      "global_score": 850,
      "backer_count": 34,
      "stakes_received": [
        { "amount": 50 },
        { "amount": 100 }
      ]
    }
  ]
}
```

> Les données sont **anonymisées** : pas de user_id, pas de correspondance mises ↔ utilisateurs.

---

## Tests Requis

Le fichier `resolve.test.ts` DOIT couvrir :

1. **Cas nominal** : 5 pods × 7 joueurs, résolution correcte
2. **Tie-breaker** : deux submissions avec le même score
3. **Pod incomplet** : un pod avec seulement 3 joueurs
4. **Zéro mises** : une submission sans aucune mise → score 0
5. **All-in** : un joueur mise tout sur un seul titre
6. **Pas de Top 50** : moins de 50 submissions totales
7. **Déterminisme** : même input exécuté 100 fois → même output