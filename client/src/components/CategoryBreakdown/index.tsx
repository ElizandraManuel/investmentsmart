import './style.css';
import { kz } from '../../utils/format';
import type { CategoryTotal } from '../../types';

export default function CategoryBreakdown({ categories }: { categories: CategoryTotal[] }) {
  return (
    <section className="card">
      <h3>Gastos por categoria</h3>
      {categories.length ? categories.map(c => (
        <p key={c.categoria} className="category-line"><span>{c.categoria}</span><b>{kz(c.total)}</b></p>
      )) : <p className="muted">Sem gastos neste período.</p>}
    </section>
  );
}
