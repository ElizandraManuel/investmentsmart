import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

/** Carrega dados de um endpoint e devolve [dados, recarregar]. */
export default function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const load = useCallback(() => api<T>(path).then(setData).catch(e => alert(e.message)), [path]);
  useEffect(() => { load(); }, [load]);
  return [data, load] as const;
}
