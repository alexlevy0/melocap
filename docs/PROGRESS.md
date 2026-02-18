# 📊 MeloCaps — Suivi de Progression

> **Ce fichier doit être mis à jour par Cursor après chaque feature complétée.**

---

## Sprint Actuel : Sprint 1 — Fondations

### Fichiers Créés

| Fichier | Ticket | Statut |
| ------- | ------ | ------ |
| `tailwind.config.ts` | S1-01 | ✅ DONE |
| `src/styles/globals.css` | S1-01 | ✅ DONE |
| `src/i18n/fr.json` | S1-01 | ✅ DONE |
| `src/i18n/en.json` | S1-01 | ✅ DONE |
| `src/i18n/routing.ts` | S1-01 | ✅ DONE |
| `src/i18n/request.ts` | S1-01 | ✅ DONE |
| `src/middleware.ts` | S1-01 | ✅ DONE |
| `src/app/[locale]/layout.tsx` | S1-01 | ✅ DONE |
| `src/app/[locale]/(public)/page.tsx` | S1-01 | ✅ DONE |
| `next.config.ts` | S1-01 | ✅ DONE |
| `.env.example` | S1-01 | ✅ DONE |

### Décisions Techniques Prises

| Décision | Raison | Date |
| -------- | ------ | ---- |
| next-intl pour l'i18n | Recommandé dans les règles, intégration native App Router | 2026-02-18 |
| Inter + Outfit (Google Fonts) | Inter pour le corps, Outfit pour les titres (display) | 2026-02-18 |
| Dark mode par défaut via `class` | Cohérent avec le design system MeloCaps | 2026-02-18 |
| Palette CSS via variables CSS + Tailwind | Double accès : CSS natif + classes Tailwind | 2026-02-18 |
| Middleware next-intl exclu de `/auth` | Le callback Supabase ne doit pas avoir de préfixe locale | 2026-02-18 |

### Problèmes Rencontrés

| Problème | Solution | Ticket |
| -------- | -------- | ------ |
| `.agent/` bloquait `create-next-app` | Déplacé temporairement en `/tmp` pendant l'init | S1-01 |
| Import path incorrect dans `middleware.ts` | Corrigé `./src/i18n/routing` → `./i18n/routing` | S1-01 |

### Changements de Schéma BDD

| Table/Colonne | Changement | Raison | Date |
| ------------- | ---------- | ------ | ---- |
| (rien encore — S1-04) | — | — | — |

---

## Checklist Globale

### Infrastructure
- [x] Projet Next.js initialisé (Next.js 15, App Router, TypeScript strict)
- [ ] Supabase connecté
- [x] Tailwind configuré avec palette MeloCaps (violet, orange, cyan)
- [x] i18n configuré (fr.json + en.json via next-intl)
- [x] Variables d'environnement documentées dans `.env.example`

### Auth
- [ ] Login Spotify fonctionnel
- [ ] Callback handler
- [ ] Middleware de protection des routes
- [ ] Trigger `on_auth_user_created`
- [ ] Refresh token Spotify automatique

### Base de Données
- [ ] Table `users` + RLS
- [ ] Table `weekly_themes` + RLS
- [ ] Table `pods` + RLS
- [ ] Table `pods_members` + RLS
- [ ] Table `submissions` + RLS
- [ ] Table `stakes` + RLS
- [ ] Table `transactions` + RLS
- [ ] Table `messages` + RLS

### Gameplay
- [ ] Recherche Spotify fonctionnelle
- [ ] Création/Assignation de Pod
- [ ] Soumission de titre (avec contraintes)
- [ ] Interface de staking (sliders)
- [ ] Guards temporels (weekend-only)
- [ ] Algorithme de résolution
- [ ] Distribution des gains
- [ ] Génération JSON public

### UI/UX
- [ ] Page d'accueil (countdown + résultats passés)
- [ ] Page login
- [ ] Page profil
- [ ] Page Pod (7 slots + recherche + staking)
- [ ] Page résultats
- [ ] Page leaderboard
- [ ] Mode Chill vs Fever
- [ ] Responsive mobile

### Social
- [ ] Chat temps réel dans les Pods
- [ ] Notifications email (Drop + Résultats)
- [ ] Notifications in-app

### Compliance
- [ ] Zéro vocabulaire gambling dans l'UI
- [ ] Deep links Spotify (pas de lecture native)
- [ ] RLS vérifié (pas de fuite de données)
- [ ] Manifeste algorithmique rédigé

---

## Versions Déployées

| Version | Date | Contenu | URL |
| ------- | ---- | ------- | --- |
| (rien encore) | — | — | — |