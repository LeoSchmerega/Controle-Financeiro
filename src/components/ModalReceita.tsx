import React, { useState, useEffect } from "react";
import IconReceitas from "../assets/icones/ic-receitas.svg?react";
import type { ItemCampo } from "../types/index"; // Importando direto do seu arquivo de tipos

interface ModalReceitaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (total: number, campos: ItemCampo[]) => void;
  camposIniciais?: ItemCampo[];
}

// Configuração padrão de campos de Receita conforme o protótipo
const CAMPOS_RECEITA_PADRAO: ItemCampo[] = [
  { id: "salario", rotulo: "Salário", valor: "" },
  { id: "freelancer", rotulo: "Freelancer", valor: "" },
  { id: "outro", rotulo: "Outro", valor: "" },
];

export default function ModalReceita({
  isOpen,
  onClose,
  onSalvar,
  camposIniciais = CAMPOS_RECEITA_PADRAO,
}: ModalReceitaProps) {
  const [campos, setCampos] = useState<ItemCampo[]>(camposIniciais);

  // Sincroniza/Reseta o estado quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setCampos(camposIniciais);
    }
  }, [isOpen, camposIniciais]);

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

  // Atualização reativa do campo de texto
  const handleInputChange = (id: string, novoValor: string) => {
    setCampos((prevCampos) =>
      prevCampos.map((campo) =>
        campo.id === id ? { ...campo, valor: novoValor } : campo,
      ),
    );
  };

  // Soma total convertendo os valores em string para number de forma segura
  const totalCalculado = campos.reduce((acc, campo) => {
    const valorSanitizado = campo.valor.replace(",", ".");
    const valorNumerico = parseFloat(valorSanitizado);
    return acc + (isNaN(valorNumerico) ? 0 : valorNumerico);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(totalCalculado, campos);
    onClose();
  };

  return (
    /* BackDrop (Fundo Escuro com desfoque) */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Moldura Externa (Fundo Rosa/Vinho Claro conforme o protótipo) */}
      <div
        className="relative w-full max-w-md bg-[#FFDADA] p-3 rounded-2xl shadow-2xl border border-slate-300"
        onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro do card
      >
        {/* Container Interno */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-300 shadow-sm flex flex-col">
          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between bg-[#8B0000] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <IconReceitas className="w-6 h-6 fill-current text-white shrink-0" />
              <h2 className="font-semibold text-lg tracking-wide">Receitas</h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-white hover:text-slate-300 font-bold text-xl leading-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              title="Fechar Modal"
            >
              ✕
            </button>
          </div>

          {/* Form de Edição */}
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {/* Título da Tabela */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-lg">Fonte</span>
              <span className="font-bold text-slate-800 text-lg uppercase">
                VALOR (R$)
              </span>
            </div>

            {/* Lista de Entradas */}
            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
              {campos.map((campo) => (
                <div
                  key={campo.id}
                  className="grid grid-cols-2 gap-4 items-center"
                >
                  <div className="p-2 border border-slate-400 rounded-md text-slate-800 font-medium bg-slate-50 text-sm">
                    {campo.rotulo}
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={campo.valor}
                    onChange={(e) =>
                      handleInputChange(campo.id, e.target.value)
                    }
                    className="p-2 border border-slate-400 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000] text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Rodapé e Totalizador */}
            <div className="pt-4 mt-2 border-t border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 border border-slate-400 rounded-md font-bold text-slate-800 bg-slate-50 text-sm px-4">
                  Total
                </span>
                <span className="p-2 border border-slate-400 rounded-md font-bold text-slate-900 bg-white text-sm min-w-[100px] text-center">
                  R${" "}
                  {totalCalculado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                type="submit"
                className="bg-[#8B0000] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#6b0000] active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
