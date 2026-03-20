import {
  CompareStat,
  GrenadeBreakdown,
  MatchViewModel,
  RawKill,
  RawPlayer,
  RoundGroup,
  RoundPlayerStats,
  RoundSummary,
  SideCode,
  SideLabel,
} from './types';

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

function formatKd(value: number | null): string {
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

function average(values: Array<number | null>): number | null {
  const filtered = values.filter((v): v is number => v != null);
  if (!filtered.length) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function calcKd(kills: number, deaths: number): number | null {
  if (kills === 0 && deaths === 0) return 0;
  if (deaths === 0) return kills;
  return kills / deaths;
}

function teamPlayerIds(vm: MatchViewModel, playerSteamId: string): string[] {
  const player = getPlayer(vm, playerSteamId);
  if (!player) return [];
  return vm.players.filter((p) => p.teamName === player.teamName).map((p) => p.steamId);
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

  const playerKills = kills.filter((k) => k.killerSteamId === playerSteamId).length;
  const playerDeaths = kills.filter((k) => k.victimSteamId === playerSteamId).length;

  return {
    roundNumber,
    side: getRoundSide(vm, roundNumber, playerSteamId),
    timeFirstKillSec: firstKill ? tickToSeconds(vm, roundNumber, firstKill.tick) : null,
    timeFirstDeathSec: firstDeath ? tickToSeconds(vm, roundNumber, firstDeath.tick) : null,
    grenades,
    tradeKills: computeTradeKills(vm, roundNumber, playerSteamId),
    revengeKills: computeRevengeKills(vm, roundNumber, playerSteamId),
    kills: playerKills,
    deaths: playerDeaths,
    kd: calcKd(playerKills, playerDeaths),
  };
}

export function getTeamAverageRoundStats(vm: MatchViewModel, playerSteamId: string, roundNumber: number): RoundPlayerStats {
  const ids = teamPlayerIds(vm, playerSteamId);
  const rows = ids.map((id) => getRoundPlayerStats(vm, id, roundNumber));

  const avgKills = average(rows.map((r) => r.kills)) ?? 0;
  const avgDeaths = average(rows.map((r) => r.deaths)) ?? 0;

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
    kills: avgKills,
    deaths: avgDeaths,
    kd: calcKd(avgKills, avgDeaths),
  };
}

export function getGlobalPlayerStats(vm: MatchViewModel, playerSteamId: string): RoundPlayerStats {
  const rows = vm.rounds.map((r) => getRoundPlayerStats(vm, playerSteamId, r.number));

  const totalKills = sum(rows.map((r) => r.kills));
  const totalDeaths = sum(rows.map((r) => r.deaths));

  return {
    roundNumber: 0,
    side: '?',
    timeFirstKillSec: average(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: average(rows.map((r) => r.timeFirstDeathSec)),
    grenades: {
      total: sum(rows.map((r) => r.grenades.total)),
      smoke: sum(rows.map((r) => r.grenades.smoke)),
      flash: sum(rows.map((r) => r.grenades.flash)),
      he: sum(rows.map((r) => r.grenades.he)),
      molotov: sum(rows.map((r) => r.grenades.molotov)),
      incendiary: sum(rows.map((r) => r.grenades.incendiary)),
    },
    tradeKills: sum(rows.map((r) => r.tradeKills)),
    revengeKills: sum(rows.map((r) => r.revengeKills)),
    kills: totalKills,
    deaths: totalDeaths,
    kd: calcKd(totalKills, totalDeaths),
  };
}

export function getGlobalTeamAverageStats(vm: MatchViewModel, playerSteamId: string): RoundPlayerStats {
  const ids = teamPlayerIds(vm, playerSteamId);
  const rows = ids.map((id) => getGlobalPlayerStats(vm, id));

  const avgKills = average(rows.map((r) => r.kills)) ?? 0;
  const avgDeaths = average(rows.map((r) => r.deaths)) ?? 0;

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
    kills: avgKills,
    deaths: avgDeaths,
    kd: calcKd(avgKills, avgDeaths),
  };
}

export function getCompareRows(player: RoundPlayerStats, team: RoundPlayerStats): CompareStat[] {
  return [
    { label: 'Time first kill', player: formatSeconds(player.timeFirstKillSec), teamAverage: formatSeconds(team.timeFirstKillSec) },
    { label: 'Time first death', player: formatSeconds(player.timeFirstDeathSec), teamAverage: formatSeconds(team.timeFirstDeathSec) },
    { label: 'Trade kills', player: formatNumber(player.tradeKills), teamAverage: formatNumber(team.tradeKills) },
    { label: 'Revenge kills', player: formatNumber(player.revengeKills), teamAverage: formatNumber(team.revengeKills) },
    { label: 'Kills', player: formatNumber(player.kills), teamAverage: formatNumber(team.kills) },
    { label: 'Deaths', player: formatNumber(player.deaths), teamAverage: formatNumber(team.deaths) },
    { label: 'K/D', player: formatKd(player.kd), teamAverage: formatKd(team.kd) },
  ];
}

export function buildKillFeed(vm: MatchViewModel, roundNumber: number): RawKill[] {
  return vm.kills
    .filter((k) => k.roundNumber === roundNumber)
    .sort((a, b) => a.tick - b.tick);
}

export function buildRoundSummary(vm: MatchViewModel, roundNumber: number, playerSteamId: string): RoundSummary | null {
  const round = vm.rounds.find((r) => r.number === roundNumber);
  if (!round) return null;

  const stats = getRoundPlayerStats(vm, playerSteamId, roundNumber);

  return {
    roundNumber,
    score: `${round.teamAScore ?? 0}-${round.teamBScore ?? 0}`,
    winner: round.winnerTeamName ?? sideToLabel(round.winnerSide),
    sideA: sideToLabel(round.teamASide),
    sideB: sideToLabel(round.teamBSide),
    playerKills: stats.kills,
    playerDeaths: stats.deaths,
    playerKd: stats.kd,
  };
}

export function buildRoundGroups(totalRounds: number): RoundGroup[] {
  const groups: RoundGroup[] = [{ key: 'global', label: 'Global', rounds: [] }];

  const firstHalfEnd = Math.min(12, totalRounds);
  if (firstHalfEnd >= 1) {
    groups.push({
      key: 'r1-12',
      label: `R1 - R${firstHalfEnd}`,
      rounds: Array.from({ length: firstHalfEnd }, (_, i) => i + 1),
    });
  }

  if (totalRounds >= 13) {
    const secondHalfEnd = Math.min(24, totalRounds);
    groups.push({
      key: 'r13-24',
      label: `R13 - R${secondHalfEnd}`,
      rounds: Array.from({ length: secondHalfEnd - 13 + 1 }, (_, i) => i + 13),
    });
  }

  if (totalRounds > 24) {
    let otIndex = 1;
    let start = 25;

    while (start <= totalRounds) {
      const end = Math.min(start + 3, totalRounds);
      groups.push({
        key: `ot-${otIndex}`,
        label: `OT #${otIndex} R${start} - R${end}`,
        rounds: Array.from({ length: end - start + 1 }, (_, i) => start + i),
      });
      start += 4;
      otIndex += 1;
    }
  }

  return groups;
}

export function getRoundsFromSelection(selection: string, vm: MatchViewModel): number[] {
  if (selection === 'global') return vm.rounds.map((r) => r.number);
  const groups = buildRoundGroups(vm.rounds.length);
  return groups.find((g) => g.key === selection)?.rounds ?? vm.rounds.map((r) => r.number);
}

export function getSelectionLabel(selection: string, vm: MatchViewModel): string {
  const groups = buildRoundGroups(vm.rounds.length);
  return groups.find((g) => g.key === selection)?.label ?? 'Global';
}