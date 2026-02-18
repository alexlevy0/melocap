"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserRank = {
  rank: number;
  name: string;
  reputation: number;
  avatar_url?: string | null;
  trend?: string;
};

interface UserRankBarProps {
  userRank: UserRank;
}

export function UserRankBar({ userRank }: UserRankBarProps) {
  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-40">
      <div className="glass-strong rounded-full p-2 pr-6 flex items-center gap-4 border border-primary-500/30 shadow-[0_0_30px_rgba(124,58,237,0.3)] animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Rank Badge */}
        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white shadow-inner">
          #{userRank.rank}
        </div>

        {/* User Info */}
        <div className="flex-1 flex items-center gap-3">
           <Avatar 
            src={userRank.avatar_url} 
            fallback={userRank.name} 
            size="sm"
            className="border-2 border-primary-400"
          />
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm">You</span>
            {userRank.trend && (
              <span className="text-xs text-primary-200 truncate max-w-[120px]">
                {userRank.trend}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="font-mono font-bold text-yellow-400">
          +{userRank.reputation.toLocaleString()} 🪙
        </div>
      </div>
    </div>
  );
}
