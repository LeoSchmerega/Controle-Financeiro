// src/utils/contaUtils.ts
// Regras de contas e cartões: rótulos, quais contas combinam com cada
// forma de pagamento, e o cálculo das faturas de cartão de crédito.
import type { Conta, Lancamento, TipoConta } from "../types/financeiro";
import { deslocarMesAno, mesAnoDeData, paraObjetoData } from "./dataUtils";

export const ROTULOS_TIPO_CONTA: Record<TipoConta, string> = {
  cartao_credito: "Cartão de crédito",
  conta_corrente: "Conta corrente",
  carteira_digital: "Carteira digital",
  dinheiro: "Dinheiro",
};

// Quais tipos de conta fazem sentido para cada forma de pagamento — usado
// para filtrar o seletor de conta no lançamento.
export function tiposDeContaParaForma(
  forma: Lancamento["formaPagamento"],
): TipoConta[] {
  switch (forma) {
    case "Crédito":
      return ["cartao_credito"];
    case "Dinheiro":
      return ["dinheiro"];
    default: // Pix, Débito, Boleto
      return ["conta_corrente", "carteira_digital"];
  }
}

const ultimoDiaDoMes = (ano: number, mes1a12: number) =>
  new Date(ano, mes1a12, 0).getDate();

// Data concreta de um "dia X" dentro de uma competência yyyy-mm. Se o dia
// não existe no mês (ex: 31 em fevereiro), usa o último dia.
function diaNaCompetencia(competencia: string, dia: number): Date {
  const [ano, mes] = competencia.split("-").map(Number);
  return new Date(ano, mes - 1, Math.min(dia, ultimoDiaDoMes(ano, mes)));
}

// A fatura é identificada pelo mês em que FECHA. Compras feitas no dia do
// fechamento ou depois já entram na fatura do mês seguinte (regra usada
// pela maioria dos bancos — o "melhor dia de compra" é o dia do fechamento).
export function competenciaDaFatura(data: string, diaFechamento: number): string {
  const d = paraObjetoData(data);
  if (!d) return "";
  const competencia = mesAnoDeData(data);
  const fechamento = diaNaCompetencia(competencia, diaFechamento);
  return d.getDate() >= fechamento.getDate()
    ? deslocarMesAno(competencia, 1)
    : competencia;
}

// Datas de fechamento e vencimento de uma fatura. O vencimento cai no mesmo
// mês do fechamento se o dia for depois dele; senão, no mês seguinte.
export function datasDaFatura(
  competencia: string,
  diaFechamento: number,
  diaVencimento: number,
): { fechamento: Date; vencimento: Date } {
  const fechamento = diaNaCompetencia(competencia, diaFechamento);
  const mesVencimento =
    diaVencimento > diaFechamento ? competencia : deslocarMesAno(competencia, 1);
  return { fechamento, vencimento: diaNaCompetencia(mesVencimento, diaVencimento) };
}

// Competência "yyyy-mm" de hoje no formato dd/mm/yyyy, para reaproveitar
// a mesma regra de competenciaDaFatura.
function hojeBR(): string {
  const h = new Date();
  return `${String(h.getDate()).padStart(2, "0")}/${String(h.getMonth() + 1).padStart(2, "0")}/${h.getFullYear()}`;
}

export const competenciaFaturaAberta = (diaFechamento: number) =>
  competenciaDaFatura(hojeBR(), diaFechamento);

// Despesas de um cartão que caem numa fatura específica
export function lancamentosDaFatura(
  cartao: Conta,
  lancamentos: Lancamento[],
  competencia: string,
): Lancamento[] {
  if (!cartao.diaFechamento) return [];
  return lancamentos.filter(
    (l) =>
      l.contaId === cartao.id &&
      l.tipo === "despesa" &&
      competenciaDaFatura(l.data, cartao.diaFechamento!) === competencia,
  );
}

export interface ResumoCartao {
  competenciaAberta: string;
  totalFaturaAberta: number;
  fechamento: Date;
  vencimento: Date;
  // Soma da fatura aberta + faturas futuras (parcelas já lançadas). Faturas
  // anteriores são consideradas pagas.
  limiteUsado: number;
  limiteDisponivel?: number;
}

export function resumoDoCartao(cartao: Conta, lancamentos: Lancamento[]): ResumoCartao | null {
  if (!cartao.diaFechamento || !cartao.diaVencimento) return null;
  const competenciaAberta = competenciaFaturaAberta(cartao.diaFechamento);
  let totalFaturaAberta = 0;
  let limiteUsado = 0;

  lancamentos.forEach((l) => {
    if (l.contaId !== cartao.id || l.tipo !== "despesa") return;
    const competencia = competenciaDaFatura(l.data, cartao.diaFechamento!);
    if (competencia === competenciaAberta) totalFaturaAberta += l.valor;
    if (competencia >= competenciaAberta) limiteUsado += l.valor;
  });

  const { fechamento, vencimento } = datasDaFatura(
    competenciaAberta,
    cartao.diaFechamento,
    cartao.diaVencimento,
  );

  return {
    competenciaAberta,
    totalFaturaAberta,
    fechamento,
    vencimento,
    limiteUsado,
    limiteDisponivel:
      cartao.limite !== undefined ? cartao.limite - limiteUsado : undefined,
  };
}

export const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatarDiaMes = (data: Date) =>
  `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
