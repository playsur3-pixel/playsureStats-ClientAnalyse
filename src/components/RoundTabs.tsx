import { MatchViewModel } from '../lib/types';
import { buildRoundGroups } from '../lib/stats';

export function RoundTabs({
  vm,
  selected,
  onSelect,
}: {
  vm: MatchViewModel;
  selected: string;
  onSelect: (value: string) => void;
}) {
  const groups = buildRoundGroups(vm.rounds.length);

  return (
    <section className="panel compact-panel">
      <div>
        <p className="eyebrow">Sélection</p>
        <h3>Segments du match</h3>
      </div>

      <div className="selection-grid">
        {groups.map((group) => {
          const active = selected === group.key;
          return (
            <button
              key={group.key}
              className={active ? 'selection-card active' : 'selection-card'}
              onClick={() => onSelect(group.key)}
            >
              {group.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}