import { MatchViewModel } from '../lib/types';
import { getRoundPlayerStats } from '../lib/stats';

export function RoundTabs({
  vm,
  playerSteamId,
  selected,
  onSelect,
}: {
  vm: MatchViewModel;
  playerSteamId: string;
  selected: number | 'global';
  onSelect: (value: number | 'global') => void;
}) {
  return (
    <section className="panel">
      <div className="round-header">
        <div>
          <p className="eyebrow">Sélection</p>
          <h3>Global + rounds CT / T</h3>
        </div>
        <button className={selected === 'global' ? 'tab active' : 'tab'} onClick={() => onSelect('global')}>
          Global
        </button>
      </div>

      <div className="tabs-grid">
        {vm.rounds.map((round) => {
          const side = getRoundPlayerStats(vm, playerSteamId, round.number).side;
          const active = selected === round.number;
          return (
            <button key={round.number} className={active ? 'tab active' : 'tab'} onClick={() => onSelect(round.number)}>
              <span>R{round.number}</span>
              <small>{side}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
