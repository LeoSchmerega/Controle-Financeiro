// src/components/Lancamentos/CardsResumo.tsx
import {
  Wallet,
  Home,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface TotaisProps {
  totais?: {
    // Deixamos opcional com a interrogação '?'
    receitas: number;
    gastosFixos: number;
    gastosVariaveis: number;
    saldoAtual: number;
  };
}

export default function CardsResumo({ totais }: TotaisProps) {
  // Fallback de segurança: se 'totais' for undefined, usa zeros para não quebrar a tela
  const receitas = totais?.receitas ?? 0;
  const gastosFixos = totais?.gastosFixos ?? 0;
  const gastosVariaveis = totais?.gastosVariaveis ?? 0;
  const saldoAtual = totais?.saldoAtual ?? 0;

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card Receitas */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Receitas</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            R$ {formatarMoeda(receitas)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            Total no mês
          </span>
        </div>
        <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 stroke-3" />
        </div>
      </div>

      {/* Card Gastos Fixos */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Gastos Fixos</span>
          </div>
          <p className="text-2xl font-black text-brand">
            R$ {formatarMoeda(gastosFixos)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            Total no mês
          </span>
        </div>
        <div className="w-7 h-7 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <ArrowDownRight className="w-4 h-4 stroke-3" />
        </div>
      </div>

      {/* Card Gastos Variáveis */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Gastos Variáveis</span>
          </div>
          <p className="text-2xl font-black text-brand">
            R$ {formatarMoeda(gastosVariaveis)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            Total no mês
          </span>
        </div>
        <div className="w-7 h-7 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <ArrowDownRight className="w-4 h-4 stroke-3" />
        </div>
      </div>

      {/* Card Saldo Atual */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Saldo Atual</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            R$ {formatarMoeda(saldoAtual)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            Total no mês
          </span>
        </div>
        <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 stroke-3" />
        </div>
      </div>
    </div>
  );
}
