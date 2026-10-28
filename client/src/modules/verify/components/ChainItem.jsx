// One item on the History check page: a row with its serial, title, number of steps and
// "Untouched" or "Changed". Opening it shows the item's history as a readable timeline;
// the fingerprints (hashes) appear only after "Show technical details".
import { useState } from 'react';
import { Icon, Timeline } from '../../../shared/ui/index.js';
import { actionWord, formatDateTime } from '../format.js';

// The history steps as Timeline rows; a changed step says so in its label.
function historySteps(blocks) {
  return blocks.map((block) => ({
    label: block.valid ? actionWord(block.action) : `${actionWord(block.action)} (changed!)`,
    done: block.valid,
    at: formatDateTime(block.ts),
  }));
}

export function ChainItem({ chain }) {
  const [open, setOpen] = useState(false);
  const [showHashes, setShowHashes] = useState(false);
  const broken = chain.blocks.some((block) => !block.valid);

  return (
    <li className={broken ? 'chain-item chain-item-broken' : 'chain-item'}>
      <button
        type="button"
        className="chain-summary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="chain-serial tabular">{chain.serial || 'Unknown item'}</span>
        <span className="chain-title">{chain.title}</span>
        <span className="muted tabular">{chain.blocks.length} steps</span>
        <span className={broken ? 'chain-status chain-status-bad' : 'chain-status'}>
          <Icon name={broken ? 'warning' : 'check-circle'} size={18} />
          {broken ? 'Changed' : 'Untouched'}
        </span>
        <Icon name="caret-down" size={18} />
      </button>
      {open ? (
        <div className="chain-detail">
          <Timeline steps={historySteps(chain.blocks)} />
          <button type="button" className="link-button" onClick={() => setShowHashes(!showHashes)}>
            {showHashes ? 'Hide technical details' : 'Show technical details'}
          </button>
          {showHashes ? (
            <ol className="hash-list">
              {chain.blocks.map((block) => (
                <li key={block.seq} className={block.valid ? '' : 'hash-bad'}>
                  <span className="tabular">#{block.seq}</span> {actionWord(block.action)}:{' '}
                  <code>{block.hash}...</code>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
