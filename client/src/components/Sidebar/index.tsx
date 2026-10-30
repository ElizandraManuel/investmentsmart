import './style.css';

interface Props {
  items: string[]; active: number; userName: string;
  onSelect: (index: number) => void; onLogout: () => void;
}

export default function Sidebar({ items, active, userName, onSelect, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <h1>InvestSmart</h1>
      <nav>
        {items.map((name, i) => (
          <button key={name} className={i === active ? 'on' : ''} onClick={() => onSelect(i)}>{name}</button>
        ))}
      </nav>
      <div className="sidebar-user">{userName}<button onClick={onLogout}>Terminar sessão</button></div>
    </aside>
  );
}
