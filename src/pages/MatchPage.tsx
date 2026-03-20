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
import { buildKillFeed, getCompareRows, getGlobalPlayerStats, getGlobalTeamAverageStats, getRoundPlayerStats, getTeamAverageRoundStats } from '../lib/stats';
import { clearPayload, loadPayload, loadUiState, saveUiState } from '../lib/storage';

export function MatchPage() {
  const navigate = useNavigate();
  const payload = loadPayload();
  const vm = useMemo(() => (payload ? parseMatch(payload.json) : null), [payload]);
  const initialUi = loadUiState();
  const [playerSteamId, setPlayerSteamId] = useState<string | null>(initialUi.playerSteamId);
  const [selectedRound, setSelectedRound] = useState<number | 'global'>(initialUi.roundNumber);

  useEffect(() => {
    if (!vm) return;
    if (!playerSteamId) setPlayerSteamId(vm.players[0]?.steamId ?? null);
  }, [vm, playerSteamId]);

  useEffect(() => {
    if (!vm || !playerSteamId) return;
    saveUiState({ playerSteamId, roundNumber: selectedRound });
  }, [vm, playerSteamId, selectedRound]);

  if (!payload || !vm) {
    return (
      <section className="panel">
        <h2>Aucun match chargé</h2>
        <p className="muted">Upload un JSON depuis l'onglet Upload pour démarrer l'analyse.</p>
      </section>
    );
  }

  if (!playerSteamId) return null;

  const playerStats =
    selectedRound === 'global' ? getGlobalPlayerStats(vm, playerSteamId) : getRoundPlayerStats(vm, playerSteamId, selectedRound);
  const teamStats =
    selectedRound === 'global'
      ? getGlobalTeamAverageStats(vm, playerSteamId)
      : getTeamAverageRoundStats(vm, playerSteamId, selectedRound);

  const compareRows = getCompareRows(playerStats, teamStats);
  const killFeed = selectedRound === 'global' ? [] : buildKillFeed(vm, selectedRound);

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
            <button className="secondary-btn" onClick={() => navigate('/')}>Changer de fichier</button>
            <button className="danger-btn" onClick={() => { clearPayload(); navigate('/'); }}>Supprimer la session</button>
          </div>
        </section>
      </div>

      <StatCards player={playerStats} team={teamStats} />
      <RoundTabs vm={vm} playerSteamId={playerSteamId} selected={selectedRound} onSelect={setSelectedRound} />
      <RoundsTable vm={vm} selected={selectedRound} onSelect={setSelectedRound} playerSteamId={playerSteamId} />
      <GrenadesPanel player={playerStats} team={teamStats} />
      <ComparisonTable rows={compareRows} />
      {selectedRound !== 'global' ? <KillFeed kills={killFeed} /> : null}
    </div>
  );
}
