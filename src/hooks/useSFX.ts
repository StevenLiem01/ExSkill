"use client";

import { useCallback, useRef, useEffect } from "react";

// Tipe untuk osilator
type WaveType = "sine" | "square" | "sawtooth" | "triangle";

export function useSFX() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Inisialisasi AudioContext secara lazy (hanya saat dibutuhkan/dipanggil)
  // Ini menghindari error autoplay policy di browser
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    
    return audioCtxRef.current;
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Fungsi helper internal untuk memainkan nada singkat
  const playTone = useCallback((
    frequency: number,
    type: WaveType = "sine",
    duration: number = 0.1,
    volume: number = 0.1
  ) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Envelope: Attack instan, decay eksponensial (suara perkusif/klik)
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("SFX Error:", e);
    }
  }, [getAudioContext]);

  // Bunyi klik/beep ringan frekuensi tinggi berdurasi sangat singkat (10-20ms)
  const playHover = useCallback(() => {
    playTone(800, "sine", 0.02, 0.02);
  }, [playTone]);

  // Bunyi perkusif yang lebih modern dan membulat ("pop" futuristik)
  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      
      // Frekuensi meluncur cepat (efek pop)
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      
      // Envelope perkusif cepat
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn("SFX Error:", e);
    }
  }, [getAudioContext]);

  // Bunyi chime atau nada naik (ascending)
  const playSuccess = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      // Arpeggio: 3 nada berurutan (C5, E5, G5)
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.value = freq;
        
        const startTime = now + (i * 0.1);
        const duration = 0.3;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn("SFX Error:", e);
    }
  }, [getAudioContext]);

  // Bunyi nada turun (descending) bergelombang sawtooth
  const playError = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      
      // Frekuensi meluncur turun
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("SFX Error:", e);
    }
  }, [getAudioContext]);

  // Bunyi tick terminal kecil untuk pengetikan di ChatBox
  const playType = useCallback(() => {
    playTone(1200, "triangle", 0.01, 0.01);
  }, [playTone]);

  return {
    playHover,
    playClick,
    playSuccess,
    playError,
    playType
  };
}
