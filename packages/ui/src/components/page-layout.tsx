import { type ReactNode } from "react";
import { cn } from "../lib/utils";

export interface PageLayoutProps {
  /** Desktop sidebar (hidden below lg breakpoint) */
  sidebar: ReactNode;
  /** Top navigation bar */
  topBar: ReactNode;
  /** Mobile bottom navigation (hidden at lg breakpoint) */
  bottomNav?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Hide topbar on mobile — useful when bottomNav provides mobile navigation */
  hideTopBarOnMobile?: boolean;
}

/**
 * Responsive page layout with sidebar (desktop) and optional bottom nav (mobile).
 *
 * Usage patterns:
 * - Teacher: sidebar + topBar always visible, no bottomNav
 * - Student: sidebar + topBar desktop-only, bottomNav on mobile
 */
export function PageLayout({
  sidebar,
  topBar,
  bottomNav,
  children,
  hideTopBarOnMobile = false,
}: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {hideTopBarOnMobile ? (
          <div className="hidden lg:block">{topBar}</div>
        ) : (
          topBar
        )}

        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            bottomNav && "pb-20 lg:pb-6",
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {bottomNav && (
        <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
          {bottomNav}
        </div>
      )}
    </div>
  );
}
