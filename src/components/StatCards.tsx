import { CompareStat, RoundPlayerStats } from '../lib/types';

export function StatCards({
  player,
  team,
}: {
  player: RoundPlayerStats;
  team: RoundPlayerStats;
}) {
  const cards = [
    ['Kills', player.kills, team.kills, ''],
    ['Deaths', player.deaths, team.deaths, ''],
    ['K/D', player.kd, team.kd, ''],
    ['Time first kill', player.timeFirstKillSec, team.timeFirstKillSec, 's'],
    ['Time first death', player.timeFirstDeathSec, team.timeFirstDeathSec, 's'],
    ['Trade kills', player.tradeKills, team.tradeKills, ''],
    ['Revenge kills', player.revengeKills, team.revengeKills, ''],
  ] as const;

  return (
    <section className="panel stat-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Stats joueur</p>
          <h3>Vue principale</h3>
        </div>
      </div>
      <div className="stat-grid">
        {cards.map(([title, p, t, unit]) => (
          <article className="stat-card-mini" key={title}>
            <p className="eyebrow">Stat</p>
            <h4>{title}</h4>
            <div className="stat-lines">
              <span>Joueur : {p == null ? '—' : Number(p).toFixed(2) + unit}</span>
              <span>Équipe moy. : {t == null ? '—' : Number(t).toFixed(2) + unit}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ComparisonTable({ rows }: { rows: CompareStat[] }) {
  return (
    <section className="panel">
      <div>
        <p className="eyebrow">Comparaison</p>
        <h3>Joueur vs moyenne équipe</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Stat</th>
              <th>Joueur</th>
              <th>Moyenne équipe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.player}</td>
                <td>{row.teamAverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
