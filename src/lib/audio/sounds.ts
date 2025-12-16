// Sound effects manager

export type SoundEffect = "success" | "click" | "drop" | "error" | "reward";

// Sound effect URLs (you can replace with actual audio files)
const SOUND_URLS: Record<SoundEffect, string> = {
  success: "/sounds/success.mp3",
  click: "/sounds/click.mp3",
  drop: "/sounds/drop.mp3",
  error: "/sounds/error.mp3",
  reward: "/sounds/reward.mp3",
};

// Audio cache
const audioCache: Map<SoundEffect, HTMLAudioElement> = new Map();

function getAudio(sound: SoundEffect): HTMLAudioElement {
  if (!audioCache.has(sound)) {
    const audio = new Audio(SOUND_URLS[sound]);
    audioCache.set(sound, audio);
  }
  return audioCache.get(sound)!;
}

export function playSound(sound: SoundEffect, volume: number = 0.7): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    try {
      const audio = getAudio(sound);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0;

      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`Failed to play sound: ${sound}`));

      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
        resolve();
      });
    } catch {
      resolve();
    }
  });
}

export function preloadSounds(): void {
  if (typeof window === "undefined") return;

  Object.keys(SOUND_URLS).forEach((sound) => {
    getAudio(sound as SoundEffect);
  });
}

// Combine TTS with sound effect for positive reinforcement
export async function playSuccessFeedback(volume: number = 0.7): Promise<void> {
  await playSound("success", volume);
}

export async function playRewardFeedback(volume: number = 0.7): Promise<void> {
  await playSound("reward", volume);
}
