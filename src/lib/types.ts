export type SideCode = 0 | 2 | 3;
export type SideLabel = 'CT' | 'T' | '?';

export type RawPlayer = {
  steamId: string;
  name?: string;
  teamName: string;
  killCount?: number;
  assistCount?: number;
  deathCount?: number;
  firstKillCount?: number;
  firstDeathCount?: number;
  tradeKillCount?: number;
  tradeDeathCount?: number;
  avatar?: string;
};

export type RawRound = {
  number: number;
  startTick: number;
  endTick: number;
  freezetimeEndTick?: number;
  duration?: number;
  teamAScore?: number;
  teamBScore?: number;
  teamASide?: SideCode;
  teamBSide?: SideCode;
  winnerSide?: SideCode;
  winnerTeamName?: string;
};

export type RawKill = {
  roundNumber: number;
  tick: number;
  killerSteamId: string;
  killerName: string;
  killerSide: SideCode;
  killerTeamName: string;
  victimSteamId: string;
  victimName: string;
  victimSide: SideCode;
  victimTeamName: string;
  assisterSteamId?: string;
  isTradeKill?: boolean;
  isTradeDeath?: boolean;
  distance?: number;
  weaponName?: string;
  weaponType?: string;
};

export type RawGrenade = {
  roundNumber: number;
  tick?: number;
  grenadeName: string;
  throwerSteamId: string;
  throwerName: string;
  throwerSide: SideCode;
  throwerTeamName: string;
};

export type RawPosition = {
  roundNumber: number;
  tick: number;
  x: number;
  y: number;
  z: number;
  playerSteamId: string;
  playerName: string;
  playerTeamName: string;
  playerSide: SideCode;
};

export type RawMatch = {
  checksum: string;
  name?: string;
  mapName: string;
  date?: string;
  tickrate?: number;
  duration?: number;
  teamA?: { name: string; score: number; currentSide?: SideCode };
  teamB?: { name: string; score: number; currentSide?: SideCode };
  players?: RawPlayer[];
  kills?: RawKill[];
  grenadeDestroyed?: RawGrenade[];
  grenades?: RawGrenade[];
  rounds?: RawRound[];
  playerPositions?: RawPosition[];
  positions?: RawPosition[];
  [key: string]: unknown;
};

export type MatchViewModel = {
  raw: RawMatch;
  players: RawPlayer[];
  kills: RawKill[];
  rounds: RawRound[];
  grenades: RawGrenade[];
  positions: RawPosition[];
  tickrate: number;
};

export type GrenadeBreakdown = {
  total: number;
  smoke: number;
  flash: number;
  he: number;
  molotov: number;
  incendiary: number;
};

export type RoundPlayerStats = {
  roundNumber: number;
  side: SideLabel;
  timeFirstKillSec: number | null;
  timeFirstDeathSec: number | null;
  grenades: GrenadeBreakdown;
  tradeKills: number;
  revengeKills: number;
  firstKillCount: number;
  kills: number;
  deaths: number;
  kd: number | null;
};

export type CompareStat = {
  label: string;
  player: string;
  teamAverage: string;
};

export type RoundSummary = {
  roundNumber: number;
  winner: 'A' | 'B' | '?';
  sideA: SideLabel;
  sideB: SideLabel;
  playerKills: number;
  playerDeaths: number;
  playerKd: number | null;
};

export type SelectionLine = {
  label: string;
  rounds: number[];
};
