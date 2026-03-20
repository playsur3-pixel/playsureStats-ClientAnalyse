import { RawPlayer } from '../lib/types';

export function PlayerSelect({
  players,
  value,
  onChange,
}: {
  players: RawPlayer[];
  value: string | null;
  onChange: (steamId: string) => void;
}) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Étape 2</p>
      <h3 className="mt-2 text-xl font-bold text-white">Joueur sélectionné</h3>
      <select
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {players.map((player) => (
          <option key={player.steamId} value={player.steamId}>
            {(player.name || player.steamId) + ' — ' + player.teamName}
          </option>
        ))}
      </select>
    </section>
  );
}
