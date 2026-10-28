// One possible match on a lost report: the found item's ticket (blurred public photo
// only), the score out of 100, the "why this match" sentence, a small bar per factor,
// and "This is mine", which starts a claim in the verify module.
import { useNavigate } from 'react-router-dom';
import { Button, PropertyTag } from '../../../shared/ui/index.js';
import { ticketFromFoundItem } from '../utils/format.js';

// Readable names for the five factors of a score.
const FACTOR_NAMES = {
  category: 'Category',
  place: 'Place',
  colour: 'Colour',
  text: 'Description',
  time: 'Time',
};

// One factor: its name, a bar filled to points / max, and "12 / 15".
function FactorBar({ factor }) {
  return (
    <li className="factor">
      <span className="factor-name">{FACTOR_NAMES[factor.key] || factor.key}</span>
      {/* --share (0 to 1) sets how much of the bar is filled, in lost.css. */}
      <span className="factor-track" aria-hidden="true">
        <span className="factor-fill" style={{ '--share': factor.points / factor.max }} />
      </span>
      <span className="factor-points tabular">
        {factor.points} / {factor.max}
      </span>
    </li>
  );
}

export function MatchCard({ match, reportId, canClaim }) {
  const navigate = useNavigate();
  const claimLink = `/verify/claim/new?foundItemId=${match.item.id}&lostReportId=${reportId}`;
  return (
    <li className="match-card">
      <div className="match-head">
        <PropertyTag item={ticketFromFoundItem(match.item)} compact />
        <div className="match-score">
          <span className="match-total tabular">{match.total}</span>
          <span className="muted">out of 100</span>
        </div>
      </div>
      <p className="match-why">
        <strong>Why this match:</strong> {match.why}
      </p>
      <ul className="factor-list">
        {match.breakdown.map((factor) => (
          <FactorBar key={factor.key} factor={factor} />
        ))}
      </ul>
      {canClaim ? (
        <div className="button-row">
          <Button icon="check" onClick={() => navigate(claimLink)}>
            This is mine
          </Button>
          <span className="muted">You will answer a few questions only the owner knows.</span>
        </div>
      ) : null}
    </li>
  );
}
