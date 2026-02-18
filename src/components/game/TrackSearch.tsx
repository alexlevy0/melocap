
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SpotifyTrack } from "@/types/spotify";
import { Search, Loader2 } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { useTranslations } from "next-intl";

interface TrackSearchProps {
  onSelect: (track: SpotifyTrack) => void;
  selectedTrackId?: string;
  placeholder?: string;
}

export function TrackSearch({ onSelect, selectedTrackId, placeholder }: TrackSearchProps) {
  const t = useTranslations("common");
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

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t("search")}
          className="w-full bg-surface-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
        )}
      </div>

      {/* Results List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {results.map((track) => {
          const isSelected = track.id === selectedTrackId;

          return (
            <div 
              key={track.id}
              onClick={() => onSelect(track)}
              className="cursor-pointer"
            >
              <TrackCard 
                track={track} 
                variant="row" 
                className={`transition-colors ${
                  isSelected 
                    ? "bg-primary-500/20 ring-1 ring-primary-500" 
                    : ""
                }`}
              />
            </div>
          );
        })}
        
        {debouncedQuery && !loading && results.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            {t("noTracksFound")}
          </div>
        )}
      </div>
    </div>
  );
}
