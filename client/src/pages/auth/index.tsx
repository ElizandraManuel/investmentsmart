import { useState } from 'react';
import type { FormEvent } from 'react';
import './style.css';
import useForm from '../../hooks/useForm';
import { api } from '../../services/api';
import { run } from '../../utils/run';
import type { AuthResponse } from '../../types';

export default function Auth({ onLogin }: { onLogin: (r: AuthResponse) => void }) {
  const [registo, setRegisto] = useState(false);
  const { f, set } = useForm({ nome: '', email: '', palavra_passe: '' });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => onLogin(await api<AuthResponse>(registo ? '/registo' : '/login', { method: 'POST', body: f })));
  };
  return (
    <div className="auth-page">
      <form onSubmit={submit} className="card">
        <h1>InvestSmart</h1>
        <p className="muted">Todos os seus investimentos e gastos num só lugar.</p>
        {registo && <input placeholder="Nome" value={f.nome} onChange={set('nome')} required />}
        <input type="email" placeholder="E-mail" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Palavra-passe (mínimo 8 caracteres)" minLength={8} value={f.palavra_passe} onChange={set('palavra_passe')} required />
        <button className="pri">{registo ? 'Criar conta' : 'Iniciar sessão'}</button>
        <a onClick={() => setRegisto(!registo)}>{registo ? 'Já tenho conta' : 'Criar uma conta'}</a>
      </form>
    </div>
  );
}
