import { RawKill } from '../lib/types';

export function KillFeed({ kills }: { kills: RawKill[] }) {
  return (
    <section className="panel">
      <div>
        <p className="eyebrow">Détail round</p>
        <h3>Kill feed</h3>
      </div>
      <div className="kill-feed">
        {kills.length === 0 ? (
          <p className="muted">Pas de kill feed pour cette vue.</p>
        ) : (
          kills.map((kill, index) => (
            <div className="kill-line" key={`${kill.roundNumber}-${kill.tick}-${index}`}>
              <span>{kill.killerName}</span>
              <strong>{kill.weaponName ?? 'kill'}</strong>
              <span>{kill.victimName}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
