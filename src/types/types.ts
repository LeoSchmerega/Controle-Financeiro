export type tipoTransacao = "receita" | "despesa";
export type metodoPagamento = "Pix" | "Crédito" | "Débito" | "Boleto";

export interface lancamento {
  id: string;
  icone: string;
  descricao: string;
  categoria: string;
  data: string;
  metodo: metodoPagamento;
  valor: number;
  tipo: tipoTransacao;
}
