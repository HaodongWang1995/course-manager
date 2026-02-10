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
        "flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6",
        className
      )}
    >
      {/* Search input */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
      className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
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
      className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
          {initials}
        </div>
      )}
    </button>
  );
}
