"use client";

import { useState } from "react";
import { DashboardShell, PageHeader } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUIStore } from "@/stores/uiStore";
import { Volume2, VolumeX, Sparkles, Mic, Users, ChevronRight, Palette } from "lucide-react";
import { VoiceSettingsPanel, FamilyVoiceManager } from "@/components/voice";
import { ThemeSelector } from "@/components/themes";


export default function SettingsPage() {
  const { soundEnabled, ttsEnabled, animationsEnabled, toggleSound, toggleTTS, toggleAnimations } =
    useUIStore();
  const [activeSection, setActiveSection] = useState<"main" | "voice" | "family" | "themes">("main");

  if (activeSection === "voice") {
    return (
      <DashboardShell>
        <PageHeader
          title="Voice Settings"
          description="Customize text-to-speech voice"
          action={
            <button
              onClick={() => setActiveSection("main")}
              className="text-[var(--primary)] hover:underline"
            >
              ← Back to Settings
            </button>
          }
        />
        <div className="max-w-xl">
          <Card>
            <CardContent className="pt-6">
              <VoiceSettingsPanel />
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (activeSection === "family") {
    return (
      <DashboardShell>
        <PageHeader
          title="Family Voice Bank"
          description="Record familiar voices for your child"
          action={
            <button
              onClick={() => setActiveSection("main")}
              className="text-[var(--primary)] hover:underline"
            >
              ← Back to Settings
            </button>
          }
        />
        <div className="max-w-2xl">
          <FamilyVoiceManager />
        </div>
      </DashboardShell>
    );
  }

  if (activeSection === "themes") {
    return (
      <DashboardShell>
        <PageHeader
          title="Themes"
          description="Customize your app's appearance"
          action={
            <button
              onClick={() => setActiveSection("main")}
              className="text-[var(--primary)] hover:underline"
            >
              ← Back to Settings
            </button>
          }
        />
        <div className="max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <ThemeSelector />
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

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

        {/* Voice Personalization */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Personalization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setActiveSection("voice")}
              className="w-full flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-[var(--primary)]" />
                <div className="text-left">
                  <p className="font-medium">Voice Settings</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Customize text-to-speech voice and speed
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>

            <button
              onClick={() => setActiveSection("family")}
              className="w-full flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <div className="text-left">
                  <p className="font-medium">Family Voice Bank</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Record familiar voices for personalized speech
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </CardContent>
        </Card>

        {/* Themes */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setActiveSection("themes")}
              className="w-full flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-[var(--primary)]" />
                <div className="text-left">
                  <p className="font-medium">Themes</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Unlock and customize color themes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
