// Generates a clean, tiny PCM WAV data URI for a subtle notification pop sound
// Used with native Audio object when FloatingWhatsApp greeting appears.
function createNotificationPopWavDataUri(): string {
  const sampleRate = 22050;
  const durationSec = 0.14;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 580 + (t / durationSec) * 440;
    const envelope = Math.sin((t / durationSec) * Math.PI) * Math.exp(-t * 14);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.32;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

let cachedPopUri: string | null = null;

export function playNotificationPop(): void {
  try {
    if (!cachedPopUri) {
      cachedPopUri = createNotificationPopWavDataUri();
    }
    const audio = new Audio(cachedPopUri);
    audio.volume = 0.35;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Browsers may block audio until first user gesture; silently ignore
      });
    }
  } catch {
    // Ignore audio errors in restricted environments
  }
}
