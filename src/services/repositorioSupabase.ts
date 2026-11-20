// src/services/repositorioSupabase.ts
// Implementação do repositório usando as tabelas do Supabase (migration
// 003). Converte os objetos do app (camelCase) em linhas do banco
// (snake_case) e vice-versa, e grava só o que mudou: upsert dos itens
// novos/alterados e delete dos removidos.
import { supabase } from "../lib/supabase";
import { dataParaBR, dataParaISO } from "../utils/dataUtils";
import type {
  Categoria,
  Conta,
  Lancamento,
  Meta,
  SerieFixa,
} from "../types/financeiro";
import { calcularDiferencas } from "./repositorio";
import type {
  Colecao,
  DadosFinanceiros,
  RepositorioFinanceiro,
} from "./repositorio";

type Linha = Record<string, unknown>;

interface Mapeador<T> {
  tabela: string;
  paraLinha: (item: T) => Linha;
  deLinha: (linha: Linha) => T;
}

// null do banco → campo ausente no app (e vice-versa), para manter os
// objetos iguais aos que o app sempre usou.
const opcional = <T>(valor: unknown): T | undefined =>
  valor === null || valor === undefined ? undefined : (valor as T);
const numeroOpcional = (valor: unknown): number | undefined =>
  valor === null || valor === undefined ? undefined : Number(valor);

const mapContas: Mapeador<Conta> = {
  tabela: "contas",
  paraLinha: (c) => ({
    id: c.id,
    nome: c.nome,
    tipo: c.tipo,
    cor: c.cor,
    ativa: c.ativa,
    ordem: c.ordem,
    ultimos_digitos: c.ultimosDigitos ?? null,
    dia_fechamento: c.diaFechamento ?? null,
    dia_vencimento: c.diaVencimento ?? null,
    limite: c.limite ?? null,
    carteiras: c.carteiras ?? null,
  }),
  deLinha: (l) => ({
    id: l.id as string,
    nome: l.nome as string,
    tipo: l.tipo as Conta["tipo"],
    cor: l.cor as string,
    ativa: l.ativa as boolean,
    ordem: Number(l.ordem),
    ultimosDigitos: opcional(l.ultimos_digitos),
    diaFechamento: numeroOpcional(l.dia_fechamento),
    diaVencimento: numeroOpcional(l.dia_vencimento),
    limite: numeroOpcional(l.limite),
    carteiras: opcional(l.carteiras),
  }),
};

const mapCategorias: Mapeador<Categoria> = {
  tabela: "categorias",
  paraLinha: (c) => ({
    id: c.id,
    nome: c.nome,
    tipo: c.tipo,
    icone: c.icone ?? null,
    cor: c.cor,
    ativa: c.ativa,
    ordem: c.ordem,
    orcamento_mensal: c.orcamentoMensal ?? null,
    padrao: c.padrao ?? false,
  }),
  deLinha: (l) => ({
    id: l.id as string,
    nome: l.nome as string,
    tipo: l.tipo as Categoria["tipo"],
    icone: opcional(l.icone),
    cor: l.cor as string,
    ativa: l.ativa as boolean,
    ordem: Number(l.ordem),
    orcamentoMensal: numeroOpcional(l.orcamento_mensal),
    padrao: (l.padrao as boolean) || undefined,
  }),
};

const mapLancamentos: Mapeador<Lancamento> = {
  tabela: "lancamentos",
  paraLinha: (x) => ({
    id: x.id,
    descricao: x.descricao,
    valor: x.valor,
    data: dataParaISO(x.data), // banco usa date (yyyy-mm-dd)
    tipo: x.tipo,
    tipo_gasto: x.tipoGasto ?? null,
    categoria_id: x.categoriaId,
    conta_id: x.contaId ?? null,
    forma_pagamento: x.formaPagamento,
    observacao: x.observacao ?? null,
    parcela_grupo_id: x.parcela?.grupoId ?? null,
    parcela_numero: x.parcela?.numero ?? null,
    parcela_total: x.parcela?.total ?? null,
    recorrencia_fixa_id: x.recorrenciaFixaId ?? null,
    carteira: x.carteira ?? null,
  }),
  deLinha: (l) => ({
    id: l.id as string,
    descricao: l.descricao as string,
    valor: Number(l.valor),
    data: dataParaBR(l.data as string), // app usa dd/mm/yyyy
    tipo: l.tipo as Lancamento["tipo"],
    tipoGasto: opcional(l.tipo_gasto),
    categoriaId: l.categoria_id as string,
    contaId: opcional(l.conta_id),
    formaPagamento: l.forma_pagamento as Lancamento["formaPagamento"],
    observacao: opcional(l.observacao),
    parcela: l.parcela_grupo_id
      ? {
          grupoId: l.parcela_grupo_id as string,
          numero: Number(l.parcela_numero),
          total: Number(l.parcela_total),
        }
      : undefined,
    recorrenciaFixaId: opcional(l.recorrencia_fixa_id),
    carteira: opcional(l.carteira),
  }),
};

const mapSeriesFixas: Mapeador<SerieFixa> = {
  tabela: "series_fixas",
  paraLinha: (s) => ({
    id: s.id,
    descricao: s.descricao,
    valor: s.valor,
    categoria_id: s.categoriaId,
    conta_id: s.contaId ?? null,
    forma_pagamento: s.formaPagamento,
    observacao: s.observacao ?? null,
    dia_do_mes: s.diaDoMes,
    mes_inicio: s.mesInicio,
    mes_fim: s.mesFim,
    meses_excluidos: s.mesesExcluidos,
    carteira: s.carteira ?? null,
  }),
  deLinha: (l) => ({
    id: l.id as string,
    descricao: l.descricao as string,
    valor: Number(l.valor),
    categoriaId: l.categoria_id as string,
    contaId: opcional(l.conta_id),
    formaPagamento: l.forma_pagamento as SerieFixa["formaPagamento"],
    observacao: opcional(l.observacao),
    diaDoMes: Number(l.dia_do_mes),
    mesInicio: l.mes_inicio as string,
    mesFim: (l.mes_fim as string | null) ?? null,
    mesesExcluidos: (l.meses_excluidos as string[] | null) ?? [],
    carteira: opcional(l.carteira),
  }),
};

const mapMetas: Mapeador<Meta> = {
  tabela: "metas",
  paraLinha: (m) => ({
    id: m.id,
    nome: m.nome,
    valor_objetivo: m.valorObjetivo,
    valor_acumulado: m.valorAcumulado,
    cor: m.cor,
    icone: m.icone,
  }),
  deLinha: (l) => ({
    id: l.id as string,
    nome: l.nome as string,
    valorObjetivo: Number(l.valor_objetivo),
    valorAcumulado: Number(l.valor_acumulado),
    cor: l.cor as string,
    icone: l.icone as string,
  }),
};

const MAPEADORES: { [K in Colecao]: Mapeador<DadosFinanceiros[K][number]> } = {
  contas: mapContas,
  categorias: mapCategorias,
  lancamentos: mapLancamentos,
  seriesFixas: mapSeriesFixas,
  metas: mapMetas,
};

// Tamanho dos lotes: o Supabase devolve no máximo 1000 linhas por consulta,
// e listas de ids muito grandes estouram o tamanho da URL no delete.
const PAGINA_LEITURA = 1000;
const LOTE_UPSERT = 500;
const LOTE_DELETE = 100;

function dividirEmLotes<T>(itens: T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    lotes.push(itens.slice(i, i + tamanho));
  }
  return lotes;
}

function erroDoBanco(tabela: string, erro: { code?: string; message: string }) {
  if (erro.code === "PGRST205" || erro.code === "42P01") {
    return new Error(
      `A tabela "${tabela}" não existe no Supabase. Rode supabase/migrations/003_dados_financeiros.sql no SQL Editor.`,
    );
  }
  return new Error(`Erro em "${tabela}": ${erro.message}`);
}

// Lê a tabela inteira do usuário, página por página
async function lerTabela<T>(mapeador: Mapeador<T>, userId: string): Promise<T[]> {
  const itens: T[] = [];
  for (let inicio = 0; ; inicio += PAGINA_LEITURA) {
    const { data, error } = await supabase
      .from(mapeador.tabela)
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .range(inicio, inicio + PAGINA_LEITURA - 1);
    if (error) throw erroDoBanco(mapeador.tabela, error);
    itens.push(...(data as Linha[]).map(mapeador.deLinha));
    if (data.length < PAGINA_LEITURA) return itens;
  }
}

export function criarRepositorioSupabase(userId: string): RepositorioFinanceiro {
  return {
    async carregar() {
      const [contas, categorias, lancamentos, seriesFixas, metas] =
        await Promise.all([
          lerTabela(mapContas, userId),
          lerTabela(mapCategorias, userId),
          lerTabela(mapLancamentos, userId),
          lerTabela(mapSeriesFixas, userId),
          lerTabela(mapMetas, userId),
        ]);
      return { contas, categorias, lancamentos, seriesFixas, metas };
    },

    async sincronizar(colecao, anterior, atual) {
      // (cast: o TS não consegue relacionar a coleção genérica ao mapeador certo)
      const mapeador = MAPEADORES[colecao] as unknown as Mapeador<{ id: string }>;
      const { salvar, removerIds } = calcularDiferencas(
        anterior as { id: string }[],
        atual as { id: string }[],
      );

      for (const lote of dividirEmLotes(salvar, LOTE_UPSERT)) {
        const linhas = lote.map((item) => ({
          ...mapeador.paraLinha(item),
          user_id: userId,
        }));
        const { error } = await supabase
          .from(mapeador.tabela)
          .upsert(linhas, { onConflict: "user_id,id" });
        if (error) throw erroDoBanco(mapeador.tabela, error);
      }

      for (const lote of dividirEmLotes(removerIds, LOTE_DELETE)) {
        const { error } = await supabase
          .from(mapeador.tabela)
          .delete()
          .eq("user_id", userId)
          .in("id", lote);
        if (error) throw erroDoBanco(mapeador.tabela, error);
      }
    },
  };
}
