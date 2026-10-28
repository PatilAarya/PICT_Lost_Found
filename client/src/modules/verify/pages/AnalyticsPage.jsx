// Analytics page with numbers and charts for the office.
import { useCallback, useState } from 'react';
import { Button, PageHeader, Spinner, StatCard, TextInput } from '../../../shared/ui/index.js';
import { getAnalytics } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { BarChart } from '../charts/BarChart.jsx';
import { HourHistogram, hourLabel } from '../charts/HourHistogram.jsx';
import { maxCount } from '../charts/scale.js';

function ChartCard({ title, text, children }) {
  return (
    <div className="card chart-card">
      <h2 className="card-title">{title}</h2>
      <p className="card-subtitle">{text}</p>
      {children}
    </div>
  );
}

function busiestHourSentence(hours) {
  const busiest = maxCount(hours);
  if (busiest === 0) return 'No items in this period yet.';
  const slot = hours.find((hour) => hour.count === busiest);
  return `Most items are found around ${hourLabel(slot.hour)}. Keep the desk staffed then.`;
}

function DateRange({ from, to, setFrom, setTo }) {
  function clearDates() {
    setFrom('');
    setTo('');
  }
  return (
    <div className="date-range">
      <label>
        <span>From</span>
        <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      </label>
      <label>
        <span>To</span>
        <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </label>
      {from || to ? (
        <Button variant="quiet" onClick={clearDates}>
          Clear
        </Button>
      ) : null}
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
      <PageHeader
        title="Analytics"
        subtitle="How the lost property office is doing. All dates when left empty."
        actions={<DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />}
      />
      {error ? <p className="field-error">{error}</p> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <>
          <div className="stat-grid">
            <StatCard
              icon="clock"
              label="Average time to return"
              value={data.averageReturnHours}
              unit="hours"
              hint="From posting an item to handing it to its owner."
            />
            <StatCard
              icon="ticket"
              label="Claims waiting"
              value={data.claimsWaiting}
              hint="The desk still has to decide these."
              tone={data.claimsWaiting > 0 ? 'attention' : 'normal'}
            />
            <StatCard
              icon="check-circle"
              label="Returned this week"
              value={data.releasedThisWeek}
              hint="Items handed back in the last 7 days."
            />
            <StatCard
              icon="package"
              label="Items found"
              value={data.totalItems}
              hint="Everything posted in this period."
            />
          </div>
          <p className="insight">
            <strong>Busiest time:</strong> {busiestHourSentence(data.byHour)}
          </p>
          <div className="chart-grid-layout">
            <ChartCard title="Where items are found" text="Number of items found in each building.">
              <BarChart title="Items by building" rows={data.byBuilding} />
            </ChartCard>
            <ChartCard
              title="What gets lost"
              text="Number of items in each category. The top one is in red."
            >
              <BarChart title="Items by category" rows={data.byCategory} />
            </ChartCard>
            <ChartCard
              title="When items are found"
              text="Items found in each hour of the day, 0 to 23. Red is the busiest hour."
            >
              <HourHistogram hours={data.byHour} />
            </ChartCard>
            <ChartCard
              title="Which floors"
              text="Number of items found on each floor of each building."
            >
              <BarChart title="Items by floor" rows={data.byFloor} highlightFirst={false} />
            </ChartCard>
          </div>
        </>
      ) : null}
    </section>
  );
}
