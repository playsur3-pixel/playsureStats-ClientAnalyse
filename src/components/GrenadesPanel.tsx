import { RoundPlayerStats } from '../lib/types';

export function GrenadesPanel({
  player,
  team,
  isGlobal,
}: {
  player: RoundPlayerStats;
  team: RoundPlayerStats;
  isGlobal: boolean;
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
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Utilitaires</p>
      <h3 className="mt-2 text-xl font-bold text-white">{isGlobal ? 'Grenades totales' : 'Grenades du round'}</h3>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Joueur</th>
              <th className="px-3 py-2 text-left font-medium">Moyenne équipe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, p, t]) => (
              <tr key={label} className="border-b border-white/5 last:border-b-0">
                <td className="px-3 py-2 text-slate-200">{label}</td>
                <td className="px-3 py-2 text-white">{Number(p).toFixed(2)}</td>
                <td className="px-3 py-2 text-slate-300">{Number(t).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
