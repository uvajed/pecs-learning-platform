"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, User, Check } from "lucide-react";
import { useActiveChild, useChildStore, Child } from "@/stores/childStore";

interface ChildSwitcherProps {
  className?: string;
  compact?: boolean;
  onAddChild?: () => void;
}

export function ChildSwitcher({ className, compact = false, onAddChild }: ChildSwitcherProps) {
  const { children, activeChild, setActiveChild, hasMultipleChildren } = useActiveChild();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChild = (childId: string) => {
    setActiveChild(childId);
    setIsOpen(false);
  };

  if (children.length === 0) {
    return (
      <button
        onClick={onAddChild}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] border border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors",
          className
        )}
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add Child</span>
      </button>
    );
  }

  if (!hasMultipleChildren && activeChild) {
    // Single child - show static display
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] bg-[var(--muted)]/50",
          className
        )}
      >
        <ChildAvatar child={activeChild} size={compact ? "sm" : "md"} />
        {!compact && (
          <span className="font-medium text-sm">{activeChild.name}</span>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] transition-colors",
          "bg-[var(--muted)]/50 hover:bg-[var(--muted)]",
          isOpen && "bg-[var(--muted)]"
        )}
      >
        {activeChild ? (
          <>
            <ChildAvatar child={activeChild} size={compact ? "sm" : "md"} />
            {!compact && (
              <span className="font-medium text-sm max-w-[100px] truncate">
                {activeChild.name}
              </span>
            )}
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-[var(--muted-foreground)]" />
            {!compact && <span className="text-sm">Select Child</span>}
          </>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--muted-foreground)] transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-[200px] p-2 bg-[var(--background)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg z-50"
          >
            {/* Children list */}
            <div className="space-y-1">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] transition-colors",
                    activeChild?.id === child.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "hover:bg-[var(--muted)]"
                  )}
                >
                  <ChildAvatar child={child} size="md" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{child.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Phase {child.currentPhase}
                    </p>
                  </div>
                  {activeChild?.id === child.id && (
                    <Check className="w-4 h-4 text-[var(--primary)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Add child button */}
            {onAddChild && (
              <>
                <div className="my-2 border-t border-[var(--border)]" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onAddChild();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">Add Another Child</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ChildAvatarProps {
  child: Child;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChildAvatar({ child, size = "md", className }: ChildAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-12 h-12 text-xl",
  };

  if (child.avatarUrl) {
    return (
      <img
        src={child.avatarUrl}
        alt={child.name}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (child.avatarEmoji) {
    return (
      <div
        className={cn(
          "rounded-full bg-[var(--primary)]/10 flex items-center justify-center",
          sizeClasses[size],
          className
        )}
      >
        {child.avatarEmoji}
      </div>
    );
  }

  // Default to initials
  const initials = child.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
