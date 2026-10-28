// Small text helpers for the found screens: a readable place and a readable date.
// Intl.DateTimeFormat is the browser's own date formatter, so no library is needed.
// Used by PostFoundItemPage.jsx and MyFoundItemsPage.jsx when building tickets.

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

// "27 Oct 2026, 2:15 pm", or '' for no date.
export function formatDateTime(value) {
  return value ? dateTime.format(new Date(value)) : '';
}

// "main, floor 1, entrance" from a Location object, or '' when there is none.
export function placeLabel(location) {
  if (!location) {
    return '';
  }
  const parts = [location.buildingId, `floor ${location.floorId}`, location.areaId];
  return parts.filter(Boolean).join(', ').replaceAll('-', ' ');
}

// How many secret questions have a real (not blank) answer.
export function answeredCount(hiddenDetails) {
  return hiddenDetails.filter((detail) => detail.answer.trim() !== '').length;
}
