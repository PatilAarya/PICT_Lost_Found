// Asks the finder where the item will physically be: dropped at a desk,
// or kept with the finder for a meetup. If "desk" is chosen, suggests
// the nearest one based on the location already picked, and lets the
// finder pick a different one from the full list instead.
import { useEffect, useState } from 'react';
import { ChipSelect, PageHeader } from '../../../shared/ui/index.js';
import { api } from '../../../shared/api/client.js';

export default function DeskStep({ location, value, onChange }) {
  const [desks, setDesks] = useState([]);

  // Asks the server for the best desk once a location has been chosen.
  useEffect(() => {
    if (!location?.buildingId || !location?.floorId) return;
    api
      .get('/found/desks/suggest', {
        params: { buildingId: location.buildingId, floorId: location.floorId },
      })
      .then((response) => {
        setDesks(response.data.allDesks);
        // Only fill in a suggestion if the finder has not already chosen one.
        if (response.data.desk && value.type === 'desk' && !value.deskId) {
          onChange({ type: 'desk', deskId: response.data.desk.id });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.buildingId, location?.floorId]);

  const deskOptions = desks.map((desk) => ({ value: desk.id, label: desk.name }));

  return (
    <div className="desk-step">
      <PageHeader title="Where will this item go?" />
      <ChipSelect
        options={[
          { value: 'desk', label: 'Drop it at a desk' },
          { value: 'finder', label: 'Keep it, arrange a meetup' },
        ]}
        value={value.type}
        onChange={(type) => onChange({ type, deskId: type === 'desk' ? value.deskId : '' })}
      />
      {value.type === 'desk' && (
        <ChipSelect
          options={deskOptions}
          value={value.deskId}
          onChange={(deskId) => onChange({ type: 'desk', deskId })}
        />
      )}
    </div>
  );
}