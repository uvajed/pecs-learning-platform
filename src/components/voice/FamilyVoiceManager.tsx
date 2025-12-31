"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { VoiceRecorder } from "./VoiceRecorder";
import { Plus, Trash2, User, Play, ChevronDown, ChevronUp } from "lucide-react";
import {
  getVoiceProfiles,
  saveVoiceProfile,
  deleteVoiceProfile,
  saveCustomRecording,
  type VoiceProfile,
  type CustomVoiceRecording,
} from "@/lib/audio/voice";
import { FOOD_CARDS, TOY_CARDS } from "@/lib/cards/cardData";

interface FamilyVoiceManagerProps {
  className?: string;
}

const RELATIONSHIPS = [
  { value: "parent", label: "Parent", icon: "👨‍👩‍👧" },
  { value: "sibling", label: "Sibling", icon: "👧" },
  { value: "grandparent", label: "Grandparent", icon: "👴" },
  { value: "therapist", label: "Therapist", icon: "👩‍⚕️" },
  { value: "other", label: "Other", icon: "👤" },
] as const;

// Get some common cards for voice recording
const COMMON_CARDS = [
  ...FOOD_CARDS.slice(0, 5),
  ...TOY_CARDS.slice(0, 5),
];

export function FamilyVoiceManager({ className }: FamilyVoiceManagerProps) {
  const [profiles, setProfiles] = React.useState<VoiceProfile[]>([]);
  const [isAddingProfile, setIsAddingProfile] = React.useState(false);
  const [expandedProfile, setExpandedProfile] = React.useState<string | null>(null);
  const [newProfileName, setNewProfileName] = React.useState("");
  const [newProfileRelationship, setNewProfileRelationship] =
    React.useState<VoiceProfile["relationship"]>("parent");

  // Load profiles
  React.useEffect(() => {
    setProfiles(getVoiceProfiles());
  }, []);

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;

    const profile: VoiceProfile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      relationship: newProfileRelationship,
      recordings: [],
      isDefault: profiles.length === 0,
    };

    saveVoiceProfile(profile);
    setProfiles(getVoiceProfiles());
    setNewProfileName("");
    setIsAddingProfile(false);
    setExpandedProfile(profile.id);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm("Delete this voice profile and all its recordings?")) {
      deleteVoiceProfile(profileId);
      setProfiles(getVoiceProfiles());
    }
  };

  const handleSetDefault = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      saveVoiceProfile({ ...profile, isDefault: true });
      setProfiles(getVoiceProfiles());
    }
  };

  const handleRecordingComplete = (
    profileId: string,
    cardId: string,
    cardLabel: string,
    audioData: string
  ) => {
    if (!audioData) return;

    const recording: CustomVoiceRecording = {
      id: `rec-${Date.now()}`,
      cardId,
      label: cardLabel,
      audioData,
      recordedBy: profileId,
      createdAt: new Date().toISOString(),
    };

    saveCustomRecording(recording);

    // Update profile's recordings list
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      saveVoiceProfile({
        ...profile,
        recordings: [...profile.recordings, recording],
      });
      setProfiles(getVoiceProfiles());
    }
  };

  const playRecording = (audioData: string) => {
    const audio = new Audio(audioData);
    audio.play();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Family Voice Bank</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Record familiar voices for personalized communication
          </p>
        </div>
        <Button onClick={() => setIsAddingProfile(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Voice
        </Button>
      </div>

      {/* Add Profile Form */}
      <AnimatePresence>
        {isAddingProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--muted)]/30 rounded-[var(--radius-lg)] space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Mom, Dad, Grandma"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {RELATIONSHIPS.map((rel) => (
                    <button
                      key={rel.value}
                      type="button"
                      onClick={() => setNewProfileRelationship(rel.value)}
                      className={cn(
                        "p-2 rounded-[var(--radius)] border-2 text-center transition-all",
                        newProfileRelationship === rel.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)] hover:border-[var(--primary)]/50"
                      )}
                    >
                      <span className="text-xl block">{rel.icon}</span>
                      <span className="text-xs">{rel.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingProfile(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim()}
                  className="flex-1"
                >
                  Add Voice Profile
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profiles List */}
      <div className="space-y-3">
        {profiles.length === 0 && !isAddingProfile ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No voice profiles yet</p>
            <p className="text-sm">Add family members to record their voices</p>
          </div>
        ) : (
          profiles.map((profile) => {
            const relationship = RELATIONSHIPS.find(
              (r) => r.value === profile.relationship
            );
            const isExpanded = expandedProfile === profile.id;

            return (
              <motion.div
                key={profile.id}
                layout
                className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden"
              >
                {/* Profile Header */}
                <button
                  onClick={() =>
                    setExpandedProfile(isExpanded ? null : profile.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{relationship?.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{profile.name}</span>
                        {profile.isDefault && (
                          <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {profile.recordings.length} recordings
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        {/* Actions */}
                        <div className="flex gap-2">
                          {!profile.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(profile.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>

                        {/* Recording cards */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium">
                            Record common words:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {COMMON_CARDS.map((card) => {
                              const existingRecording = profile.recordings.find(
                                (r) => r.cardId === card.id
                              );

                              return (
                                <div
                                  key={card.id}
                                  className="p-3 bg-[var(--muted)]/30 rounded-[var(--radius)] space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {card.label}
                                    </span>
                                    {existingRecording && (
                                      <button
                                        onClick={() =>
                                          playRecording(
                                            existingRecording.audioData
                                          )
                                        }
                                        className="p-1.5 rounded-full bg-[var(--primary)] text-white"
                                      >
                                        <Play className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <VoiceRecorder
                                    label={card.label}
                                    existingRecording={
                                      existingRecording?.audioData
                                    }
                                    onRecordingComplete={(audioData) =>
                                      handleRecordingComplete(
                                        profile.id,
                                        card.id,
                                        card.label,
                                        audioData
                                      )
                                    }
                                    maxDuration={5}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
