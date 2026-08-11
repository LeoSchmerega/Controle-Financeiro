// src/components/Lancamentos/TabelaLancamentos.tsx
import { Edit2, Trash2 } from "lucide-react";
import type { Categoria, Lancamento } from "../../types/financeiro";

interface TabelaLancamentosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  busca: string;
  onRemover: (id: string) => void;
  onEditar: (lancamento: Lancamento) => void;
}

export default function TabelaLancamentos({
  lancamentos,
  categorias,
  busca,
  onRemover,
  onEditar,
}: TabelaLancamentosProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* Container para scroll horizontal no mobile */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs min-w-200">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Forma Pagamento</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {lancamentos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Nenhum lançamento encontrado para "{busca}".
                </td>
              </tr>
            ) : (
              lancamentos.map((item) => {
                const cat = categorias.find((c) => c.id === item.categoriaId);
                const isReceita = item.tipo === "receita";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-slate-500 font-bold">
                      {item.data}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {item.descricao}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                          🏷️
                        </span>
                        {cat?.nome || "Geral"}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      <span
                        className={
                          isReceita ? "text-emerald-600" : "text-rose-600"
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
                      className={`p-4 font-black ${
                        isReceita ? "text-emerald-600" : "text-brand"
                      }`}
                    >
                      R$ {item.valor.toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-500">
                      {item.formaPagamento}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(item)}
                          aria-label={`Editar ${item.descricao}`}
                          className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Edit2 className="w-8 h-8" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemover(item.id)}
                          aria-label={`Excluir ${item.descricao}`}
                          className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Trash2 className="w-8 h-8" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé e Paginação */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span>
          Mostrando {lancamentos.length > 0 ? 1 : 0} até {lancamentos.length} de{" "}
          {lancamentos.length} lançamentos
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-current="page"
            aria-label="Página 1"
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center bg-brand text-white font-bold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
          >
            1
          </button>
        </div>
      </div>
    </div>
  );
}
