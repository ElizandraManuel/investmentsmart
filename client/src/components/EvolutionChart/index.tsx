import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './style.css';
import { kz } from '../../utils/format';
import type { EvolutionPoint } from '../../types';

export default function EvolutionChart({ data }: { data: EvolutionPoint[] | null }) {
  return (
    <section className="card">
      <h3>Evolução patrimonial</h3>
      {data?.length ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="data" />
            <YAxis width={90} tickFormatter={(v: number) => v.toLocaleString('pt-AO')} />
            <Tooltip formatter={(v) => kz(Number(v))} />
            <Line dataKey="valor" stroke="#0f6b5c" strokeWidth={2.5} dot={data.length < 30} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="muted chart-empty">Registe um investimento para começar a acompanhar a evolução.</p>}
    </section>
  );
}
