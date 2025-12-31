"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Mic, Square, Play, Trash2, Check } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string) => void;
  existingRecording?: string;
  label?: string;
  maxDuration?: number; // in seconds
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  existingRecording,
  label,
  maxDuration = 10,
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(existingRecording || null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setAudioUrl(base64);
          onRecordingComplete(base64);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    onRecordingComplete("");
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Record: "{label}"
        </p>
      )}

      <div className="flex items-center gap-3">
        {/* Recording button */}
        <motion.button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!audioUrl && !isRecording}
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
            isRecording
              ? "bg-red-500 text-white"
              : audioUrl
              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
              : "bg-[var(--primary)] text-white hover:opacity-90"
          )}
          whileTap={{ scale: 0.95 }}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}

          {/* Recording pulse animation */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Recording time / status */}
        <div className="flex-1">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-lg">{recordingTime}s</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                / {maxDuration}s max
              </span>
            </div>
          ) : audioUrl ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Recording saved</span>
            </div>
          ) : (
            <span className="text-sm text-[var(--muted-foreground)]">
              Tap to record
            </span>
          )}
        </div>

        {/* Playback / delete controls */}
        <AnimatePresence>
          {audioUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-2"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isPlaying ? stopPlaying : playRecording}
              >
                {isPlaying ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deleteRecording}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform visualization (simplified) */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-red-500 rounded-full"
              animate={{
                height: [8, 24, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
