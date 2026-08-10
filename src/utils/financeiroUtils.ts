// src/utils/financeiroUtils.ts
import type { Categoria, ItemCampo, TipoCategoria } from "../types/index";
import type { Lancamento, TotaisFinanceiros } from "../types/financeiro";

// Soma receitas, gastos fixos e gastos variáveis de um conjunto de
// lançamentos e calcula o saldo — função única usada pelo FinanceContext,
// pela tela de Lançamentos e pela Dashboard, para nunca haver dois lugares
// calculando o mesmo total de formas diferentes.
export function calcularTotaisLancamentos(
  lancamentos: Lancamento[],
): TotaisFinanceiros {
  let receitas = 0;
  let gastosFixos = 0;
  let gastosVariaveis = 0;

  lancamentos.forEach((item) => {
    if (item.tipo === "receita") {
      receitas += item.valor;
    } else if (item.tipoGasto === "fixo") {
      gastosFixos += item.valor;
    } else {
      gastosVariaveis += item.valor;
    }
  });

  return {
    receitas,
    gastosFixos,
    gastosVariaveis,
    saldoAtual: receitas - (gastosFixos + gastosVariaveis),
  };
}

export function mapearLancamentosDoMes(
  categorias: Categoria[],
  lancamentosSalvos: ItemCampo[] | undefined,
  tipo: TipoCategoria,
): ItemCampo[] {
  // Se o mês já tem um registro salvo (mesmo que vazio, mesmo que editado/excluído),
  // respeita exatamente o que está salvo. Não reconstrói a partir das categorias.
  if (lancamentosSalvos !== undefined) {
    return lancamentosSalvos;
  }

  // Só usa as categorias como valores padrão quando o mês NUNCA foi salvo antes.
  return categorias
    .filter((cat) => cat.tipo === tipo)
    .map((cat) => ({
      categoriaId: cat.id,
      rotulo: cat.nome,
      valor: "",
    }));
}
