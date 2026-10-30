import { useState } from 'react';
import './style.css';
import useLoad from '../../hooks/useLoad';
import PeriodTabs from '../../components/PeriodTabs';
import StatGrid from '../../components/StatGrid';
import Stat from '../../components/Stat';
import CategoryBreakdown from '../../components/CategoryBreakdown';
import { kz, tone } from '../../utils/format';
import type { Period, Report } from '../../types';

export default function Reports() {
  const [period, setPeriod] = useState<Period>('semanal');
  const [report] = useLoad<Report>(`/relatorios?tipo=${period}`);
  return (
    <div className="reports-page">
      <h2>Relatórios</h2>
      <PeriodTabs value={period} onChange={setPeriod} />
      {report && <>
        <p className="muted report-range">Período: {report.inicio} a {report.fim}</p>
        <StatGrid>
          <Stat label="Capital investido (carteira)" value={kz(report.carteira.capital)} />
          <Stat label="Valor atual da carteira" value={kz(report.carteira.atual)} />
          <Stat label="Ganho/perda não realizado" value={kz(report.carteira.ganhoNaoRealizado)} tone={tone(report.carteira.ganhoNaoRealizado)} />
          <Stat label="Aplicado no período" value={kz(report.investidoPeriodo)} />
          <Stat label="Rendimentos recebidos" value={kz(report.rendimentos)} />
          <Stat label="Gastos no período" value={kz(report.gastos)} />
        </StatGrid>
        <CategoryBreakdown categories={report.categorias} />
        <small>Capital investido não é lucro. Valores antes de comissões e impostos.</small>
      </>}
    </div>
  );
}
