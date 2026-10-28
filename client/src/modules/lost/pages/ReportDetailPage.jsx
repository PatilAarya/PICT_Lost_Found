// /lost/:id - one lost report: its ticket and status timeline on the side, and the
// possible matches, best first, each explained in plain words. "This is mine" starts a
// claim; "I found it myself" closes the report so it stops matching.
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  PageHeader,
  PropertyTag,
  Spinner,
  Timeline,
  useToast,
} from '../../../shared/ui/index.js';
import { errorMessage } from '../../../shared/api/client.js';
import { closeReport, getReport } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDateTime, ticketFromReport } from '../utils/format.js';
import { MatchCard } from '../components/MatchCard.jsx';
import '../lost.css';

// Reports that still want matches; the others are finished.
const SEARCHING = ['open', 'matched'];

export function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const load = useCallback(() => getReport(id), [id]);
  const { data, error, reload } = useAsync(load);

  // Stop matching this report, after the person confirms.
  async function handleClose() {
    if (!window.confirm('Close this report? We will stop looking for matches.')) return;
    try {
      await closeReport(id);
      toast('Report closed.');
      reload();
    } catch (err) {
      toast(errorMessage(err));
    }
  }

  if (error) return <p className="field-error">{error}</p>;
  if (!data) return <Spinner />;

  const { report, timeline, matches } = data;
  const searching = SEARCHING.includes(report.status);
  return (
    <section className="page">
      <PageHeader
        title={report.title}
        subtitle={`Report ${report.serial}, made ${formatDateTime(report.createdAt)}`}
        actions={
          <Button variant="quiet" icon="arrow-left" onClick={() => navigate('/lost')}>
            All reports
          </Button>
        }
      />
      <div className="lost-layout lost-layout-detail">
        <div className="card">
          <h2 className="card-title">Possible matches</h2>
          <p className="card-subtitle">
            Items handed in that look like yours, best first. Photos are blurred copies.
          </p>
          {matches.length === 0 ? (
            <EmptyState
              illustration="no-matches"
              title="No matches yet. We check every new item and will alert you."
            />
          ) : (
            <ul className="match-list">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  reportId={report._id}
                  canClaim={searching}
                />
              ))}
            </ul>
          )}
        </div>
        <aside className="card detail-aside">
          <PropertyTag item={ticketFromReport(report)} />
          <h2 className="card-title">Progress</h2>
          <Timeline steps={timeline.map((step) => ({ ...step, at: formatDateTime(step.at) }))} />
          {searching ? (
            <Button variant="quiet" onClick={handleClose}>
              I found it myself
            </Button>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
