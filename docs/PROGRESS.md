# 📊 MeloCaps — Suivi de Progression

> **Ce fichier doit être mis à jour par Cursor après chaque feature complétée.**

---

## Sprint Actuel : Sprint 1 — Fondations

### Fichiers Créés

| Fichier | Ticket | Statut |
| ------- | ------ | ------ |
| (rien encore) | — | — |

### Décisions Techniques Prises

| Décision | Raison | Date |
| -------- | ------ | ---- |
| (rien encore) | — | — |

### Problèmes Rencontrés

| Problème | Solution | Ticket |
| -------- | -------- | ------ |
| (rien encore) | — | — |

### Changements de Schéma BDD

| Table/Colonne | Changement | Raison | Date |
| ------------- | ---------- | ------ | ---- |
| (rien encore) | — | — | — |

---

## Checklist Globale

### Infrastructure
- [ ] Projet Next.js initialisé
- [ ] Supabase connecté
- [ ] Tailwind configuré avec palette MeloCaps
- [ ] i18n configuré (fr.json + en.json)
- [ ] Variables d'environnement documentées dans `.env.example`

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