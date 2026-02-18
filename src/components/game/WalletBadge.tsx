"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { getUserBalance } from "@/app/actions/economy";
import { cn } from "@/lib/utils";

interface WalletBadgeProps {
  initialBalance?: number;
  className?: string;
}

export function WalletBadge({ initialBalance, className }: WalletBadgeProps) {
  const [balance, setBalance] = useState<number | null>(initialBalance ?? null);

  useEffect(() => {
    // Refresh balance on mount
    const fetchBalance = async () => {
      try {
        const currentBalance = await getUserBalance();
        setBalance(currentBalance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();
    
    // In a real app, we might subscribe to Supabase Realtime here
    // for immediate updates when transactions occur.
  }, []);

  if (balance === null) return <div className="w-12 h-6 bg-white/5 animate-pulse rounded-full" />;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full",
        "hover:bg-primary-500/20 transition-colors group cursor-default",
        className
      )}
    >
      <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Coins className="w-3 h-3 text-primary-400" />
      </div>
      <span className="text-sm font-bold text-primary-100 font-mono tracking-tight">
        {balance.toLocaleString()}
      </span>
    </div>
  );
}
