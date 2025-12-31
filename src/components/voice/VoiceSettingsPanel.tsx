"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Volume2, Play, RotateCcw } from "lucide-react";
import {
  getVoiceSettings,
  saveVoiceSettings,
  getChildFriendlyVoices,
  type VoiceSettings,
} from "@/lib/audio/voice";

interface VoiceSettingsPanelProps {
  className?: string;
  onSettingsChange?: (settings: VoiceSettings) => void;
}

export function VoiceSettingsPanel({
  className,
  onSettingsChange,
}: VoiceSettingsPanelProps) {
  const [settings, setSettings] = React.useState<VoiceSettings>(getVoiceSettings());
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [isTestPlaying, setIsTestPlaying] = React.useState(false);

  // Load available voices
  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getChildFriendlyVoices();
      setVoices(availableVoices);

      // Set default voice if not set
      if (!settings.voiceId && availableVoices.length > 0) {
        handleChange({ voiceId: availableVoices[0].voiceURI });
      }
    };

    loadVoices();

    // Voices may load asynchronously
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleChange = (updates: Partial<VoiceSettings>) => {
    const newSettings = saveVoiceSettings(updates);
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const testVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    setIsTestPlaying(true);
    const utterance = new SpeechSynthesisUtterance("I want cookie please");

    const selectedVoice = voices.find((v) => v.voiceURI === settings.voiceId);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onend = () => setIsTestPlaying(false);
    utterance.onerror = () => setIsTestPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const resetToDefaults = () => {
    handleChange({
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Voice Selection */}
      <div className="space-y-2">
        <Label>Voice</Label>
        <select
          value={settings.voiceId}
          onChange={(e) => handleChange({ voiceId: e.target.value })}
          className="w-full h-12 px-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)]"
        >
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--muted-foreground)]">
          Choose a voice that your child responds well to
        </p>
      </div>

      {/* Speed Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Speed</Label>
          <span className="text-sm text-[var(--muted-foreground)]">
            {settings.rate.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={settings.rate}
          onChange={(e) => handleChange({ rate: parseFloat(e.target.value) })}
          className="w-full h-2 bg-[var(--muted)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>Slower</span>
          <span>Normal</span>
          <span>Faster</span>
        </div>
      </div>

      {/* Pitch Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Pitch</Label>
          <span className="text-sm text-[var(--muted-foreground)]">
            {settings.pitch.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={settings.pitch}
          onChange={(e) => handleChange({ pitch: parseFloat(e.target.value) })}
          className="w-full h-2 bg-[var(--muted)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>Lower</span>
          <span>Normal</span>
          <span>Higher</span>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Volume</Label>
          <span className="text-sm text-[var(--muted-foreground)]">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.volume}
          onChange={(e) => handleChange({ volume: parseFloat(e.target.value) })}
          className="w-full h-2 bg-[var(--muted)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-[var(--border)]">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-medium">Use Custom Recordings</span>
            <p className="text-xs text-[var(--muted-foreground)]">
              Play family voice recordings when available
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.useCustomRecordings}
            onChange={(e) =>
              handleChange({ useCustomRecordings: e.target.checked })
            }
            className="w-5 h-5 rounded accent-[var(--primary)]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-medium">Prefer Family Voice</span>
            <p className="text-xs text-[var(--muted-foreground)]">
              Use family recordings over TTS when both exist
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.preferFamilyVoice}
            onChange={(e) =>
              handleChange({ preferFamilyVoice: e.target.checked })
            }
            className="w-5 h-5 rounded accent-[var(--primary)]"
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={testVoice}
          disabled={isTestPlaying}
          className="flex-1"
        >
          {isTestPlaying ? (
            <>
              <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
              Playing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
