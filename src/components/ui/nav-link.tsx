"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { type ComponentProps } from "react";
import { type LucideIcon } from "lucide-react";

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
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-2 rounded-xl transition-all duration-200 group hover:bg-white/5 ${
        isActive ? `text-primary-400 ${activeClassName}` : "text-slate-400 hover:text-white"
      } ${className}`}
      {...props}
    >
      <Icon className={`w-6 h-6 md:w-5 md:h-5 transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`} />
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
      
      {/* Active Indicator (Desktop only) */}
      {isActive && (
        <span className="hidden md:block absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full opacity-0" />
      )}
    </Link>
  );
}
