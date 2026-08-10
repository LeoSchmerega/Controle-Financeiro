// src/components/Dashboard/ModalContribuirMeta.tsx
import { useState, useEffect } from "react";
import { PiggyBank, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { formatarValorMonetario } from "../../utils/valorUtils";
import type { Meta } from "../../types/financeiro";

interface ModalContribuirMetaProps {
  isOpen: boolean;
  onClose: () => void;
  meta: Meta | null;
}

export default function ModalContribuirMeta({
  isOpen,
  onClose,
  meta,
}: ModalContribuirMetaProps) {
  const { contribuirParaMeta } = useFinance();
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (isOpen) setValor("");
  }, [isOpen, meta]);

  if (!isOpen || !meta) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (!valorNumerico) return;

    contribuirParaMeta(meta.id, valorNumerico);
    onClose();
  };

  const novoAcumulado = meta.valorAcumulado + (parseFloat(valor.replace(",", ".")) || 0);
  const percentualNovo =
    meta.valorObjetivo > 0
      ? Math.min(Math.round((novoAcumulado / meta.valorObjetivo) * 100), 100)
      : 0;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="font-bold text-lg text-slate-800">
              Adicionar valor
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

        <p className="text-sm text-slate-600 mb-4">
          Quanto você quer adicionar à meta{" "}
          <strong>
            {meta.icone} {meta.nome}
          </strong>
          ?
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Valor (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(formatarValorMonetario(e.target.value))}
              required
              autoFocus
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {valor && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentualNovo}%`, backgroundColor: meta.cor }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Novo total: R${" "}
                {novoAcumulado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ({percentualNovo}%)
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
