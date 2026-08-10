// src/components/Categoria/ModalExcluirCategoria.tsx
import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import type { Categoria } from "../../types/financeiro";

interface ModalExcluirCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: Categoria | null;
}

export default function ModalExcluirCategoria({
  isOpen,
  onClose,
  categoria,
}: ModalExcluirCategoriaProps) {
  const { categorias, contarLancamentosPorCategoria, removerCategoria } =
    useFinance();
  const [categoriaDestinoId, setCategoriaDestinoId] = useState("");
  const [erro, setErro] = useState("");

  const vinculados = categoria ? contarLancamentosPorCategoria(categoria.id) : 0;

  // Categorias do mesmo tipo que podem receber os lançamentos reatribuídos
  const opcoesDestino = categoria
    ? categorias.filter((c) => c.tipo === categoria.tipo && c.id !== categoria.id)
    : [];

  useEffect(() => {
    if (isOpen && categoria) {
      // Sugere a categoria padrão "Outros" do mesmo tipo, se existir
      const padrao = categorias.find(
        (c) => c.tipo === categoria.tipo && c.padrao,
      );
      setCategoriaDestinoId(padrao?.id ?? "");
      setErro("");
    }
  }, [isOpen, categoria, categorias]);

  if (!isOpen || !categoria) return null;

  const handleConfirmar = () => {
    const resultado = removerCategoria(
      categoria.id,
      vinculados > 0 ? categoriaDestinoId : undefined,
    );

    if (!resultado.sucesso) {
      setErro(resultado.motivo ?? "Não foi possível excluir a categoria.");
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="font-bold text-lg text-slate-800">
              Excluir categoria
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
          Tem certeza que deseja excluir <strong>{categoria.nome}</strong>?
        </p>

        {vinculados > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-800 font-semibold mb-2">
              {vinculados} lançamento(s) usam esta categoria. Escolha para
              onde eles devem ser movidos antes de excluir:
            </p>
            <select
              value={categoriaDestinoId}
              onChange={(e) => setCategoriaDestinoId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Selecione uma categoria de destino</option>
              {opcoesDestino.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-4">
            Nenhum lançamento está vinculado a esta categoria — a exclusão é
            definitiva.
          </p>
        )}

        {erro && (
          <p className="text-xs text-rose-600 font-semibold mb-3">{erro}</p>
        )}

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
            disabled={vinculados > 0 && !categoriaDestinoId}
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
