import React, { useState, useEffect } from "react";
import IconGastosFixos from "../assets/icones/ic-gastosfixos.svg?react";
import type { ItemCampo } from "../types/index";

interface ModalGastosFixosProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (total: number, campos: ItemCampo[]) => void;
  camposIniciais?: ItemCampo[];
}

const CAMPOS_GASTOS_FIXOS_PADRAO: ItemCampo[] = [
  { categoriaId: "aluguel", rotulo: "Aluguel", valor: "" },
  { categoriaId: "agua", rotulo: "Água", valor: "" },
  { categoriaId: "luz", rotulo: "Luz", valor: "" },
  { categoriaId: "internet", rotulo: "Internet", valor: "" },
  { categoriaId: "mercado", rotulo: "Mercado", valor: "" },
  { categoriaId: "outro", rotulo: "Outro", valor: "" },
];

export default function ModalGastosFixos({
  isOpen,
  onClose,
  onSalvar,
  camposIniciais = CAMPOS_GASTOS_FIXOS_PADRAO,
}: ModalGastosFixosProps) {
  const [campos, setCampos] = useState<ItemCampo[]>(camposIniciais);

  useEffect(() => {
    if (isOpen) {
      setCampos(camposIniciais);
    }
  }, [isOpen, camposIniciais]);

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

  const handleInputChange = (id: string, valorDigitado: string) => {
    let valorFormatado = valorDigitado.replace(/[^0-9.,]/g, "");
    const partes = valorFormatado.split(/[.,]/);

    if (partes.length > 1) {
      const parteInteira = partes[0].slice(0, 6);
      const parteDecimal = partes[1].slice(0, 2);
      const separador = valorFormatado.includes(",") ? "," : ".";
      valorFormatado = `${parteInteira}${separador}${parteDecimal}`;
    } else {
      valorFormatado = partes[0].slice(0, 6);
    }

    setCampos((prevCampos) =>
      prevCampos.map((campo) =>
        campo.categoriaId === id ? { ...campo, valor: valorFormatado } : campo,
      ),
    );
  };

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#FFDADA] p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl overflow-hidden border border-slate-300 shadow-sm flex flex-col">
          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between bg-[#8B0000] px-4 py-2.5 text-white">
            <div className="flex items-center gap-3">
              <IconGastosFixos className="w-6 h-6 fill-current text-white shrink-0" />
              <h2 className="font-semibold text-lg tracking-wide">Fixos</h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-white hover:text-slate-300 font-bold text-xl leading-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded transition-transform duration-300 hover:rotate-90 active:scale-90 inline-flex items-center justify-center p-1 cursor-pointer"
              title="Fechar Modal"
            >
              ✕
            </button>
          </div>

          {/* Formulário com espaçamentos otimizados */}
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
            {/* Título das Colunas */}
            <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-800 text-base">
                Descrição
              </span>
              <span className="font-bold text-slate-800 text-base uppercase">
                VALOR (R$)
              </span>
            </div>

            {/* Lista de Campos - Rolagem removida (overflow-visible) */}
            <div className="flex flex-col gap-2">
              {campos.map((campo) => (
                <div
                  key={campo.categoriaId}
                  className="grid grid-cols-2 gap-3 items-center"
                >
                  <div className="px-3 py-1.5 border border-slate-400 rounded-md text-slate-800 font-medium bg-slate-50 text-sm">
                    {campo.rotulo}
                  </div>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={campo.valor}
                    onChange={(e) =>
                      handleInputChange(campo.categoriaId, e.target.value)
                    }
                    className="px-3 py-1.5 border border-slate-400 rounded-md text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000] text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Rodapé e Totalizador */}
            <div className="pt-3 mt-1 border-t border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 border border-slate-400 rounded-md font-bold text-slate-800 bg-slate-50 text-sm">
                  Total
                </span>
                <span className="px-3 py-1.5 border border-slate-400 rounded-md font-bold text-slate-900 bg-white text-sm min-w-28 text-center">
                  R${" "}
                  {totalCalculado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                type="submit"
                className="bg-[#8B0000] text-white font-semibold px-6 py-1.5 rounded-full hover:bg-[#6b0000] hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-800 cursor-pointer text-sm"
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
