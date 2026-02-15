import { useCallback, useRef } from "react";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (localStorage.getItem("lovesync-notification-sound") === "false") return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Silent fail
    }
  }, []);

  return { playNotificationSound: play };
}
