"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Users, Trophy } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Top50Track {
  id: string;
  global_rank: number;
  track_name: string;
  artist_name: string;
  global_score: number;
  backer_count: number;
  album_image_url?: string | null;
  spotify_uri?: string | null;
}

interface Top50ListProps {
  tracks: Top50Track[];
}

export function Top50List({ tracks }: Top50ListProps) {
    const t = useTranslations("results");
  const tCommon = useTranslations("common");

  if (tracks.length === 0) {
    return (
      <div className="text-center py-20 glass rounded-3xl border-white/5">
        <p className="text-slate-500 italic">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-white flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-secondary-400" />
        {t("top50")}
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className={cn(
                "glass group rounded-2xl p-3 md:p-4 flex items-center gap-4 transition-all hover:bg-white/5",
                track.global_rank === 1 && "border-secondary-500/30 bg-secondary-950/10",
                track.global_rank === 2 && "border-slate-400/30 bg-slate-900/10",
                track.global_rank === 3 && "border-orange-800/30 bg-orange-950/10"
            )}
          >
            {/* Rank Indicator */}
            <div className={cn(
                "flex-shrink-0 w-10 md:w-12 h-10 md:h-12 flex items-center justify-center font-display font-black text-xl md:text-2xl",
                track.global_rank === 1 ? "text-secondary-400" : 
                track.global_rank === 2 ? "text-slate-400" : 
                track.global_rank === 3 ? "text-orange-600" : "text-white/10"
            )}>
              #{track.global_rank}
            </div>

            {/* Album Art */}
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              {track.album_image_url ? (
                <Image 
                  src={track.album_image_url} 
                  alt={track.track_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-700 to-surface-800" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white truncate text-sm md:text-base">{track.track_name}</h3>
              <p className="text-xs md:text-sm text-slate-400 truncate">{track.artist_name}</p>
            </div>

            {/* Meta Info */}
            <div className="text-right flex flex-col items-end gap-1 flex-shrink-0 min-w-[70px]">
              <div className="flex items-center gap-1.5 text-secondary-400 font-bold text-sm md:text-base">
                <span>{track.global_score}</span>
                <span className="text-[10px] uppercase tracking-tighter text-slate-500 opacity-50">Pts</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500">
                <Users className="w-3 h-3" />
                <span>{track.backer_count}</span>
              </div>
            </div>

            {/* Spotify Link */}
            {track.spotify_uri && (
                <a 
                    href={track.spotify_uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-primary-400 transition-colors"
                    title={tCommon("listenOnSpotify")}
                >
                    <ExternalLink className="w-4 h-4 md:w-5 h-5" />
                </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
