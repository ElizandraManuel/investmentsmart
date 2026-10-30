/** Executa uma ação assíncrona e mostra o erro (se houver) ao utilizador. */
export async function run(fn: () => Promise<void>): Promise<void> {
  try { await fn(); } catch (e) { alert(e instanceof Error ? e.message : 'Erro inesperado'); }
}
