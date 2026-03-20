const STORAGE_KEY = 'playsure-clientanalyse-payload';
const UI_KEY = 'playsure-clientanalyse-ui';
const TTL_MS = 24 * 60 * 60 * 1000;

export type SavedPayload = {
  fileName: string;
  savedAt: number;
  expiresAt: number;
  json: unknown;
};

export type UIState = {
  playerSteamId: string | null;
  roundNumber: number | 'global';
};

export function savePayload(fileName: string, json: unknown) {
  const payload: SavedPayload = {
    fileName,
    json,
    savedAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadPayload(): SavedPayload | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as SavedPayload;
    if (Date.now() > payload.expiresAt) {
      clearPayload();
      return null;
    }
    return payload;
  } catch {
    clearPayload();
    return null;
  }
}

export function clearPayload() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(UI_KEY);
}

export function saveUiState(state: UIState) {
  localStorage.setItem(UI_KEY, JSON.stringify(state));
}

export function loadUiState(): UIState {
  const raw = localStorage.getItem(UI_KEY);
  if (!raw) return { playerSteamId: null, roundNumber: 'global' };
  try {
    return JSON.parse(raw) as UIState;
  } catch {
    return { playerSteamId: null, roundNumber: 'global' };
  }
}
