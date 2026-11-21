// Sunset Ledger progress store: earned trophy ids + settings, in localStorage.
// Export/import is plain JSON so progress survives a new device.
const EARNED_KEY = 'sunset-ledger-earned-v1';
const SETTINGS_KEY = 'sunset-ledger-settings-v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { hideSpoilers: raw.hideSpoilers === true };
  } catch {
    return { hideSpoilers: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sunset-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file) {
  const text = await file.text();
  const raw = JSON.parse(text);
  if (!Array.isArray(raw)) throw new Error('not an array');
  return new Set(raw.filter((n) => Number.isInteger(n)));
}
