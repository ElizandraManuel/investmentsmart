import './style.css';
import { kz, tone } from '../../utils/format';

interface Props { capital: number; atual: number; ganho: number }

export default function PortfolioHero({ capital, atual, ganho }: Props) {
  return (
    <div className="hero">
      <span>Valor atual da carteira</span>
      <b>{kz(atual)}</b>
      <em className={tone(ganho)}>{ganho >= 0 ? '+' : ''}{kz(ganho)} não realizado, sobre {kz(capital)} investidos</em>
    </div>
  );
}
