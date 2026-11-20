// src/components/Lancamentos/TabelaLancamentos.tsx
import { Edit2, Trash2, Repeat } from "lucide-react";
import type { Categoria, Lancamento } from "../../types/financeiro";
import { useFinance } from "../../context/FinanceContext";
import { ROTULOS_CARTEIRA } from "../../utils/contaUtils";

interface TabelaLancamentosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
  busca: string;
  // Decide sozinho como excluir: direto, se for um lançamento avulso, ou
  // via confirmação, se fizer parte de uma despesa fixa recorrente.
  onSolicitarExclusao: (lancamento: Lancamento) => void;
  onEditar: (lancamento: Lancamento) => void;
}

export default function TabelaLancamentos({
  lancamentos,
  categorias,
  busca,
  onSolicitarExclusao,
  onEditar,
}: TabelaLancamentosProps) {
  const { contas } = useFinance();

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
              <th className="p-4">Pagamento</th>
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
                      <span className="inline-flex items-center gap-1.5">
                        {item.descricao}
                        {item.recorrenciaFixaId && (
                          <span
                            title="Despesa fixa recorrente"
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-50 text-brand shrink-0"
                          >
                            <Repeat className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {item.parcela && (
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {item.parcela.numero}/{item.parcela.total}
                          </span>
                        )}
                      </span>
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
                      {/* Conta/cartão vinculado, com a cor dele */}
                      {(() => {
                        const conta = contas.find((c) => c.id === item.contaId);
                        return conta ? (
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: conta.cor }}
                              aria-hidden="true"
                            />
                            {conta.nome}
                            {item.carteira && ` · ${ROTULOS_CARTEIRA[item.carteira]}`}
                          </span>
                        ) : null;
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(item)}
                          aria-label={`Editar ${item.descricao}`}
                          className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Edit2 className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSolicitarExclusao(item)}
                          aria-label={`Excluir ${item.descricao}`}
                          className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Trash2 className="w-6 h-6" />
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
