export type InvestmentType = 'acao' | 'imovel' | 'fundo' | 'outro';
export type Period = 'semanal' | 'mensal';

export interface User { id_utilizador: number; nome: string; email: string }
export interface AuthResponse { token: string; utilizador: User }

export interface Investment {
  id_investimento: number; tipo: InvestmentType; nome: string; valor_investido: number;
  data_aquisicao: string; estado: string; detalhes: { info?: string }; valor_atual: number;
}
export interface Expense { id_despesa: number; descricao: string; categoria: string; data_despesa: string; valor: number }
export interface EvolutionPoint { data: string; valor: number }
export interface Recommendation { categoria: string; descricao: string; fundamento: string }
export interface CategoryTotal { categoria: string; total: number }
export interface Report {
  tipo: Period; inicio: string; fim: string; investidoPeriodo: number; rendimentos: number; gastos: number;
  categorias: CategoryTotal[]; carteira: { capital: number; atual: number; ganhoNaoRealizado: number };
}
export interface DocumentItem { id_documento: number; nome_ficheiro: string; estado_processamento: string; data_importacao: string }
export interface UploadedDocument extends DocumentItem { texto_extraido: string }
export interface Suggestion { valor: number | null; data: string | null; descricao: string }
export interface UploadResponse { documento: UploadedDocument; sugestao: Suggestion }
export interface HistoryItem { origem: string; tipo: string; data: string; descricao: string; valor: number }
