// src/components/Dashboard/IndicadoresFinanceiros.tsx
import { useMemo } from "react";
import { TrendingDown, Star, Wallet, PiggyBank } from "lucide-react";
import type {
  Categoria,
  Lancamento,
  TotaisFinanceiros,
} from "../../types/financeiro";

interface IndicadoresFinanceirosProps {
  lancamentosDoMes: Lancamento[];
  categorias: Categoria[];
  totaisDoMes: TotaisFinanceiros;
}

export default function IndicadoresFinanceiros({
  lancamentosDoMes,
  categorias,
  totaisDoMes,
}: IndicadoresFinanceirosProps) {
  const maiorCategoriaGasto = useMemo(() => {
    const mapa = new Map<string, number>();
    lancamentosDoMes
      .filter((l) => l.tipo === "despesa")
      .forEach((l) => mapa.set(l.categoriaId, (mapa.get(l.categoriaId) ?? 0) + l.valor));

    let melhorId = "";
    let melhorValor = 0;
    mapa.forEach((valor, id) => {
      if (valor > melhorValor) {
        melhorValor = valor;
        melhorId = id;
      }
    });

    if (!melhorId) return null;
    const categoria = categorias.find((c) => c.id === melhorId);
    return { nome: categoria?.nome ?? "Sem categoria", valor: melhorValor };
  }, [lancamentosDoMes, categorias]);

  const categoriaMaisUtilizada = useMemo(() => {
    const mapa = new Map<string, number>();
    lancamentosDoMes.forEach((l) =>
      mapa.set(l.categoriaId, (mapa.get(l.categoriaId) ?? 0) + 1),
    );

    let melhorId = "";
    let melhorContagem = 0;
    mapa.forEach((contagem, id) => {
      if (contagem > melhorContagem) {
        melhorContagem = contagem;
        melhorId = id;
      }
    });

    if (!melhorId) return null;
    const categoria = categorias.find((c) => c.id === melhorId);
    return {
      nome: categoria?.nome ?? "Sem categoria",
      contagem: melhorContagem,
    };
  }, [lancamentosDoMes, categorias]);

  const totalDespesas = totaisDoMes.gastosFixos + totaisDoMes.gastosVariaveis;

  const formatarMoeda = (valor: number) =>
    `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const indicadores = [
    {
      titulo: "Maior categoria de gasto",
      valor: maiorCategoriaGasto
        ? `${maiorCategoriaGasto.nome} — ${formatarMoeda(maiorCategoriaGasto.valor)}`
        : "—",
      Icon: TrendingDown,
      cor: "text-brand",
      fundo: "bg-red-50",
    },
    {
      titulo: "Categoria mais utilizada",
      valor: categoriaMaisUtilizada
        ? `${categoriaMaisUtilizada.nome} (${categoriaMaisUtilizada.contagem}x)`
        : "—",
      Icon: Star,
      cor: "text-amber-600",
      fundo: "bg-amber-50",
    },
    {
      titulo: "Total de despesas",
      valor: formatarMoeda(totalDespesas),
      Icon: Wallet,
      cor: "text-brand",
      fundo: "bg-red-50",
    },
    {
      titulo: "Economia no mês",
      valor: formatarMoeda(totaisDoMes.saldoAtual),
      Icon: PiggyBank,
      cor: totaisDoMes.saldoAtual >= 0 ? "text-emerald-600" : "text-brand",
      fundo: totaisDoMes.saldoAtual >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {indicadores.map((indicador) => (
        <div
          key={indicador.titulo}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3"
        >
          <div
            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${indicador.fundo} ${indicador.cor}`}
          >
            <indicador.Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {indicador.titulo}
            </p>
            <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
              {indicador.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
