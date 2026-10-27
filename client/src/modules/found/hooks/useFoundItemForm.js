// Holds all the state for the "post a found item" flow across every
// step (category, photos, colours, hidden details, location, desk,
// review) in one place, so the page component stays about showing
// steps, not about managing form state.
import { useState } from 'react';

const initialState = {
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
  foundAt: new Date().toISOString().slice(0, 16), // for a datetime-local input
  custody: { type: 'desk', deskId: '' },
};

export function useFoundItemForm() {
  const [form, setForm] = useState(initialState);

  // Updates one or more fields at once, keeping everything else as is.
  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function reset() {
    setForm(initialState);
  }

  return { form, update, reset };
}