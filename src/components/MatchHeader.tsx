import { MatchViewModel } from '../lib/types';

export function MatchHeader({ vm }: { vm: MatchViewModel }) {
  return (
    <section className="grid gap-4 rounded-[26px] border border-white/10 bg-slate-950/70 p-6 shadow-panel backdrop-blur lg:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Vue générale</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{vm.raw.mapName}</h2>
        <p className="mt-2 text-sm text-slate-300">
          {vm.raw.date ? new Date(vm.raw.date).toLocaleString('fr-FR') : 'Date inconnue'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
          <p className="text-sm text-slate-300">{vm.raw.teamA?.name ?? 'Team A'}</p>
          <p className="mt-2 text-4xl font-black text-white">{vm.raw.teamA?.score ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-orange-400/20 bg-orange-500/5 p-4">
          <p className="text-sm text-slate-300">{vm.raw.teamB?.name ?? 'Team B'}</p>
          <p className="mt-2 text-4xl font-black text-white">{vm.raw.teamB?.score ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
