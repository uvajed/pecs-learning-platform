"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useChildStore, ChildPreferences } from "@/stores/childStore";

interface AddChildDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (childId: string) => void;
}

const AVATAR_EMOJIS = [
  "🧒", "👧", "👦", "🧒🏻", "🧒🏼", "🧒🏽", "🧒🏾", "🧒🏿",
  "🦸", "🦹", "🧙", "🧚", "🐱", "🐶", "🦊", "🐻",
  "🌟", "🌈", "🎨", "🎵", "🚀", "🎈", "🦋", "🌻",
];

const REWARD_STYLES: { value: ChildPreferences["rewardStyle"]; label: string; icon: string }[] = [
  { value: "stars", label: "Stars", icon: "⭐" },
  { value: "balloons", label: "Balloons", icon: "🎈" },
  { value: "confetti", label: "Confetti", icon: "🎊" },
  { value: "fireworks", label: "Fireworks", icon: "🎆" },
];

export function AddChildDialog({ isOpen, onClose, onSuccess }: AddChildDialogProps) {
  const { addChild, setActiveChild } = useChildStore();

  const [name, setName] = React.useState("");
  const [avatarEmoji, setAvatarEmoji] = React.useState("🧒");
  const [currentPhase, setCurrentPhase] = React.useState(1);
  const [rewardStyle, setRewardStyle] = React.useState<ChildPreferences["rewardStyle"]>("stars");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const newChild = addChild({
      name: name.trim(),
      avatarEmoji,
      currentPhase,
      preferences: {
        favoriteCards: [],
        rewardStyle,
        soundEnabled: true,
        animationsEnabled: true,
        sessionDurationMinutes: 10,
      },
    });

    setActiveChild(newChild.id);
    onSuccess?.(newChild.id);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setAvatarEmoji("🧒");
    setCurrentPhase(1);
    setRewardStyle("stars");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md"
          >
            <div className="bg-[var(--background)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold">Add Child Profile</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child's Name</Label>
                  <Input
                    id="child-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    autoFocus
                  />
                </div>

                {/* Avatar */}
                <div className="space-y-2">
                  <Label>Choose an Avatar</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={cn(
                          "w-10 h-10 text-xl rounded-[var(--radius)] transition-all flex items-center justify-center",
                          avatarEmoji === emoji
                            ? "bg-[var(--primary)] ring-2 ring-[var(--primary)] ring-offset-2"
                            : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Phase */}
                <div className="space-y-2">
                  <Label>Starting Phase</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((phase) => (
                      <button
                        key={phase}
                        type="button"
                        onClick={() => setCurrentPhase(phase)}
                        className={cn(
                          "py-2 rounded-[var(--radius)] font-medium transition-all",
                          currentPhase === phase
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--muted)] hover:bg-[var(--muted)]/80"
                        )}
                      >
                        {phase}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Select which PECS phase to start with
                  </p>
                </div>

                {/* Reward Style */}
                <div className="space-y-2">
                  <Label>Reward Animation</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {REWARD_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setRewardStyle(style.value)}
                        className={cn(
                          "py-2 px-3 rounded-[var(--radius)] text-center transition-all",
                          rewardStyle === style.value
                            ? "bg-[var(--primary)]/10 border-2 border-[var(--primary)]"
                            : "bg-[var(--muted)] border-2 border-transparent hover:border-[var(--border)]"
                        )}
                      >
                        <span className="text-xl block mb-1">{style.icon}</span>
                        <span className="text-xs">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1"
                  >
                    Add Child
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
