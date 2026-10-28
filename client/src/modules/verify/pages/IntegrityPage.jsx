// Admin page that checks no item's history was changed.
import { useState } from 'react';
import { Button, Icon, PageHeader, Spinner, TextInput } from '../../../shared/ui/index.js';
import { runIntegrityCheck } from '../api.js';
import { useLoad } from '../hooks/useLoad.js';
import { formatDateTime } from '../format.js';
import { ChainItem } from '../components/ChainItem.jsx';

const PAGE_SIZE = 12;

async function checkAllChains() {
  const result = await runIntegrityCheck();
  return { ...result, checkedAt: new Date() };
}

function isBroken(chain) {
  return chain.blocks.some((block) => !block.valid);
}

function Verdict({ result, checkedAt }) {
  const brokenCount = result.brokenItems.length;
  return (
    <div className={result.ok ? 'card verdict verdict-ok' : 'card verdict verdict-bad'}>
      <Icon name={result.ok ? 'shield-check' : 'warning'} size={44} />
      <div>
        <h2 className="card-title">
          {result.ok
            ? `All ${result.chains.length} item histories are untouched`
            : `${brokenCount} of ${result.chains.length} item histories were changed outside the app`}
        </h2>
        <p className="card-subtitle">
          {result.ok
            ? 'Nobody has edited any item history directly in the database.'
            : 'Someone edited the database directly. The changed items are listed first below.'}{' '}
          Checked {formatDateTime(checkedAt)}.
        </p>
      </div>
    </div>
  );
}

export function IntegrityPage() {
  const { data: result, loading, error, reload } = useLoad(checkAllChains);
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);

  const query = search.trim().toLowerCase();
  const chains = result
    ? [...result.chains]
        .sort((first, second) => Number(isBroken(second)) - Number(isBroken(first)))
        .filter((chain) => `${chain.serial} ${chain.title}`.toLowerCase().includes(query))
    : [];

  return (
    <section className="page verify-page">
      <PageHeader
        title="History check"
        subtitle="Proves that nobody changed an item's history behind the app's back."
        actions={
          <Button icon="refresh" loading={loading} onClick={reload}>
            Check again
          </Button>
        }
      />
      {error ? <p className="field-error">{error}</p> : null}
      {!result && loading ? <Spinner /> : null}
      {result ? <Verdict result={result} checkedAt={result.checkedAt} /> : null}
      <div className="card how-check">
        <h2 className="card-title">How the check works</h2>
        <ol className="how-check-list">
          <li>Every step of an item (posted, dropped at desk, handed over) is saved in order.</li>
          <li>Each step also saves a fingerprint of the step before it, like links in a chain.</li>
          <li>Editing an old step breaks every link after it, and this check finds the break.</li>
        </ol>
      </div>
      {result ? (
        <div className="card">
          <div className="chain-toolbar">
            <h2 className="card-title">Items</h2>
            <TextInput
              type="search"
              placeholder="Search by serial or name"
              aria-label="Search items"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <ul className="chain-items">
            {chains.slice(0, shown).map((chain) => (
              <ChainItem key={chain.itemId} chain={chain} />
            ))}
          </ul>
          {chains.length === 0 ? <p className="muted">No item matches your search.</p> : null}
          {chains.length > shown ? (
            <Button variant="quiet" onClick={() => setShown(shown + PAGE_SIZE)}>
              Show more ({chains.length - shown} left)
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
