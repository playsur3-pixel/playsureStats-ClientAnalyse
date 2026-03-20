import { MatchViewModel } from '../lib/types';

export function MatchHeader({ vm }: { vm: MatchViewModel }) {
  return (
    <section className="panel hero-panel">
      <div>
        <p className="eyebrow">Vue générale</p>
        <h2>{vm.raw.mapName}</h2>
        <p className="muted">{vm.raw.date ? new Date(vm.raw.date).toLocaleString('fr-FR') : 'Date inconnue'}</p>
      </div>

      <div className="score-boxes">
        <div className="score-box">
          <strong>{vm.raw.teamA?.name ?? 'Team A'}</strong>
          <span>{vm.raw.teamA?.score ?? 0}</span>
        </div>
        <div className="score-box">
          <strong>{vm.raw.teamB?.name ?? 'Team B'}</strong>
          <span>{vm.raw.teamB?.score ?? 0}</span>
        </div>
      </div>
    </section>
  );
}
