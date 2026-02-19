
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SpotifyTrack } from "@/types/spotify";
import { Search, Loader2, Music2, Plus, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TrackSearchProps {
  onSelect: (track: SpotifyTrack) => void;
  selectedTrackId?: string;
  placeholder?: string;
}

const TRENDING_TAGS = [
  "Hyperpop", "Cyberpunk 2077", "Synthwave", "Gaming Mix", "Phonk", "Anime OST"
];

export function TrackSearch({ onSelect, selectedTrackId, placeholder }: TrackSearchProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    async function fetchTracks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        if (data.tracks) {
          setResults(data.tracks);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [debouncedQuery]);

  const handleSelect = (track: SpotifyTrack) => {
    onSelect(track);
    toast.success(
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white/20">
            {track.album.images[0]?.url && (
              <Image src={track.album.images[0].url} alt="" fill className="object-cover" />
            )}
         </div>
         <div>
           <p className="font-bold text-sm">{t("game.search.added")}</p>
           <p className="text-xs text-slate-400 truncate max-w-[150px]">{track.name}</p>
         </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t("common.search")}
          className="relative w-full bg-surface-800/80 backdrop-blur-md border border-white/5 rounded-full py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-lg"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
        ) : query && (
          <button 
            type="button"
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 hover:text-white transition-colors flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Clear search"
          >
           ×
          </button>
        )}
      </div>

      {/* Trending Tags (Only when no query) */}
      {!query && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {t("game.search.trending")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-1.5 rounded-full bg-surface-800 border border-white/5 text-sm text-slate-300 hover:text-white hover:bg-surface-700 hover:border-primary-500/30 transition-all active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {results.map((track, i) => {
          const isSelected = track.id === selectedTrackId;

          return (
            <button 
              key={track.id}
              onClick={() => handleSelect(track)}
              className={cn(
                "group relative flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 border w-full text-left",
                isSelected 
                  ? "bg-primary-500/10 border-primary-500/30" 
                  : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5",
                "animate-in fade-in slide-in-from-bottom-2"
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Album Art */}
              <div className={cn(
                "relative w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 transition-all flex-shrink-0",
                isSelected ? "border-primary-500" : "border-surface-800 group-hover:border-white/10"
              )}>
                {track.album.images[0]?.url ? (
                  <Image 
                    src={track.album.images[0].url} 
                    alt={track.album.name} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-slate-600" />
                  </div>
                )}
                
                {/* Playing Indicator Overlay */}
                {isSelected && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-1 h-3 bg-primary-400 mx-[1px] animate-pulse" />
                      <div className="w-1 h-4 bg-primary-400 mx-[1px] animate-pulse delay-75" />
                      <div className="w-1 h-2 bg-primary-400 mx-[1px] animate-pulse delay-150" />
                   </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-bold truncate text-sm transition-colors",
                  isSelected ? "text-primary-100" : "text-white"
                )}>
                  {track.name}
                </h4>
                <p className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                  {track.artists.map(a => a.name).join(", ")} • {track.album.name}
                </p>
              </div>

              {/* Action Button */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg flex-shrink-0",
                isSelected 
                  ? "bg-primary-500 text-white scale-110 shadow-primary-500/25" 
                  : "bg-surface-800 text-slate-400 group-hover:text-white group-hover:bg-surface-700"
              )}>
                {isSelected ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </div>
            </button>
          );
        })}
        
        {debouncedQuery && !loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
            <Search className="w-8 h-8 opacity-20" />
            <span className="text-sm">{t("common.noTracksFound")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
