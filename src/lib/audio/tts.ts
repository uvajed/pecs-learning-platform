// Text-to-Speech utilities using Web Speech API

let speechSynthesis: SpeechSynthesis | null = null;

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

export function speak(text: string, options: TTSOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error("Speech synthesis not available"));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const opts = { ...defaultOptions, ...options };

    utterance.rate = opts.rate!;
    utterance.pitch = opts.pitch!;
    utterance.volume = opts.volume!;

    if (opts.voice) {
      utterance.voice = opts.voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    speechSynthesis.speak(utterance);
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
  // Prefer English voices, female voices often perceived as friendlier for children
  return voices.filter(
    (voice) =>
      voice.lang.startsWith("en") &&
      (voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("karen") ||
        voice.name.toLowerCase().includes("victoria"))
  );
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
