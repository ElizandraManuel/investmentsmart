export const kz = (n?: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(n || 0);
export const today = () => new Date().toISOString().slice(0, 10);
export const tone = (n: number): 'pos' | 'neg' => (n < 0 ? 'neg' : 'pos');
