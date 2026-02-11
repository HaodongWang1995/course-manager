"use client";

import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Bell, Search } from "lucide-react";

export interface TopBarProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  children?: ReactNode;
  className?: string;
}

export function TopBar({
  searchPlaceholder = "Search courses, students...",
  onSearch,
  children,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-[65px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6",
        className
      )}
    >
      {/* Search input */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#137fec]/40 focus:bg-white focus:ring-2 focus:ring-[#137fec]/15"
        />
      </div>

      {/* Right side actions */}
      <div className="ml-4 flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      <Bell className="h-5 w-5" />
      {count != null && count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export interface UserAvatarProps {
  name: string;
  avatar?: string;
  onClick?: () => void;
}

export function UserAvatar({ name, avatar, onClick }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-xs font-semibold text-slate-600">
          {initials}
        </div>
      )}
    </button>
  );
}
