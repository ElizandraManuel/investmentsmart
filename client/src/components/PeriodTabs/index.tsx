import './style.css';
import type { Period } from '../../types';

interface Props { value: Period; onChange: (p: Period) => void }
const OPTIONS: [Period, string][] = [['semanal', 'Semanal'], ['mensal', 'Mensal']];

export default function PeriodTabs({ value, onChange }: Props) {
  return (
    <div className="period-tabs">
      {OPTIONS.map(([key, label]) => (
        <button key={key} className={key === value ? 'on' : ''} onClick={() => onChange(key)}>{label}</button>
      ))}
    </div>
  );
}
