// src/components/Dashboard/FluxoFinanceiro.tsx
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { deslocarMesAno, mesAnoDeData, formatarRotuloMesAno } from "../../utils/dataUtils";
import { CORES_GRAFICO } from "../../utils/chartTema";
import type { Lancamento } from "../../types/financeiro";

interface FluxoFinanceiroProps {
  lancamentos: Lancamento[];
  mesReferencia: string; // yyyy-mm — o gráfico termina nesse mês
}

type Periodo = "1" | "6" | "12";

const OPCOES_PERIODO: { valor: Periodo; rotulo: string }[] = [
  { valor: "1", rotulo: "Este mês" },
  { valor: "6", rotulo: "Últimos 6 meses" },
  { valor: "12", rotulo: "Últimos 12 meses" },
];

const formatarMoedaCompacta = (valor: number) =>
  `R$ ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

export default function FluxoFinanceiro({
  lancamentos,
  mesReferencia,
}: FluxoFinanceiroProps) {
  const [periodo, setPeriodo] = useState<Periodo>("6");

  const dados = useMemo(() => {
    const quantidadeMeses = Number(periodo);

    return Array.from({ length: quantidadeMeses }, (_, indice) => {
      const competencia = deslocarMesAno(
        mesReferencia,
        -(quantidadeMeses - 1 - indice),
      );
      const lancamentosDoMes = lancamentos.filter(
        (l) => mesAnoDeData(l.data) === competencia,
      );

      const receitas = lancamentosDoMes
        .filter((l) => l.tipo === "receita")
        .reduce((acc, l) => acc + l.valor, 0);
      const despesas = lancamentosDoMes
        .filter((l) => l.tipo === "despesa")
        .reduce((acc, l) => acc + l.valor, 0);

      return {
        competencia,
        rotulo: formatarRotuloMesAno(competencia).replace(" / ", "/"),
        receitas,
        despesas,
      };
    });
  }, [lancamentos, mesReferencia, periodo]);

  const semMovimentacao = dados.every(
    (d) => d.receitas === 0 && d.despesas === 0,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-extrabold text-slate-800">
          Fluxo financeiro
        </h2>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as Periodo)}
          className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {OPCOES_PERIODO.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>

      {semMovimentacao ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400 font-medium">
          Nenhuma movimentação no período selecionado.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} barGap={6} margin={{ left: -10 }}>
              <CartesianGrid vertical={false} stroke={CORES_GRAFICO.grade} />
              <XAxis
                dataKey="rotulo"
                tick={{ fontSize: 11, fill: CORES_GRAFICO.eixo }}
                tickLine={false}
                axisLine={{ stroke: CORES_GRAFICO.linhaEixo }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CORES_GRAFICO.eixo }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatarMoedaCompacta}
                width={70}
              />
              <Tooltip
                cursor={{ fill: CORES_GRAFICO.tooltipFundoDestaque }}
                formatter={(valor) => [
                  Number(valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  }),
                  "",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: CORES_GRAFICO.tooltipBorda,
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
              />
              <Bar
                dataKey="receitas"
                name="Receitas"
                fill={CORES_GRAFICO.receita}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="despesas"
                name="Despesas"
                fill={CORES_GRAFICO.despesa}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
