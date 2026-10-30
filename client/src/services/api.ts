const BASE: string = import.meta.env.VITE_API || 'http://localhost:4000/api';

interface Options { method?: string; body?: unknown; form?: FormData }

export async function api<T>(path: string, { method = 'GET', body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('t');
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) { localStorage.clear(); location.reload(); }
  if (!res.ok) throw new Error((data as { erro?: string }).erro || 'Erro inesperado');
  return data as T;
}
