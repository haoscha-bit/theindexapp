/**
 * usePrescriptAudio — manages audio playback for prescript reveal
 * PrescriptRandomizer.mp3 plays during scramble phase
 * PrescriptMessage.mp3 plays (looping) during typing reveal phase
 */
import { useRef, useCallback } from "react";

const RANDOMIZER_URL = "/assets/PrescriptRandomizer.mp3";
const MESSAGE_URL = "/assets/PrescriptMessage.mp3";

export function usePrescriptAudio() {
  const randomizerRef = useRef<HTMLAudioElement | null>(null);
  const messageRef = useRef<HTMLAudioElement | null>(null);

  const ensureRandomizer = useCallback(() => {
    if (!randomizerRef.current) {
      randomizerRef.current = new Audio(RANDOMIZER_URL);
      randomizerRef.current.volume = 0.6;
    }
    return randomizerRef.current;
  }, []);

  const ensureMessage = useCallback(() => {
    if (!messageRef.current) {
      messageRef.current = new Audio(MESSAGE_URL);
      messageRef.current.volume = 0.6;
      messageRef.current.loop = true; // Loop until we stop it
    }
    return messageRef.current;
  }, []);

  const playRandomizer = useCallback(() => {
    const audio = ensureRandomizer();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [ensureRandomizer]);

  const stopRandomizer = useCallback(() => {
    if (randomizerRef.current) {
      randomizerRef.current.pause();
      randomizerRef.current.currentTime = 0;
    }
  }, []);

  const playMessage = useCallback(() => {
    const audio = ensureMessage();
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(() => {});
  }, [ensureMessage]);

  const stopMessage = useCallback(() => {
    if (messageRef.current) {
      messageRef.current.pause();
      messageRef.current.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback(() => {
    stopRandomizer();
    stopMessage();
  }, [stopRandomizer, stopMessage]);

  return {
    playRandomizer,
    stopRandomizer,
    playMessage,
    stopMessage,
    stopAll,
  };
}
