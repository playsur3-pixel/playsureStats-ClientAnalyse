import { MatchViewModel, RawGrenade, RawMatch, RawPlayer, RawPosition, RawRound, RawKill } from './types';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function parseMatch(rawJson: unknown): MatchViewModel {
  const raw = rawJson as RawMatch;
  return {
    raw,
    players: asArray<RawPlayer>(raw.players).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
    kills: asArray<RawKill>(raw.kills),
    rounds: asArray<RawRound>(raw.rounds).sort((a, b) => a.number - b.number),
    grenades: asArray<RawGrenade>(raw.grenades).length
      ? asArray<RawGrenade>(raw.grenades)
      : asArray<RawGrenade>(raw.grenadeDestroyed),
    positions: asArray<RawPosition>(raw.playerPositions).length
      ? asArray<RawPosition>(raw.playerPositions)
      : asArray<RawPosition>(raw.positions),
    tickrate: raw.tickrate ?? 64,
  };
}
