"use client";

import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { ChevronDown, type LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  sections?: SidebarSection[];
  activeHref: string;
  user: SidebarUser;
  appName?: string;
  className?: string;
}

function NavItem({
  item,
  isActive,
}: {
  item: SidebarItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#137fec]/10 text-[#137fec]"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", isActive ? "text-[#137fec]" : "text-slate-400")}
      />
      <span>{item.label}</span>
    </a>
  );
}

function NavSection({
  section,
  activeHref,
  defaultOpen = true,
}: {
  section: SidebarSection;
  activeHref: string;
  defaultOpen?: boolean;
}) {
  if (!section.title) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={activeHref === item.href}
          />
        ))}
      </div>
    );
  }

  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>{section.title}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-1 space-y-1">
        {section.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={activeHref === item.href}
          />
        ))}
      </div>
    </details>
  );
}

export function Sidebar({
  items,
  sections,
  activeHref,
  user,
  appName = "EduManager",
  className,
}: SidebarProps) {
  const navSections: SidebarSection[] = sections ?? [{ items }];

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200 bg-white",
        className
      )}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#137fec] text-sm font-bold text-white">
          {appName.charAt(0)}
        </div>
        <span className="text-lg font-bold text-slate-900">{appName}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section, index) => (
          <NavSection
            key={section.title ?? index}
            section={section}
            activeHref={activeHref}
          />
        ))}
      </nav>

      {/* User profile card */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-200 text-sm font-semibold text-slate-600">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
