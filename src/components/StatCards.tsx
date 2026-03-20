import { MatchViewModel, RoundPlayerStats } from '../lib/types';
import { getPlayerName, getTeamName } from '../lib/stats';

function formatValue(value: number | null, mode: 'int' | 'float' | 'sec' = 'float') {
  if (value == null) return '—';
  if (mode === 'int') return String(Math.round(value));
  if (mode === 'sec') return `${value.toFixed(2)}s`;
  return value.toFixed(2);
}

function Card({ title, player, team, accent = 'orange' }: { title: string; player: string; team?: string; accent?: 'orange' | 'cyan' }) {
  const tone = accent === 'cyan' ? 'border-cyan-400/20 bg-cyan-500/5' : 'border-orange-400/20 bg-orange-500/5';
  return (
    <article className={`rounded-2xl border ${tone} px-4 py-3`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 truncate text-lg font-bold text-white">{player}</p>
      {team ? <p className="mt-1 text-xs text-slate-300">Équipe moy. : {team}</p> : null}
    </article>
  );
}

export function StatCards({
  vm,
  playerSteamId,
  player,
  team,
}: {
  vm: MatchViewModel;
  playerSteamId: string;
  player: RoundPlayerStats;
  team: RoundPlayerStats;
}) {
  const playerName = getPlayerName(vm, playerSteamId);
  const teamName = getTeamName(vm, playerSteamId);

  const cards = [
    { title: 'PlayerName', playerValue: playerName, teamValue: teamName, accent: 'cyan' as const },
    { title: 'Kill', playerValue: formatValue(player.kills, 'int'), teamValue: formatValue(team.kills), accent: 'orange' as const },
    { title: 'Death', playerValue: formatValue(player.deaths, 'int'), teamValue: formatValue(team.deaths), accent: 'orange' as const },
    { title: 'K/D', playerValue: formatValue(player.kd), teamValue: formatValue(team.kd), accent: 'orange' as const },
    { title: 'FirstKill', playerValue: formatValue(player.firstKillCount, 'int'), teamValue: formatValue(team.firstKillCount), accent: 'orange' as const },
    { title: 'TradeKill', playerValue: formatValue(player.tradeKills, 'int'), teamValue: formatValue(team.tradeKills), accent: 'orange' as const },
    { title: 'RevengeKill', playerValue: formatValue(player.revengeKills, 'int'), teamValue: formatValue(team.revengeKills), accent: 'orange' as const },
    { title: 'TimeFirstKill', playerValue: formatValue(player.timeFirstKillSec, 'sec'), teamValue: formatValue(team.timeFirstKillSec, 'sec'), accent: 'orange' as const },
    { title: 'TimeFirstDeath', playerValue: formatValue(player.timeFirstDeathSec, 'sec'), teamValue: formatValue(team.timeFirstDeathSec, 'sec'), accent: 'orange' as const },
    { title: 'GrenadesTotals', playerValue: formatValue(player.grenades.total, 'int'), teamValue: formatValue(team.grenades.total), accent: 'orange' as const },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.title}
          title={card.title}
          player={card.playerValue}
          team={card.teamValue}
          accent={card.accent}
        />
      ))}
    </section>
  );
}
