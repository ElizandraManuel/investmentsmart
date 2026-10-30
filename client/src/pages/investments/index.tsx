import './style.css';
import useLoad from '../../hooks/useLoad';
import InvestmentForm from '../../components/InvestmentForm';
import InvestmentTable from '../../components/InvestmentTable';
import type { Investment } from '../../types';

export default function Investments() {
  const [investments, reload] = useLoad<Investment[]>('/investimentos');
  return (
    <div className="investments-page">
      <h2>Investimentos</h2>
      <InvestmentForm onCreated={reload} />
      <InvestmentTable investments={investments} onChanged={reload} />
    </div>
  );
}
