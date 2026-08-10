// src/components/Lancamentos/ModalCategoriaRapida.tsx
import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import type { Categoria, TipoTransacao } from "../../types/financeiro";

interface ModalCategoriaRapidaProps {
  isOpen: boolean;
  onClose: () => void;
  // Tipo (receita/despesa) já selecionado no Lançamento, usado como padrão
  tipoInicial: TipoTransacao;
  // Disparado após a categoria ser criada, já com o registro completo (com id)
  onCriada: (categoria: Categoria) => void;
}

export default function ModalCategoriaRapida({
  isOpen,
  onClose,
  tipoInicial,
  onCriada,
}: ModalCategoriaRapidaProps) {
  const { adicionarCategoria } = useFinance();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>(tipoInicial);

  // Sempre que o modal abrir, começa vazio com o tipo do lançamento atual
  useEffect(() => {
    if (isOpen) {
      setNome("");
      setTipo(tipoInicial);
    }
  }, [isOpen, tipoInicial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const categoriaCriada = adicionarCategoria({
      nome: nome.trim(),
      tipo,
    });

    onCriada(categoriaCriada);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand" aria-hidden="true" />
            <h2 className="font-bold text-lg text-slate-800">
              Nova Categoria
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              placeholder="Ex: Alimentação, Lazer..."
              value={nome}
              maxLength={30}
              onChange={(e) => setNome(e.target.value.slice(0, 30))}
              autoFocus
              required
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTipo("receita")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === "receita"
                    ? "bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setTipo("despesa")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === "despesa"
                    ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
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
              Criar e Selecionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
