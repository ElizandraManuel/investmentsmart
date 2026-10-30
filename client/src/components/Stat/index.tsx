import './style.css';

interface Props { label: string; value: string; tone?: 'pos' | 'neg' }

export default function Stat({ label, value, tone }: Props) {
  return <div className="stat"><span>{label}</span><b className={tone}>{value}</b></div>;
}
