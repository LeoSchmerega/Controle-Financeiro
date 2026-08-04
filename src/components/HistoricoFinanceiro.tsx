import { useState } from "react";

// Importação dos seus ícones SVG
import IconReceitas from "../assets/icones/ic-receitas.svg?react";
import IconGastosFixos from "../assets/icones/ic-gastosfixos.svg?react";
import IconVariaveis from "../assets/icones/ic-variaveis.svg?react";
import IconGastoAtual from "../assets/icones/ic-gastoatual.svg?react";
import IconBtnCriar from "../assets/icones/ic-btn-criar.svg?react";
import IconBtnEditar from "../assets/icones/ic-btn-editar.svg?react";

// Importação do Modal de Receita e dos seus Types
import ModalReceita from "./ModalReceita";
import type { ItemCampo } from "../types/index";

// 1. Definição da interface TypeScript para os Cards
interface CardItem {
  id: string;
  titulo: string;
  icone: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  temAcoes: boolean;
}

export default function HistoricoFinanceiro() {
  // Controle de estado para abertura do Modal de Receita
  const [isModalReceitaOpen, setIsModalReceitaOpen] = useState(false);

  // Estado dinâmico para os valores numéricos dos cards
  const [valoresCards, setValoresCards] = useState<Record<string, string>>({
    receitas: "0,00",
    "gastos-fixos": "0,00",
    variaveis: "0,00",
    "gasto-atual": "0,00",
  });

  // 2. Estrutura de dados centralizada dos cards (sua estrutura original)
  const cards: CardItem[] = [
    {
      id: "receitas",
      titulo: "Receitas",
      icone: IconReceitas,
      temAcoes: true,
    },
    {
      id: "gastos-fixos",
      titulo: "Gastos Fixos",
      icone: IconGastosFixos,
      temAcoes: true,
    },
    {
      id: "variaveis",
      titulo: "Variaveis",
      icone: IconVariaveis,
      temAcoes: true,
    },
    {
      id: "gasto-atual",
      titulo: "Gasto Atual",
      icone: IconGastoAtual,
      temAcoes: false,
    },
  ];

  // Handler acionado quando o usuário salva no Modal de Receita
  const handleSalvarReceita = (total: number, _campos: ItemCampo[]) => {
    const valorFormatado = total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setValoresCards((prev) => ({
      ...prev,
      receitas: valorFormatado,
    }));
  };

  // Handler para identificar qual card foi clicado
  const handleAcaoCard = (cardId: string) => {
    if (cardId === "receitas") {
      setIsModalReceitaOpen(true);
    } else {
      console.log(`Modal para ${cardId} será implementado na próxima etapa.`);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full my-6">
        {cards.map((card) => {
          const IconeComponente = card.icone;

          return (
            <div
              key={card.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-sm transition-all hover:shadow-[#8B0000]"
            >
              {/* Cabeçalho do Card (Vinho) - SUA PERSONALIZAÇÃO ORIGINAL */}
              <div className="flex items-center gap-3 bg-[#8B0000] px-4 py-3 text-white">
                <IconeComponente className="w-8 h-8 text-white shrink-0" />
                <h3 className="font-semibold text-[20px] tracking-wide">
                  {card.titulo}
                </h3>
              </div>

              {/* Corpo do Card - SUA PERSONALIZAÇÃO ORIGINAL */}
              <div className="flex flex-col justify-between p-4 min-h-[110px] bg-white text-slate-900">
                {/* Exibição do Valor */}
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-semibold text-black text-lg">R$</span>
                  <span className="text-lg font-medium text-slate-900 border-b border-slate-300 pb-0.5 min-w-[120px]">
                    {valoresCards[card.id]}
                  </span>
                </div>

                {/* Botões de Ação (+ e Editar) - SUA PERSONALIZAÇÃO ORIGINAL */}
                <div className="flex justify-end gap-2 mt-4 min-h-[36px]">
                  {card.temAcoes && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcaoCard(card.id)}
                        title="Adicionar Lançamento"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#8B0000] text-white hover:bg-[#6b0000] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-red-800"
                      >
                        <IconBtnCriar className="w-8 h-8 text-white" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcaoCard(card.id)}
                        title="Editar Lançamento"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#8B0000] text-white hover:bg-[#6b0000] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-red-800"
                      >
                        <IconBtnEditar className="w-7 h-7 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPONENTE DO MODAL DE RECEITAS (Injetado dinamicamente) */}
      <ModalReceita
        isOpen={isModalReceitaOpen}
        onClose={() => setIsModalReceitaOpen(false)}
        onSalvar={handleSalvarReceita}
      />
    </>
  );
}
