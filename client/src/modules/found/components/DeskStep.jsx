// Asks where the item will be kept and suggests the nearest desk.
import { useEffect, useState } from 'react';
import { ChipSelect } from '../../../shared/ui/index.js';
import { api } from '../../../shared/api/client.js';

export default function DeskStep({ location, value, onChange }) {
  const [desks, setDesks] = useState([]);

  useEffect(() => {
    if (!location?.buildingId || !location?.floorId) return;
    api
      .get('/found/desks/suggest', {
        params: { buildingId: location.buildingId, floorId: location.floorId },
      })
      .then((response) => {
        setDesks(response.data.allDesks);
        if (response.data.desk && value.type === 'desk' && !value.deskId) {
          onChange({ type: 'desk', deskId: response.data.desk.id });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.buildingId, location?.floorId]);

  const deskOptions = desks.map((desk) => ({ value: desk.id, label: desk.name }));

  return (
    <div className="desk-step">
      <ChipSelect
        options={[
          { value: 'desk', label: 'Drop it at a desk' },
          { value: 'finder', label: 'Keep it, arrange a meetup' },
        ]}
        value={value.type}
        onChange={(type) => onChange({ type, deskId: type === 'desk' ? value.deskId : '' })}
      />
      {value.type === 'desk' && (
        <p className="step-label">Which desk? The nearest one is chosen for you.</p>
      )}
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
