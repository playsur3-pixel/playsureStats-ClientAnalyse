import { RoundPlayerStats } from '../lib/types';

export function GrenadesPanel({
  player,
  team,
}: {
  player: RoundPlayerStats;
  team: RoundPlayerStats;
}) {
  const rows = [
    ['Total', player.grenades.total, team.grenades.total],
    ['Smoke', player.grenades.smoke, team.grenades.smoke],
    ['Flash', player.grenades.flash, team.grenades.flash],
    ['HE', player.grenades.he, team.grenades.he],
    ['Molotov', player.grenades.molotov, team.grenades.molotov],
    ['Incendiary', player.grenades.incendiary, team.grenades.incendiary],
  ];

  return (
    <section className="panel">
      <div>
        <p className="eyebrow">Utilitaires</p>
        <h3>All_grenades_throw détaillé</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Joueur</th>
              <th>Moyenne équipe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, p, t]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{Number(p).toFixed(2)}</td>
                <td>{Number(t).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
