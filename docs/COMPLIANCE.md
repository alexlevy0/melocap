# 🛡️ MeloCaps — Compliance Spotify & Vocabulaire

## Règles Spotify API

### Ce qu'on PEUT faire
- Utiliser l'API Search pour chercher des titres
- Afficher les métadonnées (titre, artiste, pochette, durée)
- Créer/modifier des playlists sur le compte de l'utilisateur (avec son consentement)
- Rediriger vers Spotify via deep links (`spotify:track:ID` ou `https://open.spotify.com/track/ID`)
- Afficher des extraits de 30s pour les comptes Premium (Web Playback SDK) — **reporté post-MVP**

### Ce qu'on NE PEUT PAS faire
- Jouer de la musique nativement pour les comptes gratuits
- Télécharger ou cacher des fichiers audio
- Utiliser les métadonnées Spotify pour entraîner un modèle IA
- Donner des récompenses pour l'écoute de musique ("Payola")
- Afficher des publicités à côté du contenu Spotify
- Stocker des données Spotify au-delà de la durée de session

### Nuance juridique cruciale
> Les utilisateurs ne gagnent jamais de points pour avoir **écouté** un titre.
> Ils gagnent des points pour avoir **identifié** un titre populaire.
> La distinction est juridique et essentielle pour la compliance.

---

## Dictionnaire de Vocabulaire

### ❌ INTERDIT (ne doit JAMAIS apparaître dans l'UI, le code, les commentaires user-facing)

| Mot Interdit | Remplacement |
| ------------ | ------------ |
| Pari / Bet | Prédiction / Prediction |
| Parier / Gamble | Prédire / Predict |
| Jeu d'argent / Gambling | Curation compétitive / Competitive curation |
| Casino | Arène / Arena |
| Miser (dans le sens casino) | Soutenir / Back / Support |
| Gagner de l'argent / Win money | Gagner des MeloCoins / Earn reputation |
| Jackpot | Top Score |
| Cote / Odds | Score de confiance / Confidence score |
| Perte | Coins brûlés / Burned coins |
| All-in (si contexte gambling) | Conviction maximale / Full conviction |

### ✅ VOCABULAIRE VALIDÉ

| Terme | Usage |
| ----- | ----- |
| Prédiction | "Fais ta prédiction" |
| Soutenir | "Soutiens ce titre avec tes MeloCoins" |
| Curation | "Participe à la curation collective" |
| Réputation | "Ton score de réputation augmente" |
| Curateur | "Les meilleurs curateurs de la semaine" |
| MeloCoins | Monnaie virtuelle interne |
| Staking | OK si contexte crypto/réputation, pas gambling |
| Conviction | "Mise ta conviction sur ce titre" |
| Découverte | "Découvre les sons de demain" |
| Pod | Groupe de 7 curateurs |
| The Drop | Moment d'ouverture du vendredi |
| Fever | Période active du week-end |

---

## Scopes OAuth Spotify

```
user-read-email          → Récupérer l'email (obligatoire pour l'auth)
user-read-private        → Infos profil (pays, type de compte)
playlist-modify-public   → Créer la playlist Top 50 sur le compte user
playlist-modify-private  → Idem pour les playlists privées
```

**Scopes NON utilisés dans le MVP** :
- `streaming` (pas de lecture native)
- `user-library-read` (pas besoin d'accéder à la bibliothèque)
- `user-top-read` (pas de recommandations basées sur l'historique)

---

## Checklist Compliance (Sprint 4)

- [ ] Audit complet de tous les fichiers i18n (fr.json, en.json) : zéro mot interdit
- [ ] Audit des commentaires dans le code : pas de vocabulaire gambling dans les noms de variables user-facing
- [ ] Vérifier que les `console.log` en production ne contiennent pas de termes interdits
- [ ] Page "À propos" / FAQ expliquant clairement que MeloCaps n'est pas un jeu d'argent
- [ ] Conditions d'utilisation mentionnant que les MeloCoins n'ont aucune valeur monétaire
- [ ] Boutons "Écouter sur Spotify" ouvrent bien l'app/site Spotify (deep link)
- [ ] Aucune lecture audio dans l'app MVP