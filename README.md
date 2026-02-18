# 🎵 MeloCaps

**MeloCaps** is a predictive music curation Web App (PWA). Discover today the hits of tomorrow by joining a community of talent scouts.

## 🚀 Core Concept

Every week, users join **Pods** of 7 people to participate in a "Drop".
1. **The Fever (Friday 19:00 - Sunday 12:00)**: Submit a track from Spotify based on a weekly theme and support tracks you believe will go viral.
2. **The Lock (Sunday 12:00 - Sunday 19:00)**: Submissions are closed. The community's predictions are locked in.
3. **The Drop (Sunday 19:00)**: Results are revealed. Your reputation increases based on the accuracy of your predictions.

> [!IMPORTANT]
> This is **NOT** a gambling app. It is a reputation-based curation system. We talk about **predictions**, **support**, and **reputation**, not "bets" or "gambling".

## 🛠 Tech Stack

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
- **Backend/Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime, Edge Functions)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/) (English & French support)
- **API**: [Spotify Web API](https://developer.spotify.com/documentation/web-api) for track discovery

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with Spotify Auth configured
- Spotify Developer Application credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alexlevy0/melocap.git
   cd melocap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📖 Documentation

For more internal details, refer to:
- `docs/DATABASE.md`: Database schema and RLS policies.
- `docs/GAME_ENGINE.md`: Business logic for scoring and reputation.
- `docs/PHASES.md`: Detailed breakdown of the weekly cycle.
- `docs/SPRINTS.md`: Development roadmap.
