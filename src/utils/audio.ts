/**
 * Audio Synthesizer & Speech Helper for "Antrean Sentra Pelayanan Kito"
 * Dinas Sosial Kota Tanjungbalai
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant two-tone chime bell sound before announcement
 */
export async function playChime(volume = 0.8): Promise<void> {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    
    gain1.gain.setValueAtTime(volume * 0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2: A5 (880 Hz) - slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.25);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(volume * 0.5, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.25);
    osc2.stop(now + 1.2);

    // Wait for chime to complete
    return new Promise((resolve) => setTimeout(resolve, 1100));
  } catch (err) {
    console.warn("Chime audio playback error:", err);
    return Promise.resolve();
  }
}

/**
 * Asynchronously loads available SpeechSynthesis voices
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(voices);
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    // Fallback if event doesn't trigger within 800ms
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 800);
  });
}

/**
 * Gets preferred voice name from localStorage
 */
export function getSavedVoiceName(): string | null {
  try {
    return localStorage.getItem('preferred_queue_voice');
  } catch {
    return null;
  }
}

/**
 * Saves preferred voice name to localStorage
 */
export function saveVoiceName(name: string): void {
  try {
    localStorage.setItem('preferred_queue_voice', name);
  } catch (e) {
    console.error("Failed to save voice preference", e);
  }
}

/**
 * Finds the best Indonesian voice or user's selected voice
 */
export async function getBestIndonesianVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const savedName = getSavedVoiceName();
  if (savedName) {
    const matchedSaved = voices.find(v => v.name === savedName);
    if (matchedSaved) return matchedSaved;
  }

  // Find Indonesian voice by language tag or name
  const idVoice = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang.startsWith('id') ||
      lang.includes('id-id') ||
      lang.includes('id_id') ||
      name.includes('indonesia') ||
      name.includes('indonesian') ||
      name.includes('gadis') ||
      name.includes('andika')
    );
  });

  if (idVoice) return idVoice;

  // Fallback to Malay voice if available
  const msVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('ms'));
  if (msVoice) return msVoice;

  // Fallback to default voice
  return voices.find(v => v.default) || voices[0] || null;
}

/**
 * Converts ticket number like "A-007" or "B-012" into clear Indonesian words
 */
function formatTicketNumberForSpeech(ticketNumber: string): string {
  const parts = ticketNumber.split('-');
  const prefix = parts[0] || '';
  const numStr = parts[1] || parts[0] || '';

  const digitWords: Record<string, string> = {
    '0': 'kosong',
    '1': 'satu',
    '2': 'dua',
    '3': 'tiga',
    '4': 'empat',
    '5': 'lima',
    '6': 'enam',
    '7': 'tujuh',
    '8': 'delapan',
    '9': 'sembilan'
  };

  const spelledDigits = numStr
    .split('')
    .map(d => digitWords[d] || d)
    .join(' ');

  return `Nomor antrean ${prefix}, ${spelledDigits}`;
}

/**
 * Calls ticket number using Web Speech API in Indonesian
 */
export async function announceTicketCall(
  ticketNumber: string,
  counterName: string,
  categoryLabel: string,
  options: { speed?: number; pitch?: number; volume?: number } = {}
): Promise<void> {
  // First play chime sound
  await playChime(options.volume ?? 0.8);

  if (!('speechSynthesis' in window)) {
    console.warn("Web Speech API is not supported in this browser.");
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  const formattedTicket = formatTicketNumberForSpeech(ticketNumber);
  
  // Format counter name e.g., "Front Office 1 - Umum" -> "Front Office satu"
  let cleanCounter = counterName
    .replace('Front Office 1', 'Front Office satu')
    .replace('Front Office 2', 'Front Office dua')
    .replace('Front Office 3', 'Front Office tiga')
    .replace('Front Office 4', 'Front Office empat');

  const speechText = `${formattedTicket}, silakan menuju ke ${cleanCounter}.`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'id-ID';
  utterance.rate = options.speed || 0.95; // Slightly measured rate for clear public speech
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Find best available voice
  const bestVoice = await getBestIndonesianVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
    if (bestVoice.lang) {
      utterance.lang = bestVoice.lang;
    }
  }

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

