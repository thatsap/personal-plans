let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    if (!ctx) ctx = new C();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, at: number, dur: number) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(at);
  o.stop(at + dur);
}

export function restDoneSignal() {
  try {
    navigator.vibrate?.([180, 70, 180, 70, 420]);
  } catch {
    /* web only */
  }
  const a = audio();
  if (!a) return;
  void a.resume();
  const t = a.currentTime;
  tone(880, t, 0.18);
  tone(660, t + 0.2, 0.22);
  tone(990, t + 0.44, 0.28);
}

export function unlockAudio() {
  const a = audio();
  if (!a) return;
  void a.resume();
}
