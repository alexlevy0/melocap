
import { SpotifyTrack } from "@/types/spotify";
import { Card } from "@/components/ui/card";
import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface TrackCardProps {
  track: SpotifyTrack;
  variant?: "row" | "card";
  action?: React.ReactNode;
  className?: string;
  hideListenButton?: boolean;
}

export function TrackCard({ 
  track, 
  variant = "card", 
  action, 
  className,
  hideListenButton = false
}: TrackCardProps) {
  const t = useTranslations("common");
  const image = track.album.images[0]?.url;
  const spotifyUrl = track.external_urls.spotify;

  if (variant === "row") {
    return (
      <Card 
        variant="flat" 
        padding="sm" 
        className={`flex items-center gap-3 w-full hover:bg-white/5 transition-colors ${className}`}
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
          {image ? (
            <Image 
              src={image} 
              alt={track.album.name} 
              fill 
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-700">
              <span className="text-xs text-slate-500">No Img</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <h4 className="font-bold text-white truncate text-sm">
            {track.name}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {track.artists.map(a => a.name).join(", ")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!hideListenButton && (
            <a 
              href={spotifyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-green-500 transition-colors"
              title={t("listenOnSpotify")}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {action}
        </div>
      </Card>
    );
  }

  // Default "card" variant
  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      {/* Background Blur Effect */}
      {image && (
        <div className="absolute inset-0 opacity-20 blur-2xl pointer-events-none">
          <Image 
            src={image} 
            alt="" 
            fill 
            className="object-cover"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
          {image ? (
            <Image 
              src={image} 
              alt={track.album.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-800 flex items-center justify-center">
              <span className="text-slate-500">No Image</span>
            </div>
          )}
          
          {/* Play Overlay */}
          {!hideListenButton && (
            <a 
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-green-500 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                <Play className="w-8 h-8 text-black fill-current translate-x-0.5" />
              </div>
            </a>
          )}
        </div>

        <div className="space-y-1 w-full max-w-xs">
          <h3 className="text-xl font-bold text-white truncate px-2">
            {track.name}
          </h3>
          <p className="text-base text-slate-300 truncate px-2">
            {track.artists.map(a => a.name).join(", ")}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            {track.album.name}
          </p>
        </div>

        {action && (
          <div className="pt-2 w-full flex justify-center">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
}
