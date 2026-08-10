// src/components/Dashboard/ModalMetaFinanceira.tsx
import { useState, useEffect } from "react";
import { Target, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { formatarValorMonetario } from "../../utils/valorUtils";
import { PALETA_CORES, ICONES_META } from "../../utils/paletaVisual";
import type { Meta } from "../../types/financeiro";

interface ModalMetaFinanceiraProps {
  isOpen: boolean;
  onClose: () => void;
  // Quando presente, o modal entra em modo de edição dessa meta
  metaEditando?: Meta | null;
}

export default function ModalMetaFinanceira({
  isOpen,
  onClose,
  metaEditando = null,
}: ModalMetaFinanceiraProps) {
  const { adicionarMeta, editarMeta } = useFinance();
  const emEdicao = metaEditando !== null;

  const [nome, setNome] = useState("");
  const [valorObjetivo, setValorObjetivo] = useState("");
  const [valorAcumulado, setValorAcumulado] = useState("");
  const [cor, setCor] = useState<string>(PALETA_CORES[0]);
  const [icone, setIcone] = useState<string>(ICONES_META[0]);

  // Sincroniza/Reseta o estado quando o modal é aberto
  useEffect(() => {
    if (!isOpen) return;

    if (metaEditando) {
      setNome(metaEditando.nome);
      setValorObjetivo(String(metaEditando.valorObjetivo).replace(".", ","));
      setValorAcumulado(
        String(metaEditando.valorAcumulado).replace(".", ","),
      );
      setCor(metaEditando.cor);
      setIcone(metaEditando.icone);
    } else {
      setNome("");
      setValorObjetivo("");
      setValorAcumulado("");
      setCor(PALETA_CORES[0]);
      setIcone(ICONES_META[0]);
    }
  }, [isOpen, metaEditando]);

  // Acessibilidade: Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const dados = {
      nome: nome.trim(),
      valorObjetivo: parseFloat(valorObjetivo.replace(",", ".")) || 0,
      valorAcumulado: parseFloat(valorAcumulado.replace(",", ".")) || 0,
      cor,
      icone,
    };

    if (emEdicao && metaEditando) {
      editarMeta(metaEditando.id, dados);
    } else {
      adicionarMeta(dados);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-meta-titulo"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
        <div>
          {/* Header do Drawer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
              <h2
                id="modal-meta-titulo"
                className="font-bold text-lg text-slate-800"
              >
                {emEdicao ? "Editar Meta" : "Nova Meta Financeira"}
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            id="form-meta"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
          >
            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome da Meta
              </label>
              <input
                type="text"
                placeholder="Ex: Reserva de emergência, Viagem..."
                value={nome}
                maxLength={40}
                onChange={(e) => setNome(e.target.value.slice(0, 40))}
                required
                autoFocus
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Valor objetivo + Valor já acumulado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Valor objetivo (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorObjetivo}
                  onChange={(e) =>
                    setValorObjetivo(formatarValorMonetario(e.target.value))
                  }
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Já acumulado (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorAcumulado}
                  onChange={(e) =>
                    setValorAcumulado(formatarValorMonetario(e.target.value))
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {PALETA_CORES.map((corDisponivel) => (
                  <button
                    key={corDisponivel}
                    type="button"
                    onClick={() => setCor(corDisponivel)}
                    aria-label={`Selecionar cor ${corDisponivel}`}
                    style={{ backgroundColor: corDisponivel }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand ${
                      cor === corDisponivel
                        ? "ring-2 ring-offset-2 ring-slate-400"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Ícone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ícone
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ICONES_META.map((iconeDisponivel) => (
                  <button
                    key={iconeDisponivel}
                    type="button"
                    onClick={() => setIcone(iconeDisponivel)}
                    aria-label={`Selecionar ícone ${iconeDisponivel}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-base cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      icone === iconeDisponivel
                        ? "bg-red-50 border border-brand/30"
                        : "bg-slate-50 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    {iconeDisponivel}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="pt-4 border-t border-slate-100 flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-meta"
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors"
          >
            {emEdicao ? "Salvar Alterações" : "Criar Meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
