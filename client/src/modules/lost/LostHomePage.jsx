// Lost page: your open reports, counts and saved items.
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

const ACTIVE = ['open', 'matched', 'claim_in_progress'];

function sortReports(reports) {
  const active = reports.filter((report) => ACTIVE.includes(report.status));
  const finished = reports.filter((report) => !ACTIVE.includes(report.status));
  const matches = active.reduce((sum, report) => sum + report.matchCount, 0);
  const recovered = finished.filter((report) => report.status === 'recovered').length;
  return { active, finished, matches, recovered };
}

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
