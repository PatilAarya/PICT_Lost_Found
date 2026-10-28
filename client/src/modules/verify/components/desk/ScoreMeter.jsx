// Shows how well a claimant's answers matched.
import { percent } from '../../format.js';

const PASS_MARK = 0.7;

export function ScoreMeter({ score }) {
  const strong = (score || 0) >= PASS_MARK;
  return (
    <div className={strong ? 'score-meter score-strong' : 'score-meter score-weak'}>
      <span className="score-number tabular">{percent(score)}</span>
      <span className="score-track" aria-hidden="true">
        <span className="score-fill" style={{ '--score': score || 0 }} />
      </span>
      <span className="score-word">{strong ? 'Strong match' : 'Weak match'}</span>
    </div>
  );
}
