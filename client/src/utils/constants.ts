import type { InvestmentType } from '../types';

export const CATEGORIAS = ['Alimentação', 'Transporte', 'Habitação', 'Saúde', 'Comissões', 'Lazer', 'Outros'];
// [nome apresentado, rótulo do campo de detalhe]
export const TIPOS: Record<InvestmentType, [string, string]> = {
  acao: ['Ação', 'Símbolo'], imovel: ['Imóvel', 'Localização'], fundo: ['Fundo', 'Entidade gestora'], outro: ['Outro', 'Notas'],
};
