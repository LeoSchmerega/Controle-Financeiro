// src/components/Contas/ModalFatura.tsx
// Mostra as compras de uma fatura do cartão, com navegação entre faturas
// (anteriores e futuras — onde aparecem as parcelas já lançadas).
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import type { Conta } from "../../types/financeiro";
import {
  competenciaFaturaAberta,
  datasDaFatura,
  formatarDiaMes,
  formatarMoeda,
  lancamentosDaFatura,
} from "../../utils/contaUtils";
import {
  deslocarMesAno,
  formatarRotuloMesAno,
  paraObjetoData,
} from "../../utils/dataUtils";

interface ModalFaturaProps {
  cartao: Conta | null;
  onClose: () => void;
}

export default function ModalFatura({ cartao, onClose }: ModalFaturaProps) {
  const { lancamentos, categorias } = useFinance();
  // Sempre abre na fatura aberta (a que ainda está recebendo compras). O
  // componente é recriado a cada cartão (key no ContasPage).
  const [competencia, setCompetencia] = useState(() =>
    cartao?.diaFechamento ? competenciaFaturaAberta(cartao.diaFechamento) : "",
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (cartao) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartao, onClose]);

  const itens = useMemo(() => {
    if (!cartao || !competencia) return [];
    return lancamentosDaFatura(cartao, lancamentos, competencia).sort(
      (a, b) =>
        (paraObjetoData(a.data)?.getTime() ?? 0) -
        (paraObjetoData(b.data)?.getTime() ?? 0),
    );
  }, [cartao, lancamentos, competencia]);

  if (!cartao?.diaFechamento || !cartao.diaVencimento || !competencia) return null;

  const total = itens.reduce((soma, l) => soma + l.valor, 0);
  const { fechamento, vencimento } = datasDaFatura(
    competencia,
    cartao.diaFechamento,
    cartao.diaVencimento,
  );
  const aberta = competencia === competenciaFaturaAberta(cartao.diaFechamento);
  const status = aberta
    ? "Aberta"
    : competencia < competenciaFaturaAberta(cartao.diaFechamento)
      ? "Fechada"
      : "Futura";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-fatura-titulo"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: cartao.cor }}
              aria-hidden="true"
            />
            <h2 id="modal-fatura-titulo" className="font-bold text-lg text-slate-800 truncate">
              Fatura · {cartao.nome}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação entre faturas */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCompetencia((c) => deslocarMesAno(c, -1))}
            aria-label="Fatura anterior"
            className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-black text-slate-900">
              {formatarRotuloMesAno(competencia)}
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              Fecha {formatarDiaMes(fechamento)} · Vence {formatarDiaMes(vencimento)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCompetencia((c) => deslocarMesAno(c, 1))}
            aria-label="Próxima fatura"
            className="p-2 text-slate-400 hover:text-brand rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total da fatura
            </p>
            <p className="text-2xl font-black text-brand">{formatarMoeda(total)}</p>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              status === "Aberta"
                ? "bg-amber-50 text-amber-700"
                : status === "Fechada"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-sky-50 text-sky-700"
            }`}
          >
            {status}
          </span>
        </div>

        <ul className="flex-1 overflow-y-auto divide-y divide-slate-100 -mx-2">
          {itens.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-400">
              Nenhuma compra nesta fatura.
            </li>
          ) : (
            itens.map((l) => {
              const categoria = categorias.find((c) => c.id === l.categoriaId);
              return (
                <li key={l.id} className="flex items-center justify-between gap-3 px-2 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{l.descricao}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {l.data}
                      {categoria && ` · ${categoria.nome}`}
                    </p>
                  </div>
                  <span className="text-sm font-black text-slate-800 shrink-0">
                    {formatarMoeda(l.valor)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
