import { type ReactNode } from "react";
import { cn } from "../lib/utils";

export interface DesktopLayoutProps {
  sidebar: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DesktopLayout({
  sidebar,
  topBar,
  children,
  className,
}: DesktopLayoutProps) {
  return (
    <div className={cn("hidden h-screen md:flex", className)}>
      {/* Sidebar */}
      {sidebar}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {topBar}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export interface MobileLayoutProps {
  topBar?: ReactNode;
  bottomNav: ReactNode;
  children: ReactNode;
  className?: string;
}

export function MobileLayout({
  topBar,
  bottomNav,
  children,
  className,
}: MobileLayoutProps) {
  return (
    <div className={cn("flex h-screen flex-col md:hidden", className)}>
      {topBar}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20">
        {children}
      </main>
      {bottomNav}
    </div>
  );
}

export interface PageLayoutProps {
  sidebar: ReactNode;
  topBar?: ReactNode;
  bottomNav: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  sidebar,
  topBar,
  bottomNav,
  children,
}: PageLayoutProps) {
  return (
    <>
      <DesktopLayout sidebar={sidebar} topBar={topBar}>
        {children}
      </DesktopLayout>
      <MobileLayout topBar={topBar} bottomNav={bottomNav}>
        {children}
      </MobileLayout>
    </>
  );
}
