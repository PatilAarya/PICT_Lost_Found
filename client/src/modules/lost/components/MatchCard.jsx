// One possible match for a lost report with its score.
import { useNavigate } from 'react-router-dom';
import { Button, PropertyTag } from '../../../shared/ui/index.js';
import { ticketFromFoundItem } from '../utils/format.js';

const FACTOR_NAMES = {
  category: 'Category',
  place: 'Place',
  colour: 'Colour',
  text: 'Description',
  time: 'Time',
};

function FactorBar({ factor }) {
  return (
    <li className="factor">
      <span className="factor-name">{FACTOR_NAMES[factor.key] || factor.key}</span>
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
