// src/components/Dashboard/DespesasPorCategoria.tsx
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CORES_GRAFICO } from "../../utils/chartTema";
import type { Categoria, Lancamento } from "../../types/financeiro";

interface DespesasPorCategoriaProps {
  lancamentosDoMes: Lancamento[];
  categorias: Categoria[];
}

export default function DespesasPorCategoria({
  lancamentosDoMes,
  categorias,
}: DespesasPorCategoriaProps) {
  const despesasPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();

    lancamentosDoMes
      .filter((l) => l.tipo === "despesa")
      .forEach((l) => {
        mapa.set(l.categoriaId, (mapa.get(l.categoriaId) ?? 0) + l.valor);
      });

    const total = Array.from(mapa.values()).reduce((acc, v) => acc + v, 0);

    return Array.from(mapa.entries())
      .map(([categoriaId, valor]) => {
        const categoria = categorias.find((c) => c.id === categoriaId);
        return {
          categoriaId,
          nome: categoria?.nome ?? "Sem categoria",
          icone: categoria?.icone ?? "🏷️",
          cor: categoria?.cor ?? "#64748B",
          valor,
          percentual: total > 0 ? (valor / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [lancamentosDoMes, categorias]);

  const totalDespesas = despesasPorCategoria.reduce(
    (acc, c) => acc + c.valor,
    0,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
      <h2 className="text-sm font-extrabold text-slate-800 mb-4">
        Despesas por categoria
      </h2>

      {despesasPorCategoria.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-slate-400 font-medium">
          Nenhuma despesa neste mês.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {despesasPorCategoria.map((c) => (
                    <Cell key={c.categoriaId} fill={c.cor} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(valor) => [
                    `R$ ${Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: CORES_GRAFICO.tooltipBorda,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 w-full min-w-0 flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-gutter-stable">
            {despesasPorCategoria.map((c) => (
              <div key={c.categoriaId} className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: `${c.cor}1A` }}
                >
                  {c.icone}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {c.nome}
                    </span>
                    <span className="text-xs font-black text-slate-800 shrink-0">
                      R${" "}
                      {c.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.percentual}%`,
                          backgroundColor: c.cor,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 w-8 text-right">
                      {Math.round(c.percentual)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalDespesas > 0 && (
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">Total de despesas</span>
          <span className="font-black text-brand">
            R${" "}
            {totalDespesas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
