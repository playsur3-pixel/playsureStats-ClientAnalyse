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
    <section className="panel compact-panel">
      <div>
        <p className="eyebrow">Étape 2</p>
        <h3>Joueur sélectionné</h3>
      </div>

      <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {players.map((player) => (
          <option key={player.steamId} value={player.steamId}>
            {(player.name || player.steamId) + ' — ' + player.teamName}
          </option>
        ))}
      </select>
    </section>
  );
}
