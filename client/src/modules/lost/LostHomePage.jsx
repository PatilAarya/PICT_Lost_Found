// The Lost page: numbers on top, then only the things you are STILL looking for, as
// red-edged claim tickets (tap one to see its matches). Items you got back, or reports you
// closed, move to a separate "Back with you" history with a dark "finished" edge, so a
// recovered item is never mistaken for a lost one. Saved items sit beside the list.
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  PageHeader,
  PropertyTag,
  Spinner,
  StatCard,
} from '../../shared/ui/index.js';
import { getMyReports } from './api.js';
import { useAsync } from './hooks/useAsync.js';
import { ticketFromReport } from './utils/format.js';
import { SavedItemsCard } from './components/SavedItemsCard.jsx';
import './lost.css';

// A report is "active" while we are still looking or a claim is under way.
const ACTIVE = ['open', 'matched', 'claim_in_progress'];

// Split my reports into still-looking and finished, and count what the cards show.
function sortReports(reports) {
  const active = reports.filter((report) => ACTIVE.includes(report.status));
  const finished = reports.filter((report) => !ACTIVE.includes(report.status));
  const matches = active.reduce((sum, report) => sum + report.matchCount, 0);
  const recovered = finished.filter((report) => report.status === 'recovered').length;
  return { active, finished, matches, recovered };
}

// A list of report tickets; each opens its report page. Active ones show a match badge.
function ReportList({ reports, compact }) {
  const navigate = useNavigate();
  return (
    <ul className="report-list">
      {reports.map((report) => (
        <li key={report._id} className="report-row">
          <PropertyTag
            item={ticketFromReport(report)}
            compact={compact}
            onClick={() => navigate(`/lost/${report._id}`)}
          />
          {!compact && report.matchCount > 0 ? (
            <span className="match-badge tabular">
              {report.matchCount} {report.matchCount === 1 ? 'match' : 'matches'}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function LostHomePage() {
  const navigate = useNavigate();
  const { data: reports, error } = useAsync(getMyReports);
  const sorted = reports ? sortReports(reports) : null;

  return (
    <section className="page">
      <PageHeader
        title="Lost items"
        subtitle="Only you and the security desk can see your reports."
        actions={
          <Button icon="plus" size="lg" onClick={() => navigate('/lost/new')}>
            Report lost item
          </Button>
        }
      />
      <div className="stat-grid">
        <StatCard
          icon="search"
          label="Still looking for"
          value={sorted ? sorted.active.length : '-'}
        />
        <StatCard
          icon="bell"
          label="Possible matches"
          value={sorted ? sorted.matches : '-'}
          hint="Open a report to see them."
          tone={sorted && sorted.matches > 0 ? 'attention' : 'normal'}
        />
        <StatCard
          icon="check-circle"
          label="Back with you"
          value={sorted ? sorted.recovered : '-'}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
      {!sorted && !error ? <Spinner /> : null}
      {sorted ? (
        <div className="lost-layout">
          <div className="lost-column">
            <div className="card">
              <h2 className="card-title">Still looking for</h2>
              <p className="card-subtitle">Tap a report to see its matches.</p>
              {sorted.active.length === 0 ? (
                <EmptyState
                  illustration="no-reports"
                  title="Nothing missing right now. Lost something? Use Report lost item at the top."
                />
              ) : (
                <ReportList reports={sorted.active} compact={false} />
              )}
            </div>
            {sorted.finished.length > 0 ? (
              <div className="card">
                <h2 className="card-title">Back with you</h2>
                <p className="card-subtitle">
                  Items you got back and reports you closed, kept as your history.
                </p>
                <ReportList reports={sorted.finished} compact />
              </div>
            ) : null}
          </div>
          <SavedItemsCard />
        </div>
      ) : null}
    </section>
  );
}
