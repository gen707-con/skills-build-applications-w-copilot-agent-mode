import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Item = Record<string, unknown>;
type Props = {
  title: string;
  description: string;
  endpoint: string;
  responseKey: string;
  emptyMessage: string;
  renderItem: (item: Item) => string;
};
type ViewState = { status: 'loading' } | { status: 'error' } | { status: 'success'; items: Item[] };

export function CapabilityCard({ title, description, endpoint, responseKey, emptyMessage, renderItem }: Props) {
  const [view, setView] = useState<ViewState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setView({ status: 'loading' });
    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const value = response[responseKey];
        const items = Array.isArray(value)
          ? value.filter((item): item is Item => item !== null && typeof item === 'object')
          : [];
        if (active) setView({ status: 'success', items });
      })
      .catch(() => {
        if (active) setView({ status: 'error' });
      });

    return () => { active = false; };
  }, [endpoint, responseKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {view.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {view.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}. Please try again.</p>}
        {view.status === 'success' && view.items.length === 0 && <p role="status">{emptyMessage}</p>}
        {view.status === 'success' && view.items.length > 0 && (
          <ul className="list-group list-group-flush">
            {view.items.map((item, index) => (
              <li className="list-group-item" key={String(item._id ?? index)}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
