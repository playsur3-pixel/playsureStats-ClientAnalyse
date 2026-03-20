import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrenadesPanel } from '../components/GrenadesPanel';
import { KillFeed } from '../components/KillFeed';
import { MatchHeader } from '../components/MatchHeader';
import { PlayerSelect } from '../components/PlayerSelect';
import { RoundTabs } from '../components/RoundTabs';
import { RoundsTable } from '../components/RoundsTable';
import { ComparisonTable, StatCards } from '../components/StatCards';
import { parseMatch } from '../lib/parser';
import {
  buildKillFeed,
  getCompareRows,
  getGlobalPlayerStats,
  getGlobalTeamAverageStats,
  getRoundPlayerStats,
  getSelectionLabel,
  getRoundsFromSelection,
} from '../lib/stats';
import { clearPayload, loadPayload, loadUiState, saveUiState } from '../lib/storage';
import type { MatchViewModel, RoundPlayerStats } from '../lib/types';

export function MatchPage() {
  const navigate = useNavigate();
  const payload = loadPayload();
  const vm = useMemo(() => (payload ? parseMatch(payload.json) : null), [payload]);
  const initialUi = loadUiState();

  const [playerSteamId, setPlayerSteamId] = useState<string | null>(initialUi.playerSteamId);
  const [selectedGroup, setSelectedGroup] = useState<string>(initialUi.selectedGroup ?? 'global');

  useEffect(() => {
    if (!vm) return;
    if (!playerSteamId) {
      setPlayerSteamId(vm.players[0]?.steamId ?? null);
    }
  }, [vm, playerSteamId]);

  useEffect(() => {
    if (!vm || !playerSteamId) return;
    saveUiState({
      playerSteamId,
      selectedGroup,
    });
  }, [vm, playerSteamId, selectedGroup]);

  if (!payload || !vm) {
    return (
      <section className="panel">
        <h2>Aucun match chargé</h2>
        <p className="muted">Upload un JSON depuis l'onglet Upload pour démarrer l'analyse.</p>
      </section>
    );
  }

  if (!playerSteamId) return null;

  const selectedRounds = getRoundsFromSelection(selectedGroup, vm);
  const isGlobal = selectedGroup === 'global';

  const playerStats = isGlobal
    ? getGlobalPlayerStats(vm, playerSteamId)
    : aggregateSelectionPlayerStats(vm, playerSteamId, selectedRounds);

  const teamStats = isGlobal
    ? getGlobalTeamAverageStats(vm, playerSteamId)
    : aggregateSelectionTeamStats(vm, playerSteamId, selectedRounds);

  const compareRows = getCompareRows(playerStats, teamStats);

  const killFeed = selectedRounds.length === 1 ? buildKillFeed(vm, selectedRounds[0]) : [];

  return (
    <div className="stack-lg">
      <MatchHeader vm={vm} />

      <div className="actions-row">
        <PlayerSelect players={vm.players} value={playerSteamId} onChange={setPlayerSteamId} />

        <section className="panel compact-panel">
          <p className="eyebrow">Persistance</p>
          <h3>JSON local 24h</h3>
          <p className="muted">Tu peux changer d'onglet ou de page sans perdre la session.</p>

          <div className="action-buttons">
            <button
              className="secondary-btn"
              onClick={() => navigate('/')}
            >
              Changer de fichier
            </button>

            <button
              className="danger-btn"
              onClick={() => {
                clearPayload();
                navigate('/');
              }}
            >
              Supprimer la session
            </button>
          </div>
        </section>
      </div>

      <StatCards player={playerStats} team={teamStats} />
      <RoundTabs vm={vm} selected={selectedGroup} onSelect={setSelectedGroup} />
      <GrenadesPanel player={playerStats} team={teamStats} isGlobal={isGlobal} />
      <ComparisonTable rows={compareRows} />
      <RoundsTable vm={vm} playerSteamId={playerSteamId} selectedGroup={selectedGroup} />

      {selectedRounds.length === 1 ? <KillFeed kills={killFeed} /> : null}

      <section className="panel compact-panel">
        <p className="eyebrow">Vue active</p>
        <h3>{getSelectionLabel(selectedGroup, vm)}</h3>
        <p className="muted">
          {selectedRounds.length === vm.rounds.length
            ? 'Analyse globale du match.'
            : `Analyse appliquée aux rounds : ${selectedRounds.join(', ')}`}
        </p>
      </section>
    </div>
  );
}

function aggregateSelectionPlayerStats(
  vm: MatchViewModel,
  playerSteamId: string,
  rounds: number[],
): RoundPlayerStats {
  const rows = rounds.map((round) => getRoundPlayerStats(vm, playerSteamId, round));

  const avg = (values: Array<number | null>) => {
    const filtered = values.filter((v): v is number => v != null);
    if (!filtered.length) return null;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  };

  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

  const kills = sum(rows.map((r) => r.kills));
  const deaths = sum(rows.map((r) => r.deaths));

  return {
    roundNumber: 0,
    side: '?' as const,
    timeFirstKillSec: avg(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: avg(rows.map((r) => r.timeFirstDeathSec)),
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
    kills,
    deaths,
    kd: deaths === 0 ? kills : kills / deaths,
  };
}

function aggregateSelectionTeamStats(
  vm: MatchViewModel,
  playerSteamId: string,
  rounds: number[],
): RoundPlayerStats {
  const player = vm.players.find((p) => p.steamId === playerSteamId);
  const teamIds = vm.players
    .filter((p) => p.teamName === player?.teamName)
    .map((p) => p.steamId);

  const rows = teamIds.map((id) => aggregateSelectionPlayerStats(vm, id, rounds));

  const avg = (values: Array<number | null>) => {
    const filtered = values.filter((v): v is number => v != null);
    if (!filtered.length) return null;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  };

  const avgKills = avg(rows.map((r) => r.kills)) ?? 0;
  const avgDeaths = avg(rows.map((r) => r.deaths)) ?? 0;

  return {
    roundNumber: 0,
    side: '?' as const,
    timeFirstKillSec: avg(rows.map((r) => r.timeFirstKillSec)),
    timeFirstDeathSec: avg(rows.map((r) => r.timeFirstDeathSec)),
    grenades: {
      total: avg(rows.map((r) => r.grenades.total)) ?? 0,
      smoke: avg(rows.map((r) => r.grenades.smoke)) ?? 0,
      flash: avg(rows.map((r) => r.grenades.flash)) ?? 0,
      he: avg(rows.map((r) => r.grenades.he)) ?? 0,
      molotov: avg(rows.map((r) => r.grenades.molotov)) ?? 0,
      incendiary: avg(rows.map((r) => r.grenades.incendiary)) ?? 0,
    },
    tradeKills: avg(rows.map((r) => r.tradeKills)) ?? 0,
    revengeKills: avg(rows.map((r) => r.revengeKills)) ?? 0,
    kills: avgKills,
    deaths: avgDeaths,
    kd: avgDeaths === 0 ? avgKills : avgKills / avgDeaths,
  };
}