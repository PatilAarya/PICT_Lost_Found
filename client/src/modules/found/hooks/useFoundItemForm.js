// Hook that holds the form state for posting a found item.
import { useState } from 'react';

export function localNowForInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function initialState() {
  return {
    category: '',
    title: '',
    description: '',
    colors: [],
    brand: '',
    photos: [],
    confirmedPhotos: [],
    aiSuggestion: null,
    hiddenDetails: [],
    location: null,
    foundAt: localNowForInput(),
    custody: { type: 'desk', deskId: '' },
  };
}

export function useFoundItemForm() {
  const [form, setForm] = useState(initialState);

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function reset() {
    setForm(initialState());
  }

  return { form, update, reset };
}
