// Holds all the state for the "post a found item" flow across every
// step (category, photos, colours, hidden details, location, desk,
// review) in one place, so the page component stays about showing
// steps, not about managing form state.
import { useState } from 'react';

// The current time as "2026-10-28T07:51" in LOCAL time, the format a datetime-local
// box expects. toISOString() alone gives UTC, which in India is 5 h 30 min behind and
// would make every item look found earlier than it was. getTimezoneOffset() is the
// difference in minutes (-330 in India), so subtracting it turns UTC into local time.
export function localNowForInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// A fresh, empty form. A function (not a constant) so the time is "now" every time.
function initialState() {
  return {
    category: '',
    title: '',
    description: '',
    colors: [],
    brand: '',
    photos: [], // raw captures from CameraCapture: { id, blob, previewUrl }
    confirmedPhotos: [], // after blur step: { id, publicBlob, privateBlob }
    aiSuggestion: null,
    hiddenDetails: [], // [{ promptKey, promptText, answer }]
    location: null, // { buildingId, floorId, areaId, x, y }
    foundAt: localNowForInput(),
    custody: { type: 'desk', deskId: '' },
  };
}

export function useFoundItemForm() {
  const [form, setForm] = useState(initialState);

  // Updates one or more fields at once, keeping everything else as is.
  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  // Empties the form after posting, with the time set to now again.
  function reset() {
    setForm(initialState());
  }

  return { form, update, reset };
}
