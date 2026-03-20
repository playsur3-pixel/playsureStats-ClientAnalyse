import { MatchViewModel } from '../lib/types';
import { buildRoundSummary, getRoundsFromSelection } from '../lib/stats';

export function RoundsTable({
  vm,
  playerSteamId,
  selectedGroup,
}: {
  vm: MatchViewModel;
  playerSteamId: string;
  selectedGroup: string;
}) {
  const selectedRounds = getRoundsFromSelection(selectedGroup, vm);

  return (
    <section className="panel">
      <div>
        <p className="eyebrow">Tableau général</p>
        <h3>Résumé des rounds</h3>
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
              <th>K</th>
              <th>D</th>
              <th>K/D</th>
            </tr>
          </thead>
          <tbody>
            {vm.rounds
              .filter((round) => selectedRounds.includes(round.number))
              .map((round) => {
                const summary = buildRoundSummary(vm, round.number, playerSteamId);
                if (!summary) return null;

                return (
                  <tr key={round.number}>
                    <td>R{summary.roundNumber}</td>
                    <td>{summary.score}</td>
                    <td>{summary.winner}</td>
                    <td>{summary.sideA}</td>
                    <td>{summary.sideB}</td>
                    <td>{summary.playerKills}</td>
                    <td>{summary.playerDeaths}</td>
                    <td>{summary.playerKd == null ? '—' : summary.playerKd.toFixed(2)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}