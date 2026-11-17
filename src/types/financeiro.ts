export type TipoTransacao = "receita" | "despesa";
export type TipoGasto = "fixo" | "variavel";

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoTransacao;
  icone?: string;
  cor: string; // Hex, ex: "#8B0000" — usada em badges, gráficos e swatches
  ativa: boolean; // Categorias inativas somem dos seletores, mas mantêm o histórico
  ordem: number; // Define a posição nos seletores e nas listagens
  orcamentoMensal?: number; // Meta/limite de gasto mensal, opcional
  padrao?: boolean; // Categoria do sistema (ex: "Outros") — não pode ser excluída
}

// Campos aceitos ao criar uma categoria — o que não for informado recebe um
// valor padrão sensato dentro do FinanceContext (cor, ícone, ordem, etc.)
export type NovaCategoriaInput = Pick<Categoria, "nome" | "tipo"> &
  Partial<Pick<Categoria, "icone" | "cor" | "orcamentoMensal" | "ativa">>;

export interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  data: string; // Ex: "05/08/2026" ou "2026-08-05"
  tipo: TipoTransacao;
  tipoGasto?: TipoGasto; // Fixo ou Variável
  categoriaId: string;
  formaPagamento: "Pix" | "Débito" | "Crédito" | "Dinheiro" | "Boleto";
  observacao?: string;
  // Presente quando o lançamento é uma parcela de uma compra parcelada —
  // liga todas as parcelas da mesma compra pelo mesmo grupoId.
  parcela?: {
    grupoId: string;
    numero: number; // parcela atual (1-based)
    total: number; // total de parcelas da compra
  };
  // Presente quando o lançamento é uma ocorrência mensal de uma despesa
  // fixa recorrente — aponta para o id da SerieFixa que o gerou.
  recorrenciaFixaId?: string;
  // Conta/cartão de onde o dinheiro saiu (ou onde entrou, se receita)
  contaId?: string;
}

// "Molde" de uma despesa fixa recorrente (ex: Aluguel, Internet). A partir
// dela o FinanceContext materializa um Lancamento por mês, todo mês, até
// a pessoa encerrar a recorrência manualmente.
export interface SerieFixa {
  id: string;
  descricao: string;
  valor: number;
  categoriaId: string;
  formaPagamento: Lancamento["formaPagamento"];
  observacao?: string;
  diaDoMes: number; // dia do mês em que o lançamento é gerado
  mesInicio: string; // competência "yyyy-mm" da primeira ocorrência
  mesFim: string | null; // competência "yyyy-mm" da última ocorrência; null = sem fim (continua indefinidamente)
  mesesExcluidos: string[]; // competências "yyyy-mm" removidas manualmente (a recorrência continua nos demais meses)
  contaId?: string; // conta/cartão em que a despesa fixa é paga
}

// Totais agregados de um conjunto de lançamentos — usados nos Cards de
// Resumo (Lançamentos e Dashboard) e nos indicadores financeiros.
export interface TotaisFinanceiros {
  receitas: number;
  gastosFixos: number;
  gastosVariaveis: number;
  saldoAtual: number;
}

// Meta financeira (ex: reserva de emergência, viagem).
export interface Meta {
  id: string;
  nome: string;
  valorObjetivo: number;
  valorAcumulado: number;
  cor: string; // Hex — mesma lógica visual das categorias
  icone: string;
}

// Campos aceitos ao criar uma meta — cor/ícone recebem um valor padrão
// dentro do FinanceContext quando não informados.
export type NovaMetaInput = Pick<Meta, "nome" | "valorObjetivo"> &
  Partial<Pick<Meta, "valorAcumulado" | "cor" | "icone">>;

// Conta ou cartão onde o dinheiro entra/sai. Nenhum dado sensível do
// cartão é guardado — só o necessário para organizar e calcular a fatura.
export type TipoConta =
  | "cartao_credito"
  | "conta_corrente"
  | "carteira_digital"
  | "dinheiro";

export interface Conta {
  id: string;
  nome: string; // apelido, ex: "Nubank", "Inter Black"
  tipo: TipoConta;
  cor: string; // Hex
  ativa: boolean; // inativas somem dos seletores, mas mantêm o histórico
  ordem: number;
  // Só para cartão de crédito:
  ultimosDigitos?: string; // opcional, 4 dígitos, só para diferenciar cartões
  diaFechamento?: number; // dia em que a fatura fecha (1–31)
  diaVencimento?: number; // dia em que a fatura vence (1–31)
  limite?: number;
}

export type NovaContaInput = Omit<Conta, "id" | "ordem" | "ativa"> &
  Partial<Pick<Conta, "ativa">>;
