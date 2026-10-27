// /verify/analytics - the dashboard: big numbers on top, then hand-built SVG charts
// for building, floor, category and hour of day. Optional from/to dates reload it.
import { useCallback, useState } from 'react';
import { Field, PageHeader, Spinner, TextInput } from '../../../shared/ui/index.js';
import { getAnalytics } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { BarChart } from '../charts/BarChart.jsx';
import { HourHistogram } from '../charts/HourHistogram.jsx';

// One large number with a small label under it.
function BigNumber({ value, label, unit }) {
  return (
    <div className="big-number">
      <span className="big-number-value tabular">
        {value}
        {unit ? <small> {unit}</small> : null}
      </span>
      <span className="big-number-label">{label}</span>
    </div>
  );
}

export function AnalyticsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const load = useCallback(() => getAnalytics(from, to), [from, to]);
  const { data, loading, error } = useLoad(load);

  return (
    <section className="page verify-page">
      <PageHeader title="Analytics" />
      <div className="date-range">
        <Field label="From">
          <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label="To">
          <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <>
          <div className="big-numbers">
            <BigNumber value={data.averageReturnHours} unit="h" label="Average time to return" />
            <BigNumber value={data.claimsWaiting} label="Claims waiting" />
            <BigNumber value={data.releasedThisWeek} label="Returned this week" />
            <BigNumber value={data.totalItems} label="Items found" />
          </div>
          <div className="chart-grid-layout">
            <BarChart title="Items by building" rows={data.byBuilding} />
            <BarChart title="Items by category" rows={data.byCategory} />
            <HourHistogram hours={data.byHour} />
            <BarChart title="Items by floor" rows={data.byFloor} highlightFirst={false} />
          </div>
        </>
      ) : null}
    </section>
  );
}
