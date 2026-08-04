/**
 * ==========================================
 * DOMÍNIO FINANCEIRO (ENTIDADES)
 * ==========================================
 */

/** Tipos de transação financeira aceitos no sistema */
export type TipoTransacao = "receita" | "despesa";

/** Métodos de pagamento aceitos */
export type MetodoPagamento = "Pix" | "Crédito" | "Débito" | "Boleto";

/** Interface do Lançamento Financeiro */
export interface Lancamento {
  id: string;
  icone: string;
  descricao: string;
  categoria: string;
  data: string; // Formato ISO "YYYY-MM-DD"
  metodo: MetodoPagamento;
  valor: number;
  tipo: TipoTransacao;
}

/** Tipo para cadastro de novos lançamentos (sem ID, gerado pelo backend/UUID) */
export type CriarLancamentoInput = Omit<Lancamento, "id">;

/** Entidade de Categoria */
export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
}

/** Resumo dos cards do Dashboard */
export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldoTotal: number;
}

/**
 * ==========================================
 * INTERFACE E NAVEGAÇÃO (UI)
 * ==========================================
 */

/** Páginas da aplicação para controle de rotas/navegação */
export type PaginaAtiva = "dashboard" | "lançamentos" | "categoria";

/** Alternador de temas */
export type Tema = "light" | "dark";

export interface ItemCampo {
  id: string;
  rotulo: string;
  valor: string;
}

export interface LancamentoHistorico {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  pagamento: string;
  tipo: "receita" | "fixo" | "variavel";
  valor: number;
}

export type TipoModal =
  | "receitas"
  | "gastos-fixos"
  | "variaveis"
  | "historico"
  | null;
