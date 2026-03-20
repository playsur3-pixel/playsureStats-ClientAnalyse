import { CompareStat, GrenadeBreakdown, MatchViewModel, RawKill, RawPlayer, RoundPlayerStats, SideCode, SideLabel } from './types';

function sideToLabel(side?: SideCode): SideLabel {
  if (side === 3) return 'CT';
  if (side === 2) return 'T';
  return '?';
}

function formatSeconds(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(2)}s`;
}

function formatNumber(value: number | null): string {
  return value == null ? '—' : value.toFixed(2);
}

function emptyGrenades(): GrenadeBreakdown {
  return { total: 0, smoke: 0, flash: 0, he: 0, molotov: 0, incendiary: 0 };
}

function grenadeKey(name: string): keyof Omit<GrenadeBreakdown, 'total'> | null {
  const n = name.toLowerCase();
  if (n.includes('smoke')) return 'smoke';
  if (n.includes('flash')) return 'flash';
  if (n.includes('explosive') || n === 'he grenade' || n.includes('he grenade') || n === 'he') return 'he';
  if (n.includes('molotov')) return 'molotov';
  if (n.includes('incendiary')) return 'incendiary';
  return null;
}

function getPlayer(vm: MatchViewModel, steamId: string): RawPlayer | undefined {
  return vm.players.find((p) => p.steamId === steamId);
}

function getRoundSide(vm: MatchViewModel, roundNumber: number, playerSteamId: string): SideLabel {
  const player = getPlayer(vm, playerSteamId);
  const round = vm.rounds.find((r) => r.number === roundNumber);
  if (!player || !round) return '?';
  if (player.teamName === vm.raw.teamA?.name) return sideToLabel(round.teamASide);
  if (player.teamName === vm.raw.teamB?.name) return sideToLabel(round.teamBSide);
  return '?';
}

function tickToSeconds(vm: MatchViewModel, roundNumber: number, tick: number): number | null {
  const round = vm.rounds.find((r) => r.number === roundNumber);
  if (!round) return null;
  const start = round.freezetimeEndTick ?? round.startTick;
  return Math.max(0, (tick - start) / vm.tickrate);
}

function euclidean(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function buildDistance(vm: MatchViewModel, roundNumber: number, playerSteamId: string): number | null {
  const player = getPlayer(vm, playerSteamId);
  if (!player || vm.positions.length === 0) return null;

  const positions = vm.positions.filter((p) => p.roundNumber === roundNumber && p.playerTeamName === player.teamName);
  const playerPositions = positions.filter((p) => p.playerSteamId === playerSteamId);
  const matePositions = positions.filter((p) => p.playerSteamId !== playerSteamId);

  if (!playerPositions.length || !matePositions.length) return null;

  const sample = playerPositions.slice(0, 200);
  const distances: number[] = [];

  for (const p of sample) {
    const sameTickMates = matePositions.filter((m) => m.tick === p.tick);
    if (!sameTickMates.length) continue;
    const avg = sameTickMates.reduce((acc, mate) => acc + euclidean(p, mate), 0) / sameTickMates.length;
    distances.push(avg);
  }

  if (!distances.length) return null;
  return distances.reduce((a, b) => a + b, 0) / distances.length;
}

function computeTradeKills(vm: MatchViewModel, roundNumber: number, playerSteamId: string): number {
  const player = getPlayer(vm, playerSteamId);
  if (!player) return 0;
  const ticks5s = vm.tickrate * 5;
  const kills = vm.kills.filter((k) => k.roundNumber === roundNumber);

  return kills.filter((candidate) => {
    if (candidate.killerSteamId !== playerSteamId) return false;
    return kills.some((prior) => {
      if (prior.victimTeamName !== player.teamName) return false;
      if (prior.victimSteamId === playerSteamId) return false;
      if (prior.killerSteamId !== candidate.victimSteamId) return false;
      return candidate.tick >= prior.tick && candidate.tick - prior.tick <= ticks5s;
    });
  }).length;
}

function computeRevengeKills(vm: MatchViewModel, roundNumber: number, playerSteamId: string): number {
  const player = getPlayer(vm, playerSteamId);
  if (!player) return 0;
  const ticks5s = vm.tickrate * 5;
  const kills = vm.kills.filter((k) => k.roundNumber === roundNumber);
  const deathEvent = kills.find((k) => k.victimSteamId === playerSteamId);
  if (!deathEvent) return 0;

  return kills.filter((candidate) => {
    if (candidate.killerTeamName !== player.teamName) return false;
    if (candidate.victimSteamId !== deathEvent.killerSteamId) return false;
    return candidate.tick >= deathEvent.tick && candidate.tick - deathEvent.tick <= ticks5s;
  }).length;
}

function firstBy<T>(items: T[], getTick: (item: T) => number): T | null {
  if (!items.length) return null;
  return [...items].sort((a, b) => getTick(a) - getTick(b))[0];
}

export function getRoundPlayerStats(vm: MatchViewModel, playerSteamId: string, roundNumber: number): RoundPlayerStats {
  const kills = vm.kills.filter((k) => k.roundNumber === roundNumber);
  const firstKill = firstBy(kills.filter((k) => k.killerSteamId === playerSteamId), (k) => k.tick);
  const firstDeath = firstBy(kills.filter((k) => k.victimSteamId === playerSteamId), (k) => k.tick);

  const grenades = vm.grenades
    .filter((g) => g.roundNumber === roundNumber && g.throwerSteamId === playerSteamId)
    .reduce((acc, g) => {
      acc.total += 1;
      const key = grenadeKey(g.grenadeName);
      if (key) acc[key] += 1;
      return acc;
    }, emptyGrenades());

  return {
    roundNumber,
    side: getRoundSide(vm, roundNumber, playerSteamId),
    timeFirstKillSec: firstKill ? tickToSeconds(vm, roundNumber, firstKill.tick) : null,
    timeFirstDeathSec: firstDeath ? tickToSeconds(vm, roundNumber, firstDeath.tick) : null,
    grenades,
    tradeKills: computeTradeKills(vm, roundNumber, playerSteamId),
    revengeKills: computeRevengeKills(vm, roundNumber, playerSteamId),
    avgMateDistance: buildDistance(vm, roundNumber, playerSteamId),
  };
}

function average(values: Array<number | null>): number | null {
  const filtered = values.filter((v): v is number => v != null);
  if (!filtered.length) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function teamPlayerIds(vm: MatchViewModel, playerSteamId: string): string[] {
  const player = getPlayer(vm, playerSteamId);
  if (!player) return [];
  return vm.players.filter((p) => p.teamName === player.teamName).map((p) => p.steamId);
}

export function getTeamAverageRoundStats(vm: MatchViewModel, playerSteamId: string, roundNumber: number): RoundPlayerStats {
  const ids = teamPlayerIds(vm, playerSteamId);
  const rows = ids.map((id) => getRoundPlayerStats(vm, id, roundNumber));

  return {
    roundNumber,
    side: getRoundSide(vm, roundNumber, playerSteamId),
    timeFirstKillSec: average(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: average(rows.map((r) => r.timeFirstDeathSec)),
    grenades: {
      total: average(rows.map((r) => r.grenades.total)) ?? 0,
      smoke: average(rows.map((r) => r.grenades.smoke)) ?? 0,
      flash: average(rows.map((r) => r.grenades.flash)) ?? 0,
      he: average(rows.map((r) => r.grenades.he)) ?? 0,
      molotov: average(rows.map((r) => r.grenades.molotov)) ?? 0,
      incendiary: average(rows.map((r) => r.grenades.incendiary)) ?? 0,
    },
    tradeKills: average(rows.map((r) => r.tradeKills)) ?? 0,
    revengeKills: average(rows.map((r) => r.revengeKills)) ?? 0,
    avgMateDistance: average(rows.map((r) => r.avgMateDistance)),
  };
}

export function getGlobalPlayerStats(vm: MatchViewModel, playerSteamId: string): RoundPlayerStats {
  const rows = vm.rounds.map((r) => getRoundPlayerStats(vm, playerSteamId, r.number));
  return {
    roundNumber: 0,
    side: '?',
    timeFirstKillSec: average(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: average(rows.map((r) => r.timeFirstDeathSec)),
    grenades: {
      total: average(rows.map((r) => r.grenades.total)) ?? 0,
      smoke: average(rows.map((r) => r.grenades.smoke)) ?? 0,
      flash: average(rows.map((r) => r.grenades.flash)) ?? 0,
      he: average(rows.map((r) => r.grenades.he)) ?? 0,
      molotov: average(rows.map((r) => r.grenades.molotov)) ?? 0,
      incendiary: average(rows.map((r) => r.grenades.incendiary)) ?? 0,
    },
    tradeKills: average(rows.map((r) => r.tradeKills)) ?? 0,
    revengeKills: average(rows.map((r) => r.revengeKills)) ?? 0,
    avgMateDistance: average(rows.map((r) => r.avgMateDistance)),
  };
}

export function getGlobalTeamAverageStats(vm: MatchViewModel, playerSteamId: string): RoundPlayerStats {
  const ids = teamPlayerIds(vm, playerSteamId);
  const rows = ids.map((id) => getGlobalPlayerStats(vm, id));
  return {
    roundNumber: 0,
    side: '?',
    timeFirstKillSec: average(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: average(rows.map((r) => r.timeFirstDeathSec)),
    grenades: {
      total: average(rows.map((r) => r.grenades.total)) ?? 0,
      smoke: average(rows.map((r) => r.grenades.smoke)) ?? 0,
      flash: average(rows.map((r) => r.grenades.flash)) ?? 0,
      he: average(rows.map((r) => r.grenades.he)) ?? 0,
      molotov: average(rows.map((r) => r.grenades.molotov)) ?? 0,
      incendiary: average(rows.map((r) => r.grenades.incendiary)) ?? 0,
    },
    tradeKills: average(rows.map((r) => r.tradeKills)) ?? 0,
    revengeKills: average(rows.map((r) => r.revengeKills)) ?? 0,
    avgMateDistance: average(rows.map((r) => r.avgMateDistance)),
  };
}

export function getCompareRows(playerStats: RoundPlayerStats, teamStats: RoundPlayerStats): CompareStat[] {
  return [
    { label: 'Time first kill', player: formatSeconds(playerStats.timeFirstKillSec), teamAverage: formatSeconds(teamStats.timeFirstKillSec) },
    { label: 'Time first death', player: formatSeconds(playerStats.timeFirstDeathSec), teamAverage: formatSeconds(teamStats.timeFirstDeathSec) },
    { label: 'Grenades totales', player: formatNumber(playerStats.grenades.total), teamAverage: formatNumber(teamStats.grenades.total) },
    { label: 'Trade kills', player: formatNumber(playerStats.tradeKills), teamAverage: formatNumber(teamStats.tradeKills) },
    { label: 'Revenge kills', player: formatNumber(playerStats.revengeKills), teamAverage: formatNumber(teamStats.revengeKills) },
    { label: 'Distance moyenne mates', player: formatNumber(playerStats.avgMateDistance), teamAverage: formatNumber(teamStats.avgMateDistance) },
  ];
}

export function buildRoundSummary(vm: MatchViewModel, roundNumber: number) {
  const round = vm.rounds.find((r) => r.number === roundNumber);
  if (!round) return null;
  return {
    roundNumber,
    score: `${round.teamAScore ?? 0} - ${round.teamBScore ?? 0}`,
    winner: round.winnerTeamName ?? '—',
    sideA: sideToLabel(round.teamASide),
    sideB: sideToLabel(round.teamBSide),
    startMoneyA: round.teamAStartMoney ?? null,
    startMoneyB: round.teamBStartMoney ?? null,
  };
}

export function buildKillFeed(vm: MatchViewModel, roundNumber: number): RawKill[] {
  return vm.kills.filter((k) => k.roundNumber === roundNumber).sort((a, b) => a.tick - b.tick);
}
