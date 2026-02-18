import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

type Leader = {
  rank: number;
  name: string;
  reputation: number;
  avatar_url?: string | null;
  trend?: string; // e.g. "Neon Dreams" (song name)
};

interface LeaderboardPodiumProps {
  top3: Leader[];
}

export function LeaderboardPodium({ top3 }: LeaderboardPodiumProps) {
  // Sort to ensure correct order: 2nd, 1st, 3rd (Visual order)
  const first = top3.find((l) => l.rank === 1);
  const second = top3.find((l) => l.rank === 2);
  const third = top3.find((l) => l.rank === 3);

  if (!first) return null;

  return (
    <div className="flex justify-center items-end gap-2 md:gap-8 py-8 mb-4 relative z-0">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm h-32 bg-primary-500/20 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* 2nd Place */}
      {second && (
        <PodiumItem 
          leader={second} 
          position="second"
          ringColor="border-slate-300"
          badgeColor="bg-slate-300 text-slate-900 shadow-slate-500/50" 
        />
      )}

      {/* 1st Place */}
      <PodiumItem 
        leader={first} 
        position="first"
        ringColor="border-yellow-400"
        badgeColor="bg-yellow-400 text-yellow-950 shadow-yellow-500/50"
      />

      {/* 3rd Place */}
      {third && (
        <PodiumItem 
          leader={third} 
          position="third"
          ringColor="border-orange-400"
          badgeColor="bg-orange-400 text-orange-950 shadow-orange-500/50"
        />
      )}
    </div>
  );
}

function PodiumItem({ 
  leader, 
  position, 
  ringColor,
  badgeColor 
}: { 
  leader: Leader; 
  position: "first" | "second" | "third";
  ringColor: string;
  badgeColor: string;
}) {
  const isFirst = position === "first";
  
  return (
    <div className={cn(
      "flex flex-col items-center transition-all duration-300",
      isFirst ? "-mt-8 scale-100 z-20" : "scale-90 opacity-90 hover:opacity-100 hover:scale-95 z-10"
    )}>
      <div className="relative mb-3 group">
        {/* Crown for #1 */}
        {isFirst && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce-slow z-30">
            <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
          </div>
        )}

        {/* Avatar Container with Ring */}
        <div className={cn(
          "rounded-full p-1 relative transition-all duration-500",
          isFirst ? "w-28 h-28 md:w-32 md:h-32 shadow-[0_0_40px_rgba(253,224,71,0.3)]" : "w-20 h-20 md:w-24 md:h-24 shadow-lg",
          ringColor,
          "border-4" // thick border
        )}>
           <Avatar 
            src={leader.avatar_url} 
            fallback={leader.name} 
            className="w-full h-full border-2 border-surface-900 bg-surface-800"
          />
          
          {/* Rank Badge */}
          <div className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-sm font-bold border-4 border-surface-900 min-w-[3rem] text-center shadow-lg transform group-hover:-translate-y-1 transition-transform",
            badgeColor
          )}>
            #{leader.rank}
          </div>
        </div>
      </div>

      <div className="text-center space-y-1 mt-4">
        <div className={cn(
          "font-display font-bold truncate max-w-[100px] md:max-w-[140px]", 
          isFirst ? "text-xl text-white" : "text-base text-slate-200"
        )}>
          {leader.name}
        </div>
        
        <div className={cn(
          "font-mono font-bold flex items-center justify-center gap-1", 
          isFirst ? "text-yellow-400" : "text-slate-400"
        )}>
          ⚡ {leader.reputation.toLocaleString()}
        </div>
        
        {leader.trend && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs text-slate-400 backdrop-blur-sm max-w-[120px]">
            <span className="truncate">🎵 {leader.trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
