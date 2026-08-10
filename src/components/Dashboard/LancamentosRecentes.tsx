// src/components/Dashboard/LancamentosRecentes.tsx
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { paraObjetoData } from "../../utils/dataUtils";
import type { Categoria, Lancamento } from "../../types/financeiro";

interface LancamentosRecentesProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  onVerTodos: () => void;
}

const QUANTIDADE_EXIBIDA = 5;

export default function LancamentosRecentes({
  lancamentos,
  categorias,
  onVerTodos,
}: LancamentosRecentesProps) {
  const recentes = useMemo(() => {
    return [...lancamentos]
      .sort((a, b) => {
        const dataA = paraObjetoData(a.data)?.getTime() ?? 0;
        const dataB = paraObjetoData(b.data)?.getTime() ?? 0;
        return dataB - dataA;
      })
      .slice(0, QUANTIDADE_EXIBIDA);
  }, [lancamentos]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4">
        <h2 className="text-sm font-extrabold text-slate-800">
          Últimos lançamentos
        </h2>
        <button
          onClick={onVerTodos}
          className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-hover cursor-pointer
                     -m-2 min-h-11 p-2 sm:m-0 sm:min-h-0 sm:p-0"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

      {recentes.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-slate-400 font-medium">
          Nenhum lançamento cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-150">
            <thead className="border-t border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-2 font-extrabold">Data</th>
                <th className="px-3 py-2 font-extrabold">Descrição</th>
                <th className="px-3 py-2 font-extrabold">Categoria</th>
                <th className="px-3 py-2 font-extrabold">Tipo</th>
                <th className="px-3 py-2 font-extrabold">Valor</th>
                <th className="px-5 py-2 font-extrabold">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {recentes.map((item) => {
                const categoria = categorias.find(
                  (c) => c.id === item.categoriaId,
                );
                const isReceita = item.tipo === "receita";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 text-slate-500 font-bold whitespace-nowrap">
                      {item.data}
                    </td>
                    <td
                      className="px-3 py-2.5 font-bold text-slate-800 truncate max-w-32 sm:max-w-40 md:max-w-56"
                      title={item.descricao}
                    >
                      {item.descricao}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[11px]">
                          {categoria?.icone ?? "🏷️"}
                        </span>
                        {categoria?.nome ?? "Geral"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                      <span
                        className={
                          isReceita ? "text-emerald-600" : "text-brand"
                        }
                      >
                        {isReceita
                          ? "Receita"
                          : item.tipoGasto === "fixo"
                            ? "Despesa Fixa"
                            : "Despesa Variável"}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2.5 font-black whitespace-nowrap ${
                        isReceita ? "text-emerald-600" : "text-brand"
                      }`}
                    >
                      R$ {item.valor.toFixed(2)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500 whitespace-nowrap">
                      {item.formaPagamento}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
