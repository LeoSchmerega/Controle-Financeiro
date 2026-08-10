// src/components/Dashboard/ModalExcluirMeta.tsx
import { AlertTriangle, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import type { Meta } from "../../types/financeiro";

interface ModalExcluirMetaProps {
  isOpen: boolean;
  onClose: () => void;
  meta: Meta | null;
}

export default function ModalExcluirMeta({
  isOpen,
  onClose,
  meta,
}: ModalExcluirMetaProps) {
  const { removerMeta } = useFinance();

  if (!isOpen || !meta) return null;

  const handleConfirmar = () => {
    removerMeta(meta.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="font-bold text-lg text-slate-800">Excluir meta</h2>
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

        <p className="text-sm text-slate-600 mb-6">
          Tem certeza que deseja excluir a meta{" "}
          <strong>
            {meta.icone} {meta.nome}
          </strong>
          ? O progresso acumulado (R${" "}
          {meta.valorAcumulado.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
          ) será perdido.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
