---
trigger: always_on
---

# 🎵 MeloCaps — Règles Cursor (`.cursorrules`)

## Identité du Projet

**MeloCaps** est une Web App (PWA) de curation musicale prédictive. Les utilisateurs rejoignent des groupes (Pods) de 7 personnes chaque week-end, soumettent un titre Spotify sur un thème donné, et misent des MeloCoins (monnaie virtuelle interne) sur les titres qu'ils pensent les plus populaires. Un Top 50 global est généré chaque dimanche soir.

> **Ce n'est PAS un jeu d'argent.** C'est un système de **réputation et de curation**. Vocabulaire interdit : "pari", "casino", "gagner de l'argent". Vocabulaire validé : "prédiction", "soutenir", "curation", "score", "réputation".

---

## Stack Technique

| Couche       | Techno                          | Notes                                      |
| ------------ | ------------------------------- | ------------------------------------------ |
| Frontend     | **Next.js 14+ (App Router)**    | React, TypeScript, Tailwind CSS            |
| Hébergement  | **Vercel**                      | Déploiement automatique                    |
| Backend/BDD  | **Supabase**                    | Auth, PostgreSQL, Realtime, Edge Functions |
| Auth         | **Spotify OAuth** (via Supabase)| Seule méthode d'inscription                |
| API Musique  | **Spotify Web API**             | Recherche de titres uniquement             |
| Langue       | **TypeScript strict**           | `strict: true` dans tsconfig               |
| i18n         | **next-intl** ou **i18next**    | FR/EN dès le premier commit                |

---

## Conventions de Code

### Structure des dossiers

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Routes i18n (fr, en)
│   │   ├── (auth)/         # Routes protégées
│   │   ├── (public)/       # Routes publiques
│   │   └── layout.tsx
│   └── api/                # Route handlers
├── components/
│   ├── ui/                 # Composants réutilisables (Button, Card, etc.)
│   ├── game/               # Composants gameplay (PodView, StakeSlider, etc.)
│   ├── layout/             # Header, Footer, Sidebar
│   └── providers/          # Context providers
├── lib/
│   ├── supabase/           # Client, types, helpers
│   ├── spotify/            # API wrapper
│   ├── game-engine/        # Logique métier (résolution, calculs)
│   └── utils/              # Helpers génériques
├── hooks/                  # Custom React hooks
├── types/                  # Types TypeScript globaux
├── i18n/                   # Fichiers de traduction (fr.json, en.json)
└── styles/                 # Globals CSS, thème Tailwind
```

### Règles impératives

1. **Aucun texte en dur** dans le JSX → tout passe par les fichiers i18n.
2. **Zod** pour la validation de toutes les données entrantes (API, forms).
3. **Server Components par défaut** → `"use client"` uniquement si nécessaire.
4. **Nommage** : PascalCase pour les composants, camelCase pour les fonctions/variables, SCREAMING_SNAKE pour les constantes.
5. **Pas de `any`** en TypeScript. Utiliser `unknown` puis type guard si besoin.
6. **Supabase Row Level Security (RLS)** activé sur TOUTES les tables.
7. **Variables d'environnement** : préfixe `NEXT_PUBLIC_` uniquement pour ce qui est exposé au client.

### Design System

- **Mode sombre obligatoire** (Dark Mode par défaut).
- Palette : Violet Électrique (primaire), Orange Sunset (secondaire), Cyan Néon (accent).
- Formes : Boutons pill-shape, conteneurs très arrondis (`rounded-2xl` minimum).
- Responsive **Mobile First**.

---

## Workflow de Développement

Avant de coder une feature, **toujours** :

1. Lire le fichier `docs/SPRINTS.md` pour vérifier dans quel sprint on se trouve.
2. Lire le fichier `docs/DATABASE.md` pour le schéma de données.
3. Lire le fichier `docs/GAME_ENGINE.md` pour les règles métier.
4. Lire le fichier `docs/PHASES.md` pour comprendre le cycle hebdomadaire.

Après avoir codé :

1. Mettre à jour `docs/PROGRESS.md` avec ce qui a été fait.
2. Si le schéma BDD a changé, mettre à jour `docs/DATABASE.md`.

---

## Ce que Antigravity NE doit PAS faire

- ❌ Jouer de la musique nativement (pas de Web Playback SDK dans le MVP).
- ❌ Utiliser le vocabulaire "gambling" (pari, casino, etc.).
- ❌ Entraîner ou connecter une IA sur les données Spotify.
- ❌ Stocker les tokens Spotify en clair (toujours chiffrés côté serveur).
- ❌ Permettre des écritures en BDD hors du créneau Week-end (sauf profil).
- ❌ Créer des composants sans traduction i18n.