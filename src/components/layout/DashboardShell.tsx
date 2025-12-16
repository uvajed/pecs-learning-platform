"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header showNav />
      <Sidebar />
      <main
        className={cn(
          "pt-4 pb-8 px-4 md:px-6 lg:ml-64 lg:px-8 min-h-[calc(100vh-4rem)]",
          className
        )}
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

// Page header component for dashboard pages
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{title}</h1>
        {description && (
          <p className="mt-1 text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
