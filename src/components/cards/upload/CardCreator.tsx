"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "./ImageUpload";
import { Mic, MicOff, Play, Volume2 } from "lucide-react";
import type { CardType } from "@/types";

type CardCategory = "food" | "toys" | "actions" | "people" | "feelings" | "places" | "custom";

interface CardCreatorProps {
  onSave: (card: CustomCard) => void;
  onCancel?: () => void;
  editingCard?: CustomCard;
  className?: string;
}

export interface CustomCard {
  id: string;
  label: string;
  imageUrl: string;
  category: CardCategory;
  type: CardType;
  audioUrl?: string;
  createdAt: string;
}

const CATEGORIES: { value: CardCategory; label: string; icon: string }[] = [
  { value: "food", label: "Food", icon: "🍎" },
  { value: "toys", label: "Toys", icon: "🧸" },
  { value: "actions", label: "Actions", icon: "🏃" },
  { value: "people", label: "People", icon: "👨‍👩‍👧" },
  { value: "feelings", label: "Feelings", icon: "😊" },
  { value: "places", label: "Places", icon: "🏠" },
];

export function CardCreator({
  onSave,
  onCancel,
  editingCard,
  className,
}: CardCreatorProps) {
  const [label, setLabel] = React.useState(editingCard?.label || "");
  const [imageUrl, setImageUrl] = React.useState<string | null>(
    editingCard?.imageUrl || null
  );
  const [category, setCategory] = React.useState<CardCategory>(
    editingCard?.category || "toys"
  );
  const [audioUrl, setAudioUrl] = React.useState<string | undefined>(
    editingCard?.audioUrl
  );
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const isValid = label.trim() !== "" && imageUrl !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const card: CustomCard = {
      id: editingCard?.id || `custom-${Date.now()}`,
      label: label.trim(),
      imageUrl: imageUrl!,
      category,
      type: "noun",
      audioUrl,
      createdAt: editingCard?.createdAt || new Date().toISOString(),
    };

    onSave(card);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.onload = (e) => {
          setAudioUrl(e.target?.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const removeAudio = () => {
    setAudioUrl(undefined);
  };

  React.useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Card Image</label>
        <ImageUpload
          value={imageUrl || undefined}
          onChange={setImageUrl}
        />
      </div>

      {/* Label input */}
      <div>
        <label className="block text-sm font-medium mb-2">Card Label</label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Cookie, Ball, Mom"
          className="text-lg"
        />
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          This is what will be spoken when the card is selected
        </p>
      </div>

      {/* Category selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "p-3 rounded-[var(--radius)] border-2 text-center transition-all",
                category === cat.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice recording */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Custom Voice (Optional)
        </label>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          Record a custom pronunciation or use a family member's voice
        </p>

        <div className="flex items-center gap-3">
          {audioUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={playAudio}
              >
                <Play className="w-4 h-4 mr-2" />
                Play Recording
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={removeAudio}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop ({recordingTime}s)
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Voice
                </>
              )}
            </Button>
          )}
        </div>

        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-2 text-red-500"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording...</span>
          </motion.div>
        )}
      </div>

      {/* Preview */}
      {imageUrl && label && (
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border-2 border-[var(--primary)] bg-white shadow-lg"
          >
            <div className="w-24 h-24 rounded-[var(--radius)] overflow-hidden bg-[var(--muted)]">
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">{label}</span>
            {audioUrl && (
              <button
                type="button"
                onClick={playAudio}
                className="text-[var(--primary)]"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!isValid} className="flex-1">
          {editingCard ? "Update Card" : "Create Card"}
        </Button>
      </div>
    </form>
  );
}
