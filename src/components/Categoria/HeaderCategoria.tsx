// src/components/Categoria/HeaderCategoria.tsx
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { OpcaoMes } from "../../types";

export interface HeaderCategoriaProps {
  mesSelecionado: string;
  onAlterarMes: (novoMes: string) => void;
  onMesAnterior: () => void;
  onProximoMes: () => void;
  opcoesMeses: OpcaoMes[];
  onNovaCategoria: () => void; // Evento para abrir o modal de nova categoria
}

export default function HeaderCategoria({
  mesSelecionado,
  onAlterarMes,
  onMesAnterior,
  onProximoMes,
  opcoesMeses,
  onNovaCategoria,
}: HeaderCategoriaProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Título e Subtítulo — mesma tipografia usada em Lançamentos/Dashboard */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Categorias
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Acompanhe o impacto financeiro e o limite de gastos por categoria.
        </p>
      </div>

      {/* Controles do Lado Direito (Seletor de Mês + Botão Nova Categoria) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Seletor de Mês — mesmo padrão visual das outras telas */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mês anterior"
            title="Mês anterior"
            className="p-1 text-slate-400 hover:text-brand rounded-md hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <select
            id="seletor-mes-categoria"
            value={mesSelecionado}
            onChange={(e) => onAlterarMes(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-bold"
          >
            {opcoesMeses.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onProximoMes}
            aria-label="Próximo mês"
            title="Próximo mês"
            className="p-1 text-slate-400 hover:text-brand rounded-md hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Botão de Ação Primária (+ Nova Categoria) */}
        <button
          type="button"
          onClick={onNovaCategoria}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Nova Categoria</span>
        </button>
      </div>
    </div>
  );
}
