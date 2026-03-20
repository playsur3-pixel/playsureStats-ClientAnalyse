import { MatchViewModel } from '../lib/types';
import { buildRoundSummary } from '../lib/stats';

export function RoundsTable({
  vm,
  selected,
  onSelect,
}: {
  vm: MatchViewModel;
  selected: number | 'global';
  onSelect: (round: number) => void;
}) {
  return (
    <section className="panel">
      <div>
        <p className="eyebrow">Tableau général</p>
        <h3>Résumé par round</h3>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Score</th>
              <th>Winner</th>
              <th>Team A side</th>
              <th>Team B side</th>
              <th>Start money A</th>
              <th>Start money B</th>
            </tr>
          </thead>
          <tbody>
            {vm.rounds.map((round) => {
              const summary = buildRoundSummary(vm, round.number);
              if (!summary) return null;
              return (
                <tr key={round.number} className={selected === round.number ? 'selected-row' : ''} onClick={() => onSelect(round.number)}>
                  <td>R{summary.roundNumber}</td>
                  <td>{summary.score}</td>
                  <td>{summary.winner}</td>
                  <td>{summary.sideA}</td>
                  <td>{summary.sideB}</td>
                  <td>{summary.startMoneyA ?? '—'}</td>
                  <td>{summary.startMoneyB ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
