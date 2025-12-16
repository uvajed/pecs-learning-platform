"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, User, Settings, LogOut, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useUIStore } from "@/stores/uiStore";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  showNav?: boolean;
  className?: string;
}

export function Header({ user, showNav = true, className }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { soundEnabled, toggleSound } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)]",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--primary)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-[var(--foreground)]">PECS Learn</span>
        </Link>

        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/children"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Children
            </Link>
            <Link
              href="/cards"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Cards
            </Link>
            <Link
              href="/analytics"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Progress
            </Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-[var(--muted)] transition-colors"
              >
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--muted)] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[var(--muted)] transition-colors text-left"
                    onClick={() => {
                      // Handle logout
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default">Sign in</Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showNav && isMenuOpen && (
        <nav className="md:hidden border-t border-[var(--border)] bg-[var(--card)] py-4">
          <div className="container mx-auto px-4 flex flex-col gap-4">
            <Link
              href="/children"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Children
            </Link>
            <Link
              href="/cards"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cards
            </Link>
            <Link
              href="/analytics"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Progress
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
