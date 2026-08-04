// src/utils/financeiroUtils.ts
import type { Categoria, ItemCampo, TipoCategoria } from "../types";

export function mapearLancamentosDoMes(
  categorias: Categoria[],
  lancamentosSalvos: ItemCampo[],
  tipo: TipoCategoria,
): ItemCampo[] {
  return categorias
    .filter((cat) => cat.tipo === tipo)
    .map((cat) => {
      const lancamentoExistente = lancamentosSalvos.find(
        (item) => item.categoriaId === cat.id,
      );

      return {
        categoriaId: cat.id,
        rotulo: cat.nome,
        valor: lancamentoExistente ? lancamentoExistente.valor : "",
      };
    });
}
