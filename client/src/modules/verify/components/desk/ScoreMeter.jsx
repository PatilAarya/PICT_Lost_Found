// How well a claimant's answers matched, as a percentage with a small bar and a word:
// "Strong" (70% and up, the pass mark in services/scoring.js on the server),
// "Weak" below that. The word means the result never depends on colour alone.
import { percent } from '../../format.js';

const PASS_MARK = 0.7;

export function ScoreMeter({ score }) {
  const strong = (score || 0) >= PASS_MARK;
  return (
    <div className={strong ? 'score-meter score-strong' : 'score-meter score-weak'}>
      <span className="score-number tabular">{percent(score)}</span>
      {/* --score (0 to 1) sets how much of the bar is filled, in CSS. */}
      <span className="score-track" aria-hidden="true">
        <span className="score-fill" style={{ '--score': score || 0 }} />
      </span>
      <span className="score-word">{strong ? 'Strong match' : 'Weak match'}</span>
    </div>
  );
}
