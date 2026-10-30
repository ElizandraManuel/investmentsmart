import './style.css';
import type { Recommendation } from '../../types';

export default function RecommendationList({ items }: { items: Recommendation[] | null }) {
  return (
    <section className="card">
      <h3>Recomendações</h3>
      {items?.length ? items.map((r, i) => (
        <div key={i} className="rec"><p>{r.descricao}</p><small>Baseado em: {r.fundamento}</small></div>
      )) : <p className="muted">Sem alertas de momento.</p>}
      <small>Sugestões informativas baseadas nos seus registos. Não garantem rentabilidade.</small>
    </section>
  );
}
