// List of saved items with a quick Report lost button.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Pictogram, Sheet, useToast } from '../../../shared/ui/index.js';
import { errorMessage } from '../../../shared/api/client.js';
import { deleteSavedItem, getSavedItems } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { SavedItemForm } from './SavedItemForm.jsx';

function SavedRow({ item, onReport, onDelete }) {
  return (
    <li className="saved-row">
      <Pictogram category={item.category} size={40} />
      <div className="saved-text">
        <strong>{item.label}</strong>
        <span className="muted">{item.description || item.brand || item.category}</span>
        <button type="button" className="saved-report" onClick={() => onReport(item)}>
          Report lost
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label={`Delete ${item.label}`}
        onClick={() => onDelete(item)}
      >
        <Icon name="trash" size={20} />
      </button>
    </li>
  );
}

export function SavedItemsCard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: items, error, reload } = useAsync(getSavedItems);
  const [adding, setAdding] = useState(false);

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.label}" from your saved items?`)) return;
    try {
      await deleteSavedItem(item._id);
      toast('Saved item deleted.');
      reload();
    } catch (err) {
      toast(errorMessage(err));
    }
  }

  function handleAdded() {
    setAdding(false);
    toast('Saved for next time.');
    reload();
  }

  return (
    <aside className="card">
      <h2 className="card-title">Saved items</h2>
      <p className="card-subtitle">
        Describe your everyday things once. Report them lost in one tap.
      </p>
      {error ? <p className="field-error">{error}</p> : null}
      {items && items.length === 0 ? (
        <p className="muted">Nothing saved yet. Add your bottle, ID card or laptop.</p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className="saved-list">
          {items.map((item) => (
            <SavedRow
              key={item._id}
              item={item}
              onReport={() => navigate(`/lost/new?saved=${item._id}`)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : null}
      <Button variant="quiet" icon="plus" onClick={() => setAdding(true)}>
        Add saved item
      </Button>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Add a saved item">
        {adding ? <SavedItemForm onSaved={handleAdded} /> : null}
      </Sheet>
    </aside>
  );
}
