const B = import.meta.env.VITE_API || 'http://localhost:4000/api';
export async function api(path, { method = 'GET', body, form } = {}) {
  const h = {}, t = localStorage.getItem('t');
  if (t) h.Authorization = 'Bearer ' + t;
  if (body) h['Content-Type'] = 'application/json';
  const r = await fetch(B + path, { method, headers: h, body: form || (body && JSON.stringify(body)) });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && t) { localStorage.clear(); location.reload(); }
  if (!r.ok) throw new Error(d.erro || 'Erro inesperado');
  return d;
}
export const kz = n => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(n || 0);
