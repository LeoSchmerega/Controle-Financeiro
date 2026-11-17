// src/services/repositorio.ts
// Contrato da camada de dados. O FinanceContext só conversa com um
// RepositorioFinanceiro — não sabe se por trás está o localStorage ou o
// Supabase. Trocar de armazenamento = trocar a implementação, sem mexer
// na lógica das telas.
import type {
  Categoria,
  Conta,
  Lancamento,
  Meta,
  SerieFixa,
} from "../types/financeiro";

export interface DadosFinanceiros {
  categorias: Categoria[];
  lancamentos: Lancamento[];
  seriesFixas: SerieFixa[];
  metas: Meta[];
  contas: Conta[];
}

export type Colecao = keyof DadosFinanceiros;

export interface RepositorioFinanceiro {
  // Carrega todos os dados do usuário. Coleções nunca salvas voltam vazias
  // (o FinanceContext decide o que fazer, ex: semear categorias padrão).
  carregar(): Promise<DadosFinanceiros>;

  // Persiste a mudança de uma coleção, recebendo o estado anterior e o
  // atual. Cada implementação decide como gravar: o localStorage regrava a
  // lista inteira; o Supabase usa calcularDiferencas para mandar só o que mudou.
  sincronizar<K extends Colecao>(
    colecao: K,
    anterior: DadosFinanceiros[K],
    atual: DadosFinanceiros[K],
  ): Promise<void>;
}

export interface Diferencas<T> {
  salvar: T[]; // itens novos ou alterados (upsert)
  removerIds: string[]; // itens que existiam e sumiram (delete)
}

// Compara duas versões de uma lista. Como o estado React é imutável, um
// item alterado sempre vira um objeto novo — então comparar a referência
// basta para saber o que mudou, sem comparar campo a campo.
export function calcularDiferencas<T extends { id: string }>(
  anterior: T[],
  atual: T[],
): Diferencas<T> {
  const mapaAnterior = new Map(anterior.map((item) => [item.id, item]));
  const idsAtuais = new Set(atual.map((item) => item.id));

  return {
    salvar: atual.filter((item) => mapaAnterior.get(item.id) !== item),
    removerIds: anterior
      .filter((item) => !idsAtuais.has(item.id))
      .map((item) => item.id),
  };
}
