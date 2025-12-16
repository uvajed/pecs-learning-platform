// Text-to-Speech utilities using Web Speech API

let speechSynthesis: SpeechSynthesis | null = null;
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

if (typeof window !== "undefined") {
  speechSynthesis = window.speechSynthesis;
}

export interface TTSOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  voice?: SpeechSynthesisVoice;
}

const defaultOptions: TTSOptions = {
  rate: 0.9, // Slightly slower for clarity
  pitch: 1,
  volume: 1,
};

// Priority list of natural-sounding voices (ordered by preference)
const PREFERRED_VOICES = [
  // Premium/Neural voices (most natural)
  "Google US English",
  "Google UK English Female",
  "Microsoft Zira",
  "Microsoft Jenny",
  "Samantha", // macOS
  "Karen", // macOS Australian
  "Moira", // macOS Irish
  "Fiona", // macOS Scottish
  "Victoria", // macOS
  "Tessa", // macOS South African
  // Fallbacks
  "Alex", // macOS
  "Daniel", // macOS British
];

function selectBestVoice(): SpeechSynthesisVoice | null {
  if (!speechSynthesis) return null;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Try to find a preferred voice
  for (const preferredName of PREFERRED_VOICES) {
    const voice = voices.find(v =>
      v.name.includes(preferredName) && v.lang.startsWith("en")
    );
    if (voice) return voice;
  }

  // Fallback: find any English voice that's not the default robotic one
  // Prefer voices with "Premium", "Enhanced", "Neural", or "Natural" in the name
  const enhancedVoice = voices.find(v =>
    v.lang.startsWith("en") &&
    (v.name.toLowerCase().includes("premium") ||
     v.name.toLowerCase().includes("enhanced") ||
     v.name.toLowerCase().includes("neural") ||
     v.name.toLowerCase().includes("natural"))
  );
  if (enhancedVoice) return enhancedVoice;

  // Last fallback: any English female voice (often more pleasant)
  const englishVoice = voices.find(v =>
    v.lang.startsWith("en") &&
    !v.name.toLowerCase().includes("compact") &&
    !v.name.toLowerCase().includes("espeak")
  );

  return englishVoice || voices.find(v => v.lang.startsWith("en")) || null;
}

function ensureVoicesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (!speechSynthesis) {
      resolve();
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (!voicesLoaded) {
        cachedVoice = selectBestVoice();
        voicesLoaded = true;
      }
      resolve();
      return;
    }

    // Voices haven't loaded yet - wait for them
    speechSynthesis.onvoiceschanged = () => {
      cachedVoice = selectBestVoice();
      voicesLoaded = true;
      resolve();
    };

    // Timeout fallback in case onvoiceschanged never fires
    setTimeout(() => {
      if (!voicesLoaded) {
        cachedVoice = selectBestVoice();
        voicesLoaded = true;
      }
      resolve();
    }, 500);
  });
}

export async function speak(text: string, options: TTSOptions = {}): Promise<void> {
  if (!speechSynthesis) {
    throw new Error("Speech synthesis not available");
  }

  // Ensure voices are loaded before speaking
  await ensureVoicesLoaded();

  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    speechSynthesis!.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const opts = { ...defaultOptions, ...options };

    utterance.rate = opts.rate!;
    utterance.pitch = opts.pitch!;
    utterance.volume = opts.volume!;

    // Use provided voice, cached best voice, or let browser pick default
    if (opts.voice) {
      utterance.voice = opts.voice;
    } else if (cachedVoice) {
      utterance.voice = cachedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    speechSynthesis!.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return speechSynthesis?.speaking ?? false;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesis) return [];
  return speechSynthesis.getVoices();
}

export function getChildFriendlyVoices(): SpeechSynthesisVoice[] {
  const voices = getVoices();
  // Filter to natural-sounding English voices
  const friendlyVoices = voices.filter((voice) => {
    if (!voice.lang.startsWith("en")) return false;
    const name = voice.name.toLowerCase();
    // Exclude robotic/low-quality voices
    if (name.includes("espeak") || name.includes("compact")) return false;
    // Include known good voices
    return PREFERRED_VOICES.some(pref => voice.name.includes(pref)) ||
      name.includes("premium") ||
      name.includes("enhanced") ||
      name.includes("neural") ||
      name.includes("natural") ||
      name.includes("female") ||
      name.includes("samantha") ||
      name.includes("karen") ||
      name.includes("victoria");
  });
  return friendlyVoices.length > 0 ? friendlyVoices : voices.filter(v => v.lang.startsWith("en"));
}

// Get the currently selected voice
export function getCurrentVoice(): SpeechSynthesisVoice | null {
  return cachedVoice;
}

// Preload voices on app startup for faster first speak
export async function initializeTTS(): Promise<void> {
  await ensureVoicesLoaded();
}

// Speak a card label with appropriate settings for children
export function speakCardLabel(label: string, options: TTSOptions = {}): Promise<void> {
  return speak(label, {
    rate: 0.85, // Slower for comprehension
    pitch: 1.1, // Slightly higher pitch
    ...options,
  });
}

// Speak encouragement/reinforcement
export function speakEncouragement(message: string, options: TTSOptions = {}): Promise<void> {
  return speak(message, {
    rate: 1,
    pitch: 1.2, // Enthusiastic
    ...options,
  });
}

// Common encouragement phrases
export const ENCOURAGEMENT_PHRASES = [
  "Great job!",
  "Well done!",
  "You did it!",
  "Excellent!",
  "Perfect!",
  "Super!",
  "Wonderful!",
  "Keep it up!",
  "That's right!",
  "Amazing!",
];

export function getRandomEncouragement(): string {
  return ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
}
