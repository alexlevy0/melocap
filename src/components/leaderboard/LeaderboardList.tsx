import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type RunnerUp = {
  rank: number;
  name: string;
  reputation: number;
  avatar_url?: string | null;
  trend?: string;
  isCurrentUser?: boolean;
};

interface LeaderboardListProps {
  runnersUp: RunnerUp[];
}

export function LeaderboardList({ runnersUp }: LeaderboardListProps) {
  return (
    <div className="space-y-3 pb-24">
      {runnersUp.map((runner) => (
        <LeaderboardRow key={runner.rank} runner={runner} />
      ))}
    </div>
  );
}

function LeaderboardRow({ runner }: { runner: RunnerUp }) {
  return (
    <div className={cn(
      "relative group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300",
      runner.isCurrentUser 
        ? "bg-primary-500/10 border-primary-500/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]" 
        : "glass hover:bg-white/5 border-white/5 hover:border-white/10"
    )}>
      {/* Rank */}
      <div className="w-8 font-mono text-lg font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
        {String(runner.rank).padStart(2, '0')}
      </div>

      {/* Avatar */}
      <Avatar 
        src={runner.avatar_url} 
        fallback={runner.name} 
        size="md"
        className={cn(
          "border-2 transition-colors",
          runner.isCurrentUser ? "border-primary-500" : "border-transparent group-hover:border-white/10"
        )}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-bold truncate",
          runner.isCurrentUser ? "text-primary-100" : "text-white"
        )}>
          {runner.name}
        </div>
        {runner.trend && (
          <div className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
            Predicting: <span className="text-slate-400 group-hover:text-slate-300">{runner.trend}</span>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-mono font-bold text-yellow-400 drop-shadow-sm">
          +{runner.reputation.toLocaleString()} 🪙
        </div>
      </div>
    </div>
  );
}
