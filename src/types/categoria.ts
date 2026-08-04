// src/types/categoria.ts

export type TipoCategoria = "RECEITAS" | "GASTOS_FIXOS" | "VARIAVEIS";

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  cor?: string;
  icone?: string;
  isPadrao?: boolean; // Ajuste para resolver o erro no categoriasPadrao e useCategorias
}

export type PaginaAtiva = "Dashboard" | "Lançamentos" | "Categorias";
export type Tema = "claro" | "escuro";
