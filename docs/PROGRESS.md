# 📊 MeloCaps — Suivi de Progression

> **Ce fichier doit être mis à jour par Cursor après chaque feature complétée.**

---

## Sprint Actuel : Sprint 3 — Économie & Vote

### Fichiers Créés / Modifiés

| Fichier | Ticket | Statut |
| ------- | ------ | ------ |
| `tailwind.config.ts` | S1-01 | ✅ DONE |
| `src/styles/globals.css` | S1-01 | ✅ DONE |
| `src/i18n/*.json` | S1-01 | ✅ DONE |
| `src/middleware.ts` | S1-01 | ✅ DONE |
| `src/app/[locale]/layout.tsx` | S1-01 | ✅ DONE |
| `.env.local` | S1-02 | ✅ DONE |
| `src/lib/supabase/client.ts` | S1-02 | ✅ DONE |
| `src/lib/supabase/server.ts` | S1-02 | ✅ DONE |
| `src/lib/supabase/admin.ts` | S1-02 | ✅ DONE |
| `src/lib/supabase/middleware.ts` | S1-02 | ✅ DONE |
| `src/types/database.ts` | S1-04 | ✅ DONE |
| `src/app/[locale]/(public)/login/page.tsx` | S1-03 | ✅ DONE |
| `src/app/[locale]/(auth)/profile/page.tsx` | S1-03 | ✅ DONE |
| `src/app/auth/callback/route.ts` | S1-03 | ✅ DONE |
| `src/i18n/navigation.ts` | S1-03 | ✅ DONE |
| `src/components/layout/Navigation.tsx` | S1-05 | ✅ DONE |
| `src/app/[locale]/(public)/leaderboard/page.tsx` | S1-05 | ✅ DONE |
| `src/app/[locale]/(public)/results/page.tsx` | S1-05 | ✅ DONE |
| `src/app/[locale]/(public)/page.tsx` | S1-05 | ✅ DONE |
| `src/components/ui/*.tsx` | S1-06 | ✅ DONE |
| `src/app/[locale]/(auth)/profile/page.tsx` | S1-07/08 | ✅ DONE |
| `src/app/[locale]/(public)/*.tsx` | S1-08 | ✅ DONE |
| `src/lib/spotify/*.ts` | S2-01 | ✅ DONE |
| `src/components/game/TrackSearch.tsx` | S2-01 | ✅ DONE |
| `src/components/game/TrackCard.tsx` | S2-01 | ✅ DONE |
| `src/app/[locale]/(admin)/*` | S2-02 | ✅ DONE |
| `src/app/actions/themes.ts` | S2-02 | ✅ DONE |
| `src/app/api/cron/update-theme-status/route.ts` | S2-02 | ✅ DONE |
| `src/app/api/theme/current/route.ts` | S2-02 | ✅ DONE |
| `src/lib/game/pods.ts` | S2-03 | ✅ DONE |
| `src/app/actions/pods.ts` | S2-03 | ✅ DONE |
| `src/app/api/pods/join/route.ts` | S2-03 | ✅ DONE |
| `src/app/[locale]/(auth)/game/pod/*` | S2-03 | ✅ DONE |
| `src/components/game/PodMembers.tsx` | S2-03 | ✅ DONE |
| `src/app/actions/submissions.ts` | S2-04 | ✅ DONE |
| `src/components/game/SubmitTrackDialog.tsx` | S2-04 | ✅ DONE |
| `src/components/ui/dialog.tsx` | S2-04 | ✅ DONE |
| `src/components/ui/sonner.tsx` | S2-04 | ✅ DONE |


### Décisions Techniques Prises

| Décision | Raison | Date |
| -------- | ------ | ---- |
| **Next-intl** | Intégration native App Router pour l'i18n | 2026-02-18 |
| **Middleware Standard** | Revert à `middleware.ts` pour stabilité Next.js 16 | 2026-02-18 |
| **Supabase SSR** | Utilisation de `@supabase/ssr` avec gestion des cookies | 2026-02-18 |
| **Service Role** | Client admin séparé (`admin.ts`) pour éviter les fuites | 2026-02-18 |
| **Security Fix** | `search_path=public` sur les fonctions TRIGGER (Advisor) | 2026-02-18 |
| **Separation Routing/Nav** | `i18n/routing` vs `i18n/navigation` pour Edge compat | 2026-02-18 |

### Problèmes Rencontrés

| Problème | Solution | Ticket |
| -------- | -------- | ------ |
| `.agent/` bloquait `create-next-app` | Déplacé temporairement | S1-01 |
| Limite de projets gratuits Supabase | Pause d'un vieux projet pour libérer un slot | S1-02 |
| Warnings Sécurité sur les Functions | Migration `002` pour fixer le `search_path` | S1-04 |
| Redirect Loop Login/Profile | Fix middleware + `next` param + Auto-redirect Login | S2-03 |
| "No active theme" error | Ajout du status `upcoming` dans la query Pod Hub | S2-03 |

### Changements de Schéma BDD

| Table/Colonne | Changement | Raison | Date |
| ------------- | ---------- | ------ | ---- |
| `users` | Création + RLS | S1-04 | 2026-02-18 |
| `weekly_themes` | Création + RLS | S1-04 | 2026-02-18 |
| `pods` | Création + RLS | S1-04 | 2026-02-18 |
| `pods_members` | Création + RLS | S1-04 | 2026-02-18 |
| `submissions` | Création + RLS | S1-04 | 2026-02-18 |
| `stakes` | Création + RLS | S1-04 | 2026-02-18 |
| `transactions` | Création + RLS | S1-04 | 2026-02-18 |
| `messages` | Création + RLS | S1-04 | 2026-02-18 |

---

## Checklist Globale

### Infrastructure
- [x] Projet Next.js initialisé (Next.js 16, TypeScript strict)
- [x] Supabase connecté (Projet ID: `papynmqfpqdicsolvjjq`)
- [x] Tailwind configuré avec palette MeloCaps
- [x] i18n configuré (fr/en)
- [x] Variables d'environnement configurées (`.env.local`)

### Base de Données
- [x] Schéma initial complet déployé (7 tables)
- [x] RLS activé et vérifié sur toutes les tables
- [x] Trigger `on_auth_user_created` fonctionnel
- [x] Security Advisors vérifiés (0 warnings)

### Sprint 2 : Moteur de Jeu ✅ DONE
- [x] **S2-01 : Profil Spotify Étendu** (Bio, Genre, Top Artists)
- [x] **S2-02 : Système de Thèmes Hebdomadaires** (Admin UI + Status logic)
- [x] **S2-03 : Matchmaking Multi-Pod** (Algorithme de répartition fluide)
- [x] **S2-04 : Soumission de Titre** (Server Action + Recherche Spotify)
- [x] **S2-05 : Guards Temporels (Weekend-Only)**
  - Utilitaire `src/lib/utils/weekend.ts` pour la gestion du cycle.
  - Middleware bloquant `/game/*` hors weekend.
  - Home Page dynamique (Countdown vs CTA).
  - Support de `FORCE_WEEKEND=true` pour le dev.

### Auth
- [x] Login Spotify fonctionnel (S1-03)
- [x] Callback handler
- [x] Middleware de protection des routes
- [x] Refresh token Spotify automatique (via Supabase)

### Gameplay
- [x] Recherche Spotify fonctionnelle
- [x] Création/Assignation de Pod
- [x] Soumission de titre
- [/] Staking
- [x] Résolution (Engine) - Structure ready

### UI/UX
- [x] Page d'accueil (S1-05) - Hero, CTA, Countdown
- [x] Page login (S1-03)
- [x] Page profil (S1-03)
- [x] Page Leaderboard (S1-05) - Mock Data
- [x] Page Résultats (S1-05) - Mock Data
- [x] Navigation Responsive (Top/Bottom) (S1-05)
- [x] Page Pod (S2-03)

### Compliance
- [ ] Zéro vocabulaire gambling
- [x] Deep links Spotify

---
- [x] Admin Interface (Page + Server Action)
- [x] API GET /api/theme/current
- [x] Theme Status Logic (CRON)
- [x] Integrate Theme in Home Page (Display + Countdown)

## Versions Déployées

| Version | Date | Contenu | URL |
| ------- | ---- | ------- | --- |
| (rien encore) | — | — | — |

- **S2-01 / S2-02** : Implémentation de la recherche via Client Credentials Flow pour éviter les rate limits utilisateurs. Ajout du hook `useDebounce` pour optimiser les appels API.