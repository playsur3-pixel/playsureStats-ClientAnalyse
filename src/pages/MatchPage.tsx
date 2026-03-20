import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrenadesPanel } from '../components/GrenadesPanel';
import { KillFeed } from '../components/KillFeed';
import { MatchHeader } from '../components/MatchHeader';
import { PlayerSelect } from '../components/PlayerSelect';
import { RoundsTable } from '../components/RoundsTable';
import { RoundTabs } from '../components/RoundTabs';
import { StatCards } from '../components/StatCards';
import { parseMatch } from '../lib/parser';
import {
  aggregatePlayerStats,
  aggregateTeamAverageStats,
  buildKillFeed,
  getSelectionLabel,
  getRoundsFromSelection,
} from '../lib/stats';
import { clearPayload, loadPayload, loadUiState, saveUiState } from '../lib/storage';

export function MatchPage() {
  const navigate = useNavigate();
  const payload = loadPayload();
  const vm = useMemo(() => (payload ? parseMatch(payload.json) : null), [payload]);
  const initialUi = loadUiState();

  const [playerSteamId, setPlayerSteamId] = useState<string | null>(initialUi.playerSteamId);
  const [selectedGroup, setSelectedGroup] = useState<string>(initialUi.selectedGroup ?? 'global');

  useEffect(() => {
    if (!vm) return;
    if (!playerSteamId) setPlayerSteamId(vm.players[0]?.steamId ?? null);
  }, [vm, playerSteamId]);

  useEffect(() => {
    if (!vm || !playerSteamId) return;
    saveUiState({ playerSteamId, selectedGroup });
  }, [vm, playerSteamId, selectedGroup]);

  if (!payload || !vm) {
    return (
      <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-6 shadow-panel backdrop-blur">
        <h2 className="text-2xl font-bold text-white">Aucun match chargé</h2>
        <p className="mt-2 text-sm text-slate-300">Upload un JSON depuis l'onglet Upload pour démarrer l'analyse.</p>
      </section>
    );
  }

  if (!playerSteamId) return null;

  const selectedRounds = getRoundsFromSelection(selectedGroup, vm);
  const isGlobal = selectedGroup === 'global';
  const playerStats = aggregatePlayerStats(vm, playerSteamId, selectedRounds);
  const teamStats = aggregateTeamAverageStats(vm, playerSteamId, selectedRounds);
  const killFeed = selectedRounds.length === 1 ? buildKillFeed(vm, selectedRounds[0]) : [];

  return (
    <div className="grid gap-5">
      <MatchHeader vm={vm} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <PlayerSelect players={vm.players} value={playerSteamId} onChange={setPlayerSteamId} />

        <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Persistance</p>
          <h3 className="mt-2 text-xl font-bold text-white">JSON local 24h</h3>
          <p className="mt-2 text-sm text-slate-300">Tu peux changer d'onglet ou de page sans perdre la session.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              Changer de fichier
            </button>
            <button
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
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

      <StatCards vm={vm} playerSteamId={playerSteamId} player={playerStats} team={teamStats} />
      <RoundTabs vm={vm} selected={selectedGroup} onSelect={setSelectedGroup} />
      <RoundsTable vm={vm} playerSteamId={playerSteamId} selectedGroup={selectedGroup} />
      <GrenadesPanel player={playerStats} team={teamStats} isGlobal={isGlobal} />

      {selectedRounds.length === 1 ? <KillFeed kills={killFeed} /> : null}

      <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Vue active</p>
        <h3 className="mt-2 text-xl font-bold text-white">{getSelectionLabel(selectedGroup, vm)}</h3>
        <p className="mt-2 text-sm text-slate-300">
          {selectedRounds.length === vm.rounds.length
            ? 'Analyse globale du match.'
            : `Analyse appliquée au round : ${selectedRounds.join(', ')}`}
        </p>
      </section>
    </div>
  );
}
