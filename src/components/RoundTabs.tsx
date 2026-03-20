import { buildSelectionLines } from '../lib/stats';
import { MatchViewModel } from '../lib/types';

export function RoundTabs({
  vm,
  selected,
  onSelect,
}: {
  vm: MatchViewModel;
  selected: string;
  onSelect: (value: string) => void;
}) {
  const lines = buildSelectionLines(vm.rounds.length);

  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Sélection</p>
      <h3 className="mt-2 text-xl font-bold text-white">Segment du match</h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={[
            'rounded-xl border px-3 py-2 text-sm font-medium transition',
            selected === 'global'
              ? 'border-orange-400 bg-orange-500 text-white'
              : 'border-white/10 bg-white/5 text-slate-200 hover:border-orange-300/40 hover:bg-white/10',
          ].join(' ')}
          onClick={() => onSelect('global')}
        >
          Global
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {lines.map((line) => (
          <div key={line.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{line.label}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
              {line.rounds.map((round) => {
                const key = `round-${round}`;
                const active = selected === key;
                return (
                  <button
                    key={key}
                    className={[
                      'rounded-lg border px-2 py-2 text-xs font-semibold transition',
                      active
                        ? 'border-orange-400 bg-orange-500 text-white'
                        : 'border-white/10 bg-slate-950/60 text-slate-200 hover:border-orange-300/40 hover:bg-white/10',
                    ].join(' ')}
                    onClick={() => onSelect(key)}
                  >
                    R{round}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
