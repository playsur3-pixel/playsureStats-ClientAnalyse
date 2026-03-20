import { buildRoundSummary } from '../lib/stats';
import { MatchViewModel } from '../lib/types';

function iconForResult(winner: 'A' | 'B' | '?', row: 'A' | 'B') {
  if (winner === '?') return '•';
  return winner === row ? '🔫' : '💀';
}

function rowTone(side: string) {
  return side === 'CT' ? 'text-cyan-300' : side === 'T' ? 'text-orange-300' : 'text-slate-300';
}

export function RoundsTable({
  vm,
  playerSteamId,
}: {
  vm: MatchViewModel;
  playerSteamId: string;
  selectedGroup: string;
}) {
  const rounds = vm.rounds
    .map((round) => buildRoundSummary(vm, round.number, playerSteamId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Vue horizontale</p>
      <h3 className="mt-2 text-xl font-bold text-white">Historique des rounds</h3>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[900px] rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-[120px_repeat(30,minmax(40px,1fr))]">
            <div className="border-b border-r border-white/10 px-3 py-2 text-sm font-semibold text-slate-200">Round</div>
            {rounds.map((round) => (
              <div key={`head-${round.roundNumber}`} className="border-b border-r border-white/10 px-2 py-2 text-center text-sm text-slate-200 last:border-r-0">
                {round.roundNumber}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[120px_repeat(30,minmax(40px,1fr))]">
            <div className="border-b border-r border-white/10 px-3 py-2 text-sm font-medium text-slate-300">{vm.raw.teamA?.name ?? 'Team A'}</div>
            {rounds.map((round) => (
              <div
                key={`a-${round.roundNumber}`}
                className={`border-b border-r border-white/10 px-2 py-2 text-center text-lg last:border-r-0 ${rowTone(round.sideA)}`}
                title={`R${round.roundNumber} - ${round.sideA}`}
              >
                {iconForResult(round.winner, 'A')}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[120px_repeat(30,minmax(40px,1fr))]">
            <div className="border-r border-white/10 px-3 py-2 text-sm font-medium text-slate-300">{vm.raw.teamB?.name ?? 'Team B'}</div>
            {rounds.map((round) => (
              <div
                key={`b-${round.roundNumber}`}
                className={`border-r border-white/10 px-2 py-2 text-center text-lg last:border-r-0 ${rowTone(round.sideB)}`}
                title={`R${round.roundNumber} - ${round.sideB}`}
              >
                {iconForResult(round.winner, 'B')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
