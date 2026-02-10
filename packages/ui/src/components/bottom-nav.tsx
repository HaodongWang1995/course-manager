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
        "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white px-2 pb-safe",
        className
      )}
    >
      {displayItems.map((item) => {
        const isActive = activeHref === item.href;
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-center transition-colors",
              isActive
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
            <span
              className={cn(
                "truncate text-[10px] font-medium",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
