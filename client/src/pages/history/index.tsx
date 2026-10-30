import './style.css';
import useLoad from '../../hooks/useLoad';
import HistoryTable from '../../components/HistoryTable';
import type { HistoryItem } from '../../types';

export default function History() {
  const [items] = useLoad<HistoryItem[]>('/historico');
  return (
    <div className="history-page">
      <h2>Histórico</h2>
      <HistoryTable items={items} />
    </div>
  );
}
