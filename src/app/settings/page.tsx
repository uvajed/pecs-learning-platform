"use client";

import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUIStore } from "@/stores/uiStore";
import { Volume2, VolumeX, Sparkles } from "lucide-react";


export default function SettingsPage() {
  const { soundEnabled, ttsEnabled, animationsEnabled, toggleSound, toggleTTS, toggleAnimations } =
    useUIStore();

  return (
    <DashboardShell>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="grid gap-6 max-w-2xl">
        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-[var(--primary)]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-[var(--muted-foreground)]" />
                )}
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Play sounds for success and feedback
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-7 rounded-full transition-colors ${
                  soundEnabled ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50">
              <div className="flex items-center gap-3">
                <Volume2
                  className={`w-5 h-5 ${
                    ttsEnabled ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                  }`}
                />
                <div>
                  <p className="font-medium">Text-to-Speech</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Read card labels aloud
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTTS}
                className={`w-12 h-7 rounded-full transition-colors ${
                  ttsEnabled ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    ttsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50">
              <div className="flex items-center gap-3">
                <Sparkles
                  className={`w-5 h-5 ${
                    animationsEnabled ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                  }`}
                />
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Enable success animations and transitions
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAnimations}
                className={`w-12 h-7 rounded-full transition-colors ${
                  animationsEnabled ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    animationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
