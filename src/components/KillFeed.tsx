import { RawKill } from '../lib/types';

export function KillFeed({ kills }: { kills: RawKill[] }) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Détail round</p>
      <h3 className="mt-2 text-xl font-bold text-white">Kill feed</h3>

      <div className="mt-4 grid gap-2">
        {kills.length === 0 ? (
          <p className="text-sm text-slate-400">Pas de kill feed pour cette vue.</p>
        ) : (
          kills.map((kill, index) => (
            <div
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              key={`${kill.roundNumber}-${kill.tick}-${index}`}
            >
              <span className="truncate text-right text-slate-200">{kill.killerName}</span>
              <strong className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-200">{kill.weaponName ?? 'kill'}</strong>
              <span className="truncate text-slate-200">{kill.victimName}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
