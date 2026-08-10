// src/types/index.ts

export * from "./categoria";

export interface OpcaoMes {
  valor: string; // Formato "YYYY-MM"
  rotulo: string; // Ex: "Janeiro 2026"
}

export interface ItemCampo {
  categoriaId: string; // Padrão atualizado
  rotulo: string;
  valor: string;
}

export interface ModalLancamentoBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (total: number, campos: ItemCampo[]) => void;
  camposIniciais?: ItemCampo[];
  titulo: string;
  icone: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  camposPadrao: ItemCampo[];
  placeholderRotulo?: string;
  prefixoId: string;
  textoBotaoAdicionar?: string;
}

export interface RegistroMensal {
  receitas: ItemCampo[];
  gastosFixos: ItemCampo[];
  variaveis: ItemCampo[];
}

export type MapaFinanceiro = Record<string, RegistroMensal>;

// src/types/index.ts
export type NovoTipoCategoria = "despesa" | "receita";
