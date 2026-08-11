// src/components/Dashboard/MetasFinanceiras.tsx
import { useState } from "react";
import { Target, Plus, PiggyBank, Edit2, Trash2 } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import ModalMetaFinanceira from "./ModalMetaFinanceira";
import ModalContribuirMeta from "./ModalContribuirMeta";
import ModalExcluirMeta from "./ModalExcluirMeta";
import type { Meta } from "../../types/financeiro";

export default function MetasFinanceiras() {
  const { metas } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);
  const [metaParaContribuir, setMetaParaContribuir] = useState<Meta | null>(
    null,
  );
  const [metaParaExcluir, setMetaParaExcluir] = useState<Meta | null>(null);

  const handleAbrirNovaMeta = () => {
    setMetaEditando(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (meta: Meta) => {
    setMetaEditando(meta);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-extrabold text-slate-800">
          Metas financeiras
        </h2>
        <button
          type="button"
          onClick={handleAbrirNovaMeta}
          title="Nova meta"
          aria-label="Nova meta financeira"
          className="w-7 h-7 flex items-center justify-center text-brand bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {metas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400 font-medium max-w-50">
            Nenhuma meta cadastrada ainda.
          </p>
          <button
            type="button"
            onClick={handleAbrirNovaMeta}
            className="mt-1 flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-hover cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar primeira meta</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {metas.map((meta) => {
            const percentual =
              meta.valorObjetivo > 0
                ? Math.min(
                    Math.round(
                      (meta.valorAcumulado / meta.valorObjetivo) * 100,
                    ),
                    100,
                  )
                : 0;
            const concluida = percentual >= 100;

            return (
              <div key={meta.id}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${meta.cor}1A` }}
                    >
                      {meta.icone}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {meta.nome}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold shrink-0 ${
                      concluida ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {concluida ? "Concluída" : `${percentual}%`}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: concluida ? "#059669" : meta.cor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">
                    R${" "}
                    {meta.valorAcumulado.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    / R${" "}
                    {meta.valorObjetivo.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMetaParaContribuir(meta)}
                      title="Adicionar valor"
                      aria-label={`Adicionar valor à meta ${meta.nome}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <PiggyBank className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(meta)}
                      title="Editar"
                      aria-label={`Editar meta ${meta.nome}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetaParaExcluir(meta)}
                      title="Excluir"
                      aria-label={`Excluir meta ${meta.nome}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação/Edição de Meta */}
      <ModalMetaFinanceira
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metaEditando={metaEditando}
      />

      {/* Modal de Contribuição rápida */}
      <ModalContribuirMeta
        isOpen={metaParaContribuir !== null}
        onClose={() => setMetaParaContribuir(null)}
        meta={metaParaContribuir}
      />

      {/* Modal de Exclusão */}
      <ModalExcluirMeta
        isOpen={metaParaExcluir !== null}
        onClose={() => setMetaParaExcluir(null)}
        meta={metaParaExcluir}
      />
    </div>
  );
}
