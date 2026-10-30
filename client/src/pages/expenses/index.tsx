import './style.css';
import useLoad from '../../hooks/useLoad';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseTable from '../../components/ExpenseTable';
import type { Expense } from '../../types';

export default function Expenses() {
  const [expenses, reload] = useLoad<Expense[]>('/despesas');
  return (
    <div className="expenses-page">
      <h2>Gastos</h2>
      <ExpenseForm onCreated={reload} />
      <ExpenseTable expenses={expenses} onChanged={reload} />
    </div>
  );
}
