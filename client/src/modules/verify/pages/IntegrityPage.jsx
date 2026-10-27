// /verify/integrity (admin) - runs the custody chain check and draws every item's
// log as linked blocks. Each block shows the start of its hash; a broken block and
// everything after it are drawn in --berry, so a database edit is easy to see.
import { useState } from 'react';
import { errorMessage } from '../../../shared/api/client.js';
import { Button, PageHeader, Stamp } from '../../../shared/ui/index.js';
import { runIntegrityCheck } from '../api.js';

// One item's chain: blocks joined by short lines.
function ChainRow({ chain }) {
  return (
    <li className="chain-row">
      <p className="chain-title">
        <span className="tabular">{chain.serial}</span> {chain.title}
      </p>
      <ol className="chain-blocks">
        {chain.blocks.map((block) => (
          <li key={block.seq} className={block.valid ? 'block' : 'block block-broken'}>
            <span className="block-seq tabular">#{block.seq}</span>
            <span className="block-action">{block.action.replaceAll('_', ' ').toLowerCase()}</span>
            <code className="block-hash">{block.hash}</code>
          </li>
        ))}
      </ol>
    </li>
  );
}

export function IntegrityPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Ask the server to recompute every hash.
  async function handleCheck() {
    setBusy(true);
    setError('');
    try {
      setResult(await runIntegrityCheck());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // Broken chains first (true counts as 1), so the problem is at the top.
  const isBroken = (chain) => Number(chain.blocks.some((block) => !block.valid));
  const chains = result
    ? [...result.chains].sort((first, second) => isBroken(second) - isBroken(first))
    : [];

  return (
    <section className="page verify-page">
      <PageHeader
        title="Custody log integrity"
        actions={
          <Button icon="shield" loading={busy} onClick={handleCheck}>
            Run check
          </Button>
        }
      />
      {error ? <p className="field-error">{error}</p> : null}
      {result ? (
        <div className="integrity-summary">
          {result.ok ? (
            <Stamp status="verified" />
          ) : (
            <span className="integrity-broken">Broken</span>
          )}
          <p>
            {result.ok
              ? `All ${result.chains.length} item logs are intact.`
              : `Changed outside the app: ${result.brokenItems.length} of ${result.chains.length} item logs.`}
          </p>
        </div>
      ) : (
        <p>Recomputes every hash in every item's custody log and shows where a chain breaks.</p>
      )}
      <ul className="chain-list">
        {chains.map((chain) => (
          <ChainRow key={chain.itemId} chain={chain} />
        ))}
      </ul>
    </section>
  );
}
