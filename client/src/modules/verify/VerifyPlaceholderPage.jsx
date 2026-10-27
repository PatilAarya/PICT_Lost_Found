// Placeholder page for the verify module (Member 2 replaces it in feat/verify).
// One component with a title prop covers all four verify pages for now.
import { PageHeader } from '../../shared/ui/index.js';

export function VerifyPlaceholderPage({ title }) {
  return (
    <section className="page">
      <PageHeader title={title} subtitle="Coming soon." />
    </section>
  );
}
