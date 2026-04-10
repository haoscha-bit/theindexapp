/**
 * useSoundEffects — global sound effect utilities
 * Dice.mp3 for navigation switches
 * Menuclick.mp3 for action buttons
 * PrescriptMessage.mp3 for pass/fail result animations
 */
import { useRef, useCallback } from "react";

const DICE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663528861189/RhtPG9LggTLTG7ANMWXNdF/Dice_dba89ad0.mp3";
const MENUCLICK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663528861189/RhtPG9LggTLTG7ANMWXNdF/Menuclick_e2ed61c3.mp3";
const MESSAGE_URL = "/assets/PrescriptMessage.mp3";

// Singleton audio cache to avoid creating new Audio objects every render
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(url: string, volume = 0.6): HTMLAudioElement {
  if (!audioCache[url]) {
    audioCache[url] = new Audio(url);
    audioCache[url].volume = volume;
  }
  return audioCache[url];
}

export function playDice() {
  const audio = getAudio(DICE_URL, 0.5);
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function playMenuClick() {
  const audio = getAudio(MENUCLICK_URL, 0.5);
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function useSoundEffects() {
  const messageRef = useRef<HTMLAudioElement | null>(null);

  const playMessageLoop = useCallback(() => {
    if (!messageRef.current) {
      messageRef.current = new Audio(MESSAGE_URL);
      messageRef.current.volume = 0.6;
      messageRef.current.loop = true;
    }
    messageRef.current.currentTime = 0;
    messageRef.current.play().catch(() => {});
  }, []);

  const stopMessage = useCallback(() => {
    if (messageRef.current) {
      messageRef.current.pause();
      messageRef.current.currentTime = 0;
    }
  }, []);

  return {
    playDice,
    playMenuClick,
    playMessageLoop,
    stopMessage,
  };
}
