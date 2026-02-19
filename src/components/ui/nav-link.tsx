"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { type ComponentProps } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  icon: LucideIcon;
  label: string;
  activeClassName?: string;
  className?: string;
};

export function NavLink({ href, icon: Icon, label, className = "", activeClassName = "text-primary-400", ...props }: NavLinkProps) {
  const pathname = usePathname();
  // Simple check: active if pathname starts with href (for sections) or is exact match (for home)
  // For home '/', we need exact match to avoid being always active
  const isActive = href === "/" 
    ? pathname === "/" 
    : pathname.startsWith(href.toString());

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-2 rounded-xl transition-all duration-300 group relative",
        isActive 
          ? "text-primary-400 bg-primary-500/10 md:bg-transparent" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
      {...props}
    >
      {/* Active Glow for Mobile */}
      {isActive && (
        <div className="absolute inset-0 bg-primary-500/20 blur-lg rounded-full md:hidden" />
      )}

      <Icon 
        className={cn(
          "w-6 h-6 md:w-5 md:h-5 transition-transform duration-300 relative z-10",
          isActive ? "scale-110 text-primary-400" : "group-hover:scale-110"
        )} 
      />
      <span className={cn(
        "text-[10px] md:text-sm font-medium relative z-10 transition-colors",
        isActive ? "text-primary-300" : "text-slate-500 group-hover:text-slate-300"
      )}>
        {label}
      </span>
      
      {/* Active Indicator (Desktop only) */}
      {isActive && (
        <span className="hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full" />
      )}
    </Link>
  );
}
