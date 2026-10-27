// Desk tab 3: items a finder says they dropped at the desk. When the handler has
// the item in hand, "Received" records RECEIVED_BY_HANDLER and STORED in the custody log.
import { useState } from 'react';
import { errorMessage } from '../../../../shared/api/client.js';
import { Button, EmptyState, PropertyTag, useToast } from '../../../../shared/ui/index.js';
import { getIncoming, receiveItem } from '../../api.js';
import { useLoad } from '../../hooks/useLoad.js';
import { ticketOf } from '../../format.js';

export function IncomingTab() {
  const toast = useToast();
  const { data: items, loading, error, reload } = useLoad(getIncoming);
  const [busyId, setBusyId] = useState('');

  // Mark one item as received and stored.
  async function handleReceive(item) {
    setBusyId(item.id);
    try {
      await receiveItem(item.id);
      toast(`${item.serial} received and stored.`);
      reload();
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  if (loading && !items) return <p>Loading</p>;
  if (error) return <p className="field-error">{error}</p>;
  if (items.length === 0) return <EmptyState title="Nothing on its way to the desk." />;

  return (
    <ul className="ticket-list">
      {items.map((item) => (
        <li key={item.id} className="incoming-row">
          <PropertyTag item={{ ...ticketOf(item), timeLabel: `From ${item.finderName}` }} compact />
          <Button
            variant="secondary"
            icon="check"
            loading={busyId === item.id}
            onClick={() => handleReceive(item)}
          >
            Received
          </Button>
        </li>
      ))}
    </ul>
  );
}
