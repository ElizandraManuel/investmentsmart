import { useState } from 'react';
import './style.css';
import Sidebar from '../components/Sidebar';
import Auth from '../pages/auth';
import Dashboard from '../pages/dashboard';
import Investments from '../pages/investments';
import Expenses from '../pages/expenses';
import Documents from '../pages/documents';
import Reports from '../pages/reports';
import History from '../pages/history';
import type { AuthResponse, User } from '../types';

const PAGES = [
  { label: 'Painel', Page: Dashboard },
  { label: 'Investimentos', Page: Investments },
  { label: 'Gastos', Page: Expenses },
  { label: 'Documentos', Page: Documents },
  { label: 'Relatórios', Page: Reports },
  { label: 'Histórico', Page: History },
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('u') || 'null'));
  const [tab, setTab] = useState(0);

  if (!user) {
    return <Auth onLogin={(r: AuthResponse) => {
      localStorage.setItem('t', r.token); localStorage.setItem('u', JSON.stringify(r.utilizador)); setUser(r.utilizador);
    }} />;
  }
  const { Page } = PAGES[tab];
  return (
    <div className="app">
      <Sidebar items={PAGES.map(p => p.label)} active={tab} userName={user.nome} onSelect={setTab}
        onLogout={() => { localStorage.clear(); setUser(null); }} />
      <main><Page key={tab} /></main>
    </div>
  );
}
