// Voice personalization settings and management

export interface VoiceSettings {
  // TTS Settings
  voiceId: string;
  rate: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  volume: number; // 0 - 1

  // Personalization
  useCustomRecordings: boolean;
  preferFamilyVoice: boolean;

  // Per-category voice settings
  categoryVoices: Record<string, string>;
}

export interface CustomVoiceRecording {
  id: string;
  cardId: string;
  label: string;
  audioData: string; // Base64 encoded audio
  recordedBy: string; // "parent", "sibling", "therapist", etc.
  createdAt: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  relationship: "parent" | "sibling" | "therapist" | "grandparent" | "other";
  recordings: CustomVoiceRecording[];
  isDefault: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: "",
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
  useCustomRecordings: true,
  preferFamilyVoice: true,
  categoryVoices: {},
};

const STORAGE_KEY = "pecs-voice-settings";
const RECORDINGS_KEY = "pecs-voice-recordings";
const PROFILES_KEY = "pecs-voice-profiles";

// Get voice settings from localStorage
export function getVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SETTINGS;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_VOICE_SETTINGS;
    }
  }
  return DEFAULT_VOICE_SETTINGS;
}

// Save voice settings to localStorage
export function saveVoiceSettings(settings: Partial<VoiceSettings>): VoiceSettings {
  const current = getVoiceSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// Get custom recordings
export function getCustomRecordings(): CustomVoiceRecording[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(RECORDINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

// Save a custom recording
export function saveCustomRecording(recording: CustomVoiceRecording): void {
  const recordings = getCustomRecordings();
  const existingIndex = recordings.findIndex(
    (r) => r.cardId === recording.cardId && r.recordedBy === recording.recordedBy
  );

  if (existingIndex >= 0) {
    recordings[existingIndex] = recording;
  } else {
    recordings.push(recording);
  }

  localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
}

// Delete a custom recording
export function deleteCustomRecording(recordingId: string): void {
  const recordings = getCustomRecordings();
  const filtered = recordings.filter((r) => r.id !== recordingId);
  localStorage.setItem(RECORDINGS_KEY, JSON.stringify(filtered));
}

// Get recording for a specific card
export function getCardRecording(
  cardId: string,
  preferredRecordedBy?: string
): CustomVoiceRecording | null {
  const recordings = getCustomRecordings();
  const cardRecordings = recordings.filter((r) => r.cardId === cardId);

  if (cardRecordings.length === 0) return null;

  // If preferred recorder specified, try to find that one
  if (preferredRecordedBy) {
    const preferred = cardRecordings.find((r) => r.recordedBy === preferredRecordedBy);
    if (preferred) return preferred;
  }

  // Return most recent recording
  return cardRecordings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

// Get voice profiles
export function getVoiceProfiles(): VoiceProfile[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(PROFILES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

// Save voice profile
export function saveVoiceProfile(profile: VoiceProfile): void {
  const profiles = getVoiceProfiles();
  const existingIndex = profiles.findIndex((p) => p.id === profile.id);

  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }

  // If this is set as default, unset others
  if (profile.isDefault) {
    profiles.forEach((p) => {
      if (p.id !== profile.id) p.isDefault = false;
    });
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// Delete voice profile
export function deleteVoiceProfile(profileId: string): void {
  const profiles = getVoiceProfiles();
  const filtered = profiles.filter((p) => p.id !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));

  // Also delete associated recordings
  const recordings = getCustomRecordings();
  const profile = profiles.find((p) => p.id === profileId);
  if (profile) {
    const filteredRecordings = recordings.filter(
      (r) => !profile.recordings.some((pr) => pr.id === r.id)
    );
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(filteredRecordings));
  }
}

// Get available system voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return [];
  return window.speechSynthesis?.getVoices() || [];
}

// Get child-friendly voices (filtered)
export function getChildFriendlyVoices(): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();

  // Prefer certain voice types
  const preferredKeywords = ["samantha", "karen", "daniel", "alex", "victoria", "enhanced"];

  return voices.sort((a, b) => {
    const aScore = preferredKeywords.some((k) =>
      a.name.toLowerCase().includes(k)
    )
      ? 1
      : 0;
    const bScore = preferredKeywords.some((k) =>
      b.name.toLowerCase().includes(k)
    )
      ? 1
      : 0;
    return bScore - aScore;
  });
}
