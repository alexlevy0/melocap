# 📋 MeloCaps — Sprints & Progression

## Vue d'ensemble

| Sprint | Nom                    | Semaines | Statut |
| ------ | ---------------------- | -------- | ------ |
| 1      | Fondations             | 1-2      | ✅ DONE |
| 2      | Moteur de Jeu          | 3-4      | ✅ DONE |
| 3      | Économie & Vote        | 5-6      | 🔨 WIP  |
| 4      | Social & Polish        | 7-8      | 🔲 TODO |

---

## Sprint 1 : Fondations (Semaines 1-2)

### Objectif
Setup complet du projet, authentification Spotify, schéma BDD, pages de base.

### Tickets

#### S1-01 : Init Projet Next.js
- [x] `npx create-next-app@latest melocaps --typescript --tailwind --app --src-dir`
- [x] Configurer `tsconfig.json` en mode strict
- [x] Installer les dépendances : `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `next-intl`
- [x] Configurer Tailwind avec la palette MeloCaps (violet, orange, cyan)
- [x] Mettre en place la structure de dossiers décrite dans `CURSOR_RULES.md`
- **Fichiers créés** : `tailwind.config.ts`, `src/styles/globals.css`, structure de base

#### S1-02 : Setup Supabase
- [x] Créer le projet Supabase
- [x] Configurer les variables d'env (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.)
- [x] Créer le client Supabase (browser + server) dans `src/lib/supabase/`
- [x] Créer le middleware d'auth Supabase pour Next.js
- **Fichiers créés** : `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts`

#### S1-03 : Auth Spotify via Supabase
- [x] Configurer le provider Spotify dans Supabase Dashboard
- [x] Scopes requis : `user-read-email`, `playlist-modify-public`, `playlist-modify-private`
- [x] Page `/login` avec bouton "Se connecter avec Spotify"
- [x] Callback handler `/auth/callback`
- [x] Stockage sécurisé du `provider_token` (token Spotify) dans la table `users`
- [x] Middleware : rediriger vers `/login` si non authentifié
- **Fichiers créés** : `src/app/[locale]/(public)/login/page.tsx`, `src/app/auth/callback/route.ts`

#### S1-04 : Schéma Base de Données
- [x] Exécuter les migrations SQL (voir `docs/DATABASE.md`)
- [x] Activer RLS sur toutes les tables
- [x] Créer les policies RLS de base
- [x] Créer un trigger `on_auth_user_created` pour insérer dans `public.users`
- **Fichiers créés** : `supabase/migrations/001_initial_schema.sql`

#### S1-05 : Pages de Base & Layout
- [x] Layout principal (Header avec logo, navigation, avatar)
- [x] Page d'accueil avec compte à rebours "The Drop in X Days..."
- [x] Page Profil (avatar Spotify, nom, wallet balance, stats)
- [x] i18n : fichiers `fr.json` et `en.json` avec les textes de base
- **Fichiers créés** : `src/app/[locale]/layout.tsx`, `src/app/[locale]/(public)/page.tsx`, `src/app/[locale]/(auth)/profile/page.tsx`, `src/components/layout/Navigation.tsx`

#### S1-06 : Composants UI de Base
- [x] `<Button>` (pill-shape, variantes primary/secondary/accent)
- [x] `<Card>` (conteneur arrondi, glassmorphism)
- [x] `<Countdown>` (compte à rebours stylisé avec flip animation)
- [x] `<Avatar>` (photo Spotify, cercle lumineux)
- [x] `<Badge>` (pour les MeloCoins, rang, etc.)
- **Fichiers créés** : `src/components/ui/*.tsx`

---

## Sprint 2 : Moteur de Jeu (Semaines 3-4)

### Objectif
Recherche Spotify, création/assignation de Pods, soumission de titres.

### Tickets

#### S2-01 : Spotify Search API
- [x] Wrapper API dans `src/lib/spotify/search.ts`
- [x] Route handler `/api/spotify/search?q=...`
- [x] Gestion du refresh token Spotify automatique (Client Credentials)
- [x] Composant `<TrackSearch>` : input avec autocomplete, affiche pochette + artiste + titre
- [x] Composant `<TrackCard>` : affiche un titre avec bouton "Écouter sur Spotify" (deep link)

#### S2-02 : Système de Thèmes Hebdomadaires
- [x] Table `weekly_themes` déjà créée (Sprint 1)
- [x] Page admin basique pour créer un thème (protégée par rôle)
- [x] Edge Function CRON : changer le statut du thème selon l'heure (voir `PHASES.md`)
- [x] API : `GET /api/theme/current` retourne le thème actif

#### S2-03 : Matchmaking & Pods
- [x] Endpoint `/api/pods/join` : assigner l'utilisateur au premier Pod non plein (< 7 joueurs)
- [x] Si aucun Pod dispo → en créer un nouveau
- [x] Vérification : un user ne peut rejoindre qu'un seul Pod par semaine
- [x] Page `/game/pod` : affiche les 7 slots (avatar + nom ou "En attente...")

#### S2-04 : Soumission de Titre
- [x] Endpoint `/api/submissions/create` : enregistrer le titre choisi
- [x] Validations Zod : trackId existe, user est dans un Pod, titre pas déjà pris dans le Pod
- [x] Interface : dans la page Pod, zone de recherche + bouton "Soumettre"
- [x] Une fois soumis → le slot du joueur affiche son titre avec pochette

#### S2-05 : Guards Temporels
- [x] Middleware/helper `isWeekendActive()` qui vérifie si on est dans le créneau autorisé
- [x] Bloquer toutes les routes `/game/*` hors créneau
- [x] Afficher un message "Revenez vendredi 19h" si accès hors créneau
- [x] Variable d'env `FORCE_WEEKEND=true` pour le développement local

---

## Sprint 3 : Économie & Vote (Semaines 5-6)

### Objectif
Wallet de MeloCoins, interface de staking, algorithme de résolution.

### Tickets

#### S3-01 : Wallet & Distribution Hebdomadaire
- [ ] Colonne `wallet_balance` dans `users` (déjà créée)
- [ ] Edge Function CRON : vendredi 19h → +100 MeloCoins à tous les users
- [ ] Composant `<WalletBadge>` dans le header (affiche le solde en temps réel)
- [ ] Table `transactions` pour tracer chaque mouvement de coins

#### S3-02 : Interface de Staking
- [ ] Page Pod mise à jour : une fois tous les titres soumis, afficher la zone de staking
- [ ] Composant `<StakeSlider>` : slider pour chaque titre du Pod
- [ ] Affichage du solde restant en temps réel
- [ ] Validation : impossible de miser plus que son solde
- [ ] Endpoint `/api/stakes/create` : enregistre les mises (avec transaction BDD)

#### S3-03 : Algorithme de Résolution (Game Engine)
- [ ] Fichier `src/lib/game-engine/resolve.ts` (DOIT être pur, sans side effects, testable)
- [ ] Input : toutes les submissions + tous les stakes de la semaine
- [ ] Output : classement trié par score pondéré, top 50, gains/pertes par user
- [ ] Tests unitaires exhaustifs (`resolve.test.ts`)
- [ ] Voir `docs/GAME_ENGINE.md` pour les formules exactes

#### S3-04 : Edge Function de Résolution
- [ ] CRON dimanche 19h : exécuter l'algorithme de résolution
- [ ] Mettre à jour les wallets (gains/pertes)
- [ ] Mettre à jour le statut du thème → "finished"
- [ ] Générer le fichier JSON public `results_week_XX.json`
- [ ] Logger le hash du code utilisé dans le JSON

#### S3-05 : Page Résultats
- [ ] Page `/results` : affiche le Top 50 de la semaine
- [ ] Classement avec pochettes, artistes, score
- [ ] Section personnelle : "Tes mises cette semaine" avec gains/pertes
- [ ] Lien "Écouter sur Spotify" pour chaque titre

---

## Sprint 4 : Social & Polish (Semaines 7-8)

### Objectif
Chat en temps réel, notifications, design final, compliance check.

### Tickets

#### S4-01 : Chat Pod (Realtime)
- [ ] Supabase Realtime sur une table `messages` (PodID, UserID, Content, Timestamp)
- [ ] Composant `<PodChat>` : bulle de chat dans la page Pod
- [ ] Limites : max 200 caractères, rate limit 1 msg/3 sec
- [ ] Modération basique : liste de mots interdits

#### S4-02 : Notifications
- [ ] Email via Supabase (ou Resend) : "The Drop is live!" vendredi 19h
- [ ] In-app : badge notification dans le header
- [ ] Notification dimanche 19h : "Les résultats sont tombés !"

#### S4-03 : Tableau d'Honneur
- [ ] Page `/leaderboard` : classement des meilleurs curateurs
- [ ] Score basé sur l'historique de prédictions réussies (ReputationScore)
- [ ] Badges visuels : 🥇🥈🥉 pour le top 3

#### S4-04 : Design "Vibrant" Final
- [ ] Animations d'entrée (Framer Motion)
- [ ] États dynamiques : mode "Chill" (lundi-vendredi) vs mode "Fever" (week-end)
- [ ] Transitions de page fluides
- [ ] Micro-interactions (hover, click feedback, confetti sur les gains)
- [ ] Responsive final : test mobile, tablette, desktop

#### S4-05 : Compliance & QA
- [ ] Audit de TOUS les textes : zéro vocabulaire gambling
- [ ] Vérifier que les deep links Spotify fonctionnent (pas de lecture native)
- [ ] Test des RLS Supabase : un user ne peut pas voir les mises des autres avant verrouillage
- [ ] Test du cycle complet : Drop → Join → Submit → Stake → Lock → Resolve
- [ ] Rédiger le "Manifeste Algorithmique" pour le repo GitHub

---

## Légende des statuts

- 🔲 TODO — Pas commencé
- 🔨 WIP — En cours
- ✅ DONE — Terminé
- 🐛 BUG — Bloqué par un bug
- ⏸️ SKIP — Reporté