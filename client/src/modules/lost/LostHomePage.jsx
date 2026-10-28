// The Lost page: numbers on top, your lost reports as red-edged claim tickets (tap one to
// see its matches), and your saved items beside them for reporting in one tap.
// There is one "Report lost item" button, in the page header.
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

// Numbers for the cards: reports still searching, matches waiting, items back.
function countReports(reports) {
  const searching = reports.filter((report) => ['open', 'matched'].includes(report.status));
  const matches = searching.reduce((sum, report) => sum + report.matchCount, 0);
  const recovered = reports.filter((report) => report.status === 'recovered');
  return { searching: searching.length, matches, recovered: recovered.length };
}

export function LostHomePage() {
  const navigate = useNavigate();
  const { data: reports, error } = useAsync(getMyReports);
  const counts = reports ? countReports(reports) : { searching: '-', matches: '-', recovered: '-' };

  return (
    <section className="page">
      <PageHeader
        title="Lost items"
        subtitle="Tell us what you lost. We compare it with every item handed in."
        actions={
          <Button icon="plus" size="lg" onClick={() => navigate('/lost/new')}>
            Report lost item
          </Button>
        }
      />
      <div className="stat-grid">
        <StatCard icon="search" label="Still searching" value={counts.searching} />
        <StatCard
          icon="bell"
          label="Possible matches"
          value={counts.matches}
          hint="Open a report to see them."
          tone={counts.matches > 0 ? 'attention' : 'normal'}
        />
        <StatCard icon="check-circle" label="Back with you" value={counts.recovered} />
      </div>
      <div className="lost-layout">
        <div className="card">
          <h2 className="card-title">Your reports</h2>
          <p className="card-subtitle">Newest first. Tap a report to see its matches.</p>
          {error ? <p className="field-error">{error}</p> : null}
          {!reports && !error ? <Spinner /> : null}
          {reports && reports.length === 0 ? (
            <EmptyState
              illustration="no-reports"
              title="No reports yet. Lost something? Use Report lost item at the top."
            />
          ) : null}
          {reports && reports.length > 0 ? (
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report._id} className="report-row">
                  <PropertyTag
                    item={ticketFromReport(report)}
                    onClick={() => navigate(`/lost/${report._id}`)}
                  />
                  {report.matchCount > 0 ? (
                    <span className="match-badge tabular">
                      {report.matchCount} {report.matchCount === 1 ? 'match' : 'matches'}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <SavedItemsCard />
      </div>
    </section>
  );
}
