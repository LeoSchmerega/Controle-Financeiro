// src/components/Categoria/ModalNovaCategoria.tsx
import { useState, useEffect } from "react";
import { Tag, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { formatarValorMonetario } from "../../utils/valorUtils";
import { PALETA_CORES, ICONES_CATEGORIA } from "../../utils/paletaVisual";
import type { Categoria, TipoTransacao } from "../../types/financeiro";

// Paleta de cores/ícones oferecida na criação/edição — a mesma usada pela
// atribuição automática do FinanceContext (ver utils/paletaVisual.ts)
const CORES_DISPONIVEIS = PALETA_CORES;
const ICONES_DISPONIVEIS = ICONES_CATEGORIA;

interface ModalNovaCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  // Quando presente, o modal entra em modo de edição dessa categoria
  categoriaEditando?: Categoria | null;
  // Tipo sugerido ao criar uma categoria nova (ex: respeita o filtro ativo)
  tipoSugerido?: TipoTransacao;
}

export default function ModalNovaCategoria({
  isOpen,
  onClose,
  categoriaEditando = null,
  tipoSugerido = "despesa",
}: ModalNovaCategoriaProps) {
  const { adicionarCategoria, editarCategoria, contarLancamentosPorCategoria } =
    useFinance();
  const emEdicao = categoriaEditando !== null;

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>(tipoSugerido);
  const [cor, setCor] = useState<string>(CORES_DISPONIVEIS[0]);
  const [icone, setIcone] = useState<string>(ICONES_DISPONIVEIS[0]);
  const [orcamentoMensal, setOrcamentoMensal] = useState("");
  const [ativa, setAtiva] = useState(true);

  const vinculados = categoriaEditando
    ? contarLancamentosPorCategoria(categoriaEditando.id)
    : 0;
  const tipoBloqueado = emEdicao && vinculados > 0;

  // Sincroniza/Reseta o estado quando o modal é aberto
  useEffect(() => {
    if (!isOpen) return;

    if (categoriaEditando) {
      setNome(categoriaEditando.nome);
      setTipo(categoriaEditando.tipo);
      setCor(categoriaEditando.cor);
      setIcone(categoriaEditando.icone ?? ICONES_DISPONIVEIS[0]);
      setOrcamentoMensal(
        categoriaEditando.orcamentoMensal !== undefined
          ? String(categoriaEditando.orcamentoMensal).replace(".", ",")
          : "",
      );
      setAtiva(categoriaEditando.ativa);
    } else {
      setNome("");
      setTipo(tipoSugerido);
      setCor(CORES_DISPONIVEIS[0]);
      setIcone(ICONES_DISPONIVEIS[0]);
      setOrcamentoMensal("");
      setAtiva(true);
    }
  }, [isOpen, categoriaEditando, tipoSugerido]);

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
      tipo,
      cor,
      icone,
      orcamentoMensal: orcamentoMensal
        ? parseFloat(orcamentoMensal.replace(",", "."))
        : undefined,
      ativa,
    };

    if (emEdicao && categoriaEditando) {
      editarCategoria(categoriaEditando.id, dados);
    } else {
      adicionarCategoria(dados);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-categoria-titulo"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
        <div>
          {/* Header do Drawer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Tag
                className="w-5 h-5 text-brand shrink-0"
                aria-hidden="true"
              />
              <h2
                id="modal-categoria-titulo"
                className="font-bold text-lg text-slate-800"
              >
                {emEdicao ? "Editar Categoria" : "Nova Categoria"}
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
            id="form-categoria"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
          >
            {/* Nome */}
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
                required
                autoFocus
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  disabled={tipoBloqueado}
                  onClick={() => setTipo("receita")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    tipo === "receita"
                      ? "bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200"
                      : "text-slate-500 hover:text-slate-800"
                  } ${tipoBloqueado ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  disabled={tipoBloqueado}
                  onClick={() => setTipo("despesa")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    tipo === "despesa"
                      ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                      : "text-slate-500 hover:text-slate-800"
                  } ${tipoBloqueado ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  Despesa
                </button>
              </div>
              {tipoBloqueado && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O tipo não pode ser alterado: {vinculados} lançamento(s)
                  usam esta categoria.
                </span>
              )}
            </div>

            {/* Cor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {CORES_DISPONIVEIS.map((corDisponivel) => (
                  <button
                    key={corDisponivel}
                    type="button"
                    onClick={() => setCor(corDisponivel)}
                    aria-label={`Selecionar cor ${corDisponivel}`}
                    style={{ backgroundColor: corDisponivel }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 ${
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
                {ICONES_DISPONIVEIS.map((iconeDisponivel) => (
                  <button
                    key={iconeDisponivel}
                    type="button"
                    onClick={() => setIcone(iconeDisponivel)}
                    aria-label={`Selecionar ícone ${iconeDisponivel}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-base cursor-pointer transition-colors ${
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

            {/* Orçamento mensal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Orçamento mensal (R$){" "}
                <span className="text-slate-400 font-normal normal-case">
                  opcional
                </span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={orcamentoMensal}
                onChange={(e) =>
                  setOrcamentoMensal(formatarValorMonetario(e.target.value))
                }
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Define uma meta de gasto para acompanhar o progresso na
                listagem.
              </span>
            </div>

            {/* Ativa */}
            {emEdicao && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  className="w-4 h-4 accent-brand cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Categoria ativa
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (inativas somem dos seletores de lançamento)
                </span>
              </label>
            )}
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
            form="form-categoria"
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors"
          >
            {emEdicao ? "Salvar Alterações" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
