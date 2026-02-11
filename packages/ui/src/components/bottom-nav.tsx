"use client";

import { cn } from "../lib/utils";
import { type LucideIcon } from "lucide-react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  activeHref: string;
  className?: string;
}

export function BottomNav({ items, activeHref, className }: BottomNavProps) {
  const displayItems = items.slice(0, 4);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-2 pb-[max(9px,env(safe-area-inset-bottom))] pt-[9px]",
        className
      )}
    >
      <div className="flex h-16 w-full items-center">
        {displayItems.map((item) => {
          const isActive = activeHref === item.href;
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-center transition-colors",
                isActive ? "text-[#137fec]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-[#137fec]")} />
              <span
                className={cn(
                  "truncate text-[10px] font-medium leading-[15px]",
                  isActive ? "text-[#137fec]" : "text-slate-400"
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
