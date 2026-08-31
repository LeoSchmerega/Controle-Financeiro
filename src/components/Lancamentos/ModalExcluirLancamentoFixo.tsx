// src/components/Lancamentos/ModalExcluirLancamentoFixo.tsx
import { Repeat, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import type { Lancamento } from "../../types/financeiro";

interface ModalExcluirLancamentoFixoProps {
  isOpen: boolean;
  onClose: () => void;
  lancamento: Lancamento | null;
}

// Confirmação exibida ao excluir uma ocorrência de despesa fixa recorrente
// — dá à pessoa a escolha entre remover só o mês atual (a recorrência
// continua) ou encerrar a recorrência a partir deste mês em diante.
export default function ModalExcluirLancamentoFixo({
  isOpen,
  onClose,
  lancamento,
}: ModalExcluirLancamentoFixoProps) {
  const { excluirOcorrenciaFixaApenasEsteMes, pararRecorrenciaFixa } =
    useFinance();

  if (!isOpen || !lancamento) return null;

  const handleApenasEsteMes = () => {
    excluirOcorrenciaFixaApenasEsteMes(lancamento.id);
    onClose();
  };

  const handleEncerrarRecorrencia = () => {
    pararRecorrenciaFixa(lancamento.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="font-bold text-lg text-slate-800">
              Excluir despesa fixa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          <strong>{lancamento.descricao}</strong> é uma despesa fixa
          recorrente. O que você deseja fazer?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleApenasEsteMes}
            className="w-full py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors text-left px-4"
          >
            Excluir apenas este mês
            <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
              A despesa continua sendo lançada normalmente nos próximos meses.
            </span>
          </button>
          <button
            type="button"
            onClick={handleEncerrarRecorrencia}
            className="w-full py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors text-left px-4"
          >
            Excluir e parar de repetir
            <span className="block text-[11px] font-normal text-white/80 mt-0.5">
              Remove este mês e encerra a recorrência a partir de agora.
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
