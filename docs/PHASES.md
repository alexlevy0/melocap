# ⏰ MeloCaps — Phases du Cycle Hebdomadaire

## Vue d'ensemble

MeloCaps fonctionne sur un **cycle hebdomadaire strict**. L'app est "Weekend-Only" pour créer de la rareté.

```
Lun    Mar    Mer    Jeu    Ven 19h    Sam    Dim 12h    Dim 19h
|_________ PHASE 0 _________|__ P1 __|____ PHASE 2 ____|_ P3 _|__ P4 __|
       READ-ONLY              DROP        LA FIÈVRE      LOCK   RESOLVE
```

---

## PHASE 0 : L'Attente (Lundi 00h00 → Vendredi 18h59)

### État
- `theme.status = 'finished'` (semaine précédente) ou `'upcoming'` (semaine en cours)
- **Mode Read-Only** : aucune écriture en BDD sauf modification de profil

### Interface
- Compte à rebours central : **"The Drop in X jours, X heures..."**
- Playlist MeloCaps de la semaine précédente (Top 50) → liens Spotify
- Tableau d'honneur des meilleurs Curateurs de la semaine passée
- Style visuel **"Chill"** : couleurs désaturées, animations lentes

### Routes accessibles
- `/` (accueil avec countdown)
- `/profile` (lecture + modification)
- `/results` (résultats semaine passée)
- `/leaderboard`

### Routes bloquées
- `/game/*` → Redirection vers `/` avec message "Revenez vendredi 19h !"

---

## PHASE 1 : Le Drop (Vendredi 19h00)

### Événement déclencheur
**Edge Function CRON** exécutée à 19h00 (heure de Paris) :

```typescript
// supabase/functions/weekly-drop/index.ts
// Déclenché par CRON : "0 19 * * 5" (vendredi 19h UTC+1, ajuster selon timezone)

async function weeklyDrop() {
  // 1. Passer le thème en "open"
  await supabase
    .from('weekly_themes')
    .update({ status: 'open', opened_at: new Date().toISOString() })
    .eq('status', 'upcoming')
    .eq('week_number', getCurrentWeekNumber())

  // 2. Distribuer l'allocation universelle (+100 MeloCoins)
  const { data: users } = await supabase.from('users').select('id, wallet_balance')
  
  for (const user of users) {
    const newBalance = user.wallet_balance + 100
    await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', user.id)
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'weekly_allocation',
      amount: 100,
      balance_after: newBalance,
      description: `Allocation hebdomadaire S${getCurrentWeekNumber()}`
    })
  }

  // 3. Envoyer les notifications
  await sendDropNotifications()
}
```

### Interface
- L'écran d'accueil **bascule en mode "Fête"**
- Révélation du thème avec animation
- Bouton CTA : **"Rejoindre un Pod"**
- Style visuel **"Fever"** : couleurs saturées, animations rapides

---

## PHASE 2 : La Fièvre (Vendredi 19h00 → Dimanche 11h59)

### État
- `theme.status = 'open'`
- Écritures autorisées : pods_members, submissions, stakes

### Sous-étapes utilisateur

#### Étape 2a : Matchmaking
1. User clique "Rejoindre un Pod"
2. Backend cherche un Pod non plein pour ce thème
3. Si aucun → crée un nouveau Pod
4. User assigné → redirigé vers `/game/pod/[podId]`

```typescript
// Pseudo-code API /api/pods/join
async function joinPod(userId: string, themeId: string) {
  // Vérifier que l'user n'est pas déjà dans un pod cette semaine
  const existing = await getExistingPodMember(userId, themeId)
  if (existing) throw new Error('ALREADY_IN_POD')

  // Trouver un pod non plein
  let pod = await findAvailablePod(themeId)
  if (!pod) {
    pod = await createPod(themeId)
  }

  // Ajouter le membre
  await addMemberToPod(pod.id, userId)
  
  // Mettre à jour le compteur
  const newCount = pod.member_count + 1
  await updatePod(pod.id, { 
    member_count: newCount, 
    is_full: newCount >= 7 
  })

  return pod
}
```

#### Étape 2b : Soumission
1. Interface de recherche Spotify dans la page Pod
2. User cherche et sélectionne un titre
3. Validation : titre non déjà pris dans le Pod
4. Soumission enregistrée → le slot du user affiche son titre

#### Étape 2c : Staking
1. **Prérequis** : le user a déjà soumis son titre
2. Tous les titres du Pod sont visibles (ceux déjà soumis)
3. Sliders de mise sur chaque titre (le sien inclus)
4. Le solde décrémente en temps réel
5. Possibilité de modifier ses mises tant que le thème est `open`

### Affichage Pod en temps réel

```
┌──────────────────────────────────────┐
│  Pod #42 — Thème : "Disco Funk 80s" │
├──────────────────────────────────────┤
│  👤 Alex     → 🎵 "Stayin' Alive"   │  [50 coins misés]
│  👤 Marie    → 🎵 "Le Freak"        │  [30 coins misés]
│  👤 Tom      → 🎵 (En attente...)    │
│  👤 Lisa     → 🎵 "Boogie..."       │  [--]
│  👤 (vide)   →                       │
│  👤 (vide)   →                       │
│  👤 (vide)   →                       │
├──────────────────────────────────────┤
│  💬 Chat du Pod                      │
│  💰 Mon solde : 120 MeloCoins       │
└──────────────────────────────────────┘
```

**Note** : Les montants misés par les AUTRES sont invisibles → seulement les siens.

---

## PHASE 3 : Le Verrouillage (Dimanche 12h00)

### Événement déclencheur
**Edge Function CRON** à 12h00 :

```typescript
// CRON : "0 12 * * 0" (dimanche 12h)
async function lockTheme() {
  await supabase
    .from('weekly_themes')
    .update({ status: 'locked', locked_at: new Date().toISOString() })
    .eq('status', 'open')
}
```

### Interface
- Message : **"Les jeux sont faits !"**
- Récapitulatif des mises du joueur
- Les mises de TOUS les joueurs du Pod deviennent visibles
- Aucune modification possible
- Compte à rebours vers la résolution : "Résultats dans 7h..."

---

## PHASE 4 : La Résolution (Dimanche 19h00)

### Événement déclencheur
**Edge Function CRON** à 19h00 :

```typescript
// CRON : "0 19 * * 0" (dimanche 19h)
async function resolveTheme() {
  // 1. Passer en "resolving"
  await updateThemeStatus('resolving')

  // 2. Récupérer toutes les données
  const submissions = await getAllSubmissionsForTheme(themeId)
  const stakes = await getAllStakesForTheme(themeId)

  // 3. Exécuter l'algorithme (voir GAME_ENGINE.md)
  const results = resolveWeek(submissions, stakes)

  // 4. Mettre à jour les submissions (scores + rangs)
  await updateSubmissionScores(results.rankedSubmissions)

  // 5. Distribuer les gains/pertes
  await distributePayouts(results.payouts)

  // 6. Mettre à jour les ReputationScores
  await updateReputations(results.reputationChanges)

  // 7. Générer le JSON public
  await generatePublicResults(results, themeId)

  // 8. Passer en "finished"
  await updateThemeStatus('finished')

  // 9. Créer le thème de la semaine prochaine en "upcoming"
  await createNextWeekTheme()

  // 10. Notifications
  await sendResultsNotifications()
}
```

### Interface
- Animation de révélation du Top 50
- Section personnelle : gains/pertes avec animations
- Bouton : "Voir la playlist complète sur Spotify"
- Transition vers le mode "Chill" (Phase 0)

---

## CRON Jobs Résumé

| CRON Expression    | Quand               | Action                        | Edge Function          |
| ------------------ | -------------------- | ----------------------------- | ---------------------- |
| `0 19 * * 5`       | Vendredi 19h         | Drop + Distribution coins     | `weekly-drop`          |
| `0 12 * * 0`       | Dimanche 12h         | Verrouillage                  | `weekly-lock`          |
| `0 19 * * 0`       | Dimanche 19h         | Résolution + Gains            | `weekly-resolve`       |

> ⚠️ **Timezone** : Les heures sont en heure de Paris (Europe/Paris). Ajuster les CRON en UTC si nécessaire (UTC+1 en hiver, UTC+2 en été).

---

## Variable de Dev : `FORCE_WEEKEND`

Pour le développement local, ajouter dans `.env.local` :

```
FORCE_WEEKEND=true
```

Quand `FORCE_WEEKEND=true` :
- `isWeekendActive()` retourne toujours `true`
- Les routes `/game/*` sont toujours accessibles
- Les CRON jobs peuvent être déclenchés manuellement via des endpoints admin