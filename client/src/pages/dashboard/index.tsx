import './style.css';
import useLoad from '../../hooks/useLoad';
import PortfolioHero from '../../components/PortfolioHero';
import StatGrid from '../../components/StatGrid';
import Stat from '../../components/Stat';
import EvolutionChart from '../../components/EvolutionChart';
import RecommendationList from '../../components/RecommendationList';
import { kz } from '../../utils/format';
import type { EvolutionPoint, Recommendation, Report } from '../../types';

export default function Dashboard() {
  const [report] = useLoad<Report>('/relatorios?tipo=mensal');
  const [evolution] = useLoad<EvolutionPoint[]>('/evolucao');
  const [recommendations] = useLoad<Recommendation[]>('/recomendacoes');
  if (!report) return <p>A carregar…</p>;
  const c = report.carteira;
  return (
    <div className="dashboard-page">
      <PortfolioHero capital={c.capital} atual={c.atual} ganho={c.ganhoNaoRealizado} />
      <StatGrid>
        <Stat label="Gastos este mês" value={kz(report.gastos)} />
        <Stat label="Rendimentos recebidos no mês" value={kz(report.rendimentos)} />
      </StatGrid>
      <EvolutionChart data={evolution} />
      <RecommendationList items={recommendations} />
    </div>
  );
}
