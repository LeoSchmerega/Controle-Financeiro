// src/components/HistoricoFinanceiro.tsx
import { useState, useMemo, useEffect } from "react";
import IconReceitas from "../assets/icones/ic-receitas.svg?react";
import IconGastosFixos from "../assets/icones/ic-gastosfixos.svg?react";
import IconVariaveis from "../assets/icones/ic-variaveis.svg?react";
import IconGastoAtual from "../assets/icones/ic-gastoatual.svg?react";
import IconBtnCriar from "../assets/icones/ic-btn-criar.svg?react";
import IconBtnEditar from "../assets/icones/ic-btn-editar.svg?react";

import ModalReceita from "./ModalReceita";
import ModalGastosFixos from "./ModalFixos";
import ModalVariaveis from "./ModalVariaveis";
import HeaderLancamento from "./HeaderLancamento";

import type { ItemCampo, MapaFinanceiro, RegistroMensal } from "../types";
import { getChaveMesAtual, gerarOpcoesMeses } from "../utils/dateUtils";
import { useCategorias } from "../hooks/useCategorias";
import { mapearLancamentosDoMes } from "../utils/financeiroUtils";

const CHAVE_LOCAL_STORAGE = "@meu-app:dados-financeiros-v1";

export default function HistoricoFinanceiro() {
  const { categorias } = useCategorias();
  const [mesSelecionado, setMesSelecionado] =
    useState<string>(getChaveMesAtual());

  // Estado global dos dados chaveados por "YYYY-MM"
  const [mapaFinanceiro, setMapaFinanceiro] = useState<MapaFinanceiro>(() => {
    const dadosSalvos = localStorage.getItem(CHAVE_LOCAL_STORAGE);
    return dadosSalvos ? JSON.parse(dadosSalvos) : {};
  });

  // Salva no LocalStorage sempre que houver alteração
  useEffect(() => {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(mapaFinanceiro));
  }, [mapaFinanceiro]);

  // Opções dinâmicas do seletor de meses
  const opcoesMeses = useMemo(() => {
    return gerarOpcoesMeses(Object.keys(mapaFinanceiro));
  }, [mapaFinanceiro]);

  // Obtém e sincroniza os dados do mês selecionado com as categorias atuais
  const dadosDoMesAtivo: RegistroMensal = useMemo(() => {
    const registroExistente = mapaFinanceiro[mesSelecionado] || {
      receitas: [],
      gastosFixos: [],
      variaveis: [],
    };

    return {
      receitas: mapearLancamentosDoMes(
        categorias,
        registroExistente.receitas,
        "RECEITAS",
      ),
      gastosFixos: mapearLancamentosDoMes(
        categorias,
        registroExistente.gastosFixos,
        "GASTOS_FIXOS",
      ),
      variaveis: mapearLancamentosDoMes(
        categorias,
        registroExistente.variaveis,
        "VARIAVEIS",
      ),
    };
  }, [mapaFinanceiro, mesSelecionado, categorias]);

  // Modais
  const [isModalReceitaOpen, setIsModalReceitaOpen] = useState(false);
  const [isModalGastosFixosOpen, setIsModalGastosFixosOpen] = useState(false);
  const [isModalVariaveisOpen, setIsModalVariaveisOpen] = useState(false);

  // Auxiliar para somar valores de uma lista de campos
  const calcularTotal = (campos: ItemCampo[]): number => {
    return campos.reduce((acc, c) => {
      const num = parseFloat(c.valor.replace(",", ".")) || 0;
      return acc + num;
    }, 0);
  };

  const totalReceitas = useMemo(
    () => calcularTotal(dadosDoMesAtivo.receitas),
    [dadosDoMesAtivo.receitas],
  );
  const totalGastosFixos = useMemo(
    () => calcularTotal(dadosDoMesAtivo.gastosFixos),
    [dadosDoMesAtivo.gastosFixos],
  );
  const totalVariaveis = useMemo(
    () => calcularTotal(dadosDoMesAtivo.variaveis),
    [dadosDoMesAtivo.variaveis],
  );
  const totalGastoAtual = totalGastosFixos + totalVariaveis;

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Salvar alterações mantendo imutabilidade
  const salvarTipo = (tipo: keyof RegistroMensal, novosCampos: ItemCampo[]) => {
    setMapaFinanceiro((prev) => ({
      ...prev,
      [mesSelecionado]: {
        ...(prev[mesSelecionado] || {
          receitas: [],
          gastosFixos: [],
          variaveis: [],
        }),
        [tipo]: novosCampos,
      },
    }));
  };

  const cards = [
    {
      id: "receitas",
      titulo: "Receitas",
      icone: IconReceitas,
      valor: totalReceitas,
      temAcoes: true,
    },
    {
      id: "gastos-fixos",
      titulo: "Gastos Fixos",
      icone: IconGastosFixos,
      valor: totalGastosFixos,
      temAcoes: true,
    },
    {
      id: "variaveis",
      titulo: "Variáveis",
      icone: IconVariaveis,
      valor: totalVariaveis,
      temAcoes: true,
    },
    {
      id: "gasto-atual",
      titulo: "Gasto Atual",
      icone: IconGastoAtual,
      valor: totalGastoAtual,
      temAcoes: false,
    },
  ];

  const handleAcaoCard = (cardId: string) => {
    if (cardId === "receitas") setIsModalReceitaOpen(true);
    if (cardId === "gastos-fixos") setIsModalGastosFixosOpen(true);
    if (cardId === "variaveis") setIsModalVariaveisOpen(true);
  };

  return (
    <main className="w-full">
      <HeaderLancamento
        mesSelecionado={mesSelecionado}
        onAlterarMes={setMesSelecionado}
        opcoesMeses={opcoesMeses}
      />

      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-2 mb-6"
        aria-label="Resumo Financeiro"
      >
        {cards.map((card) => {
          const IconeComponente = card.icone;
          const valorExibicao = formatarMoeda(card.valor);
          const temValorCadastrado = card.valor > 0;
          const acaoTexto = !temValorCadastrado
            ? "Adicionar Lançamento"
            : "Editar Lançamento";

          return (
            <article
              key={card.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-sm transition-all hover:shadow-[#8B0000]"
            >
              <div className="flex items-center gap-3 bg-[#8B0000] px-4 py-3 text-white">
                <IconeComponente
                  className="w-8 h-8 text-white shrink-0"
                  aria-hidden="true"
                />
                <h2 className="font-semibold text-[20px] tracking-wide">
                  {card.titulo}
                </h2>
              </div>

              <div className="flex flex-col justify-between p-4 min-h-27.5 bg-white text-slate-900">
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-semibold text-black text-lg">R$</span>
                  <span className="text-lg font-medium text-slate-900 border-b border-slate-300 pb-0.5 min-w-27.5">
                    {valorExibicao}
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-4 min-h-9">
                  {card.temAcoes && (
                    <button
                      type="button"
                      onClick={() => handleAcaoCard(card.id)}
                      title={acaoTexto}
                      aria-label={`${acaoTexto} em ${card.titulo}`}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#8B0000] text-white hover:bg-[#6b0000] hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out shadow-md cursor-pointer"
                    >
                      {!temValorCadastrado ? (
                        <IconBtnCriar
                          className="w-8 h-8 text-white"
                          aria-hidden="true"
                        />
                      ) : (
                        <IconBtnEditar
                          className="w-7 h-7 text-white"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <ModalReceita
        isOpen={isModalReceitaOpen}
        onClose={() => setIsModalReceitaOpen(false)}
        onSalvar={(_, novosCampos) => salvarTipo("receitas", novosCampos)}
        camposIniciais={dadosDoMesAtivo.receitas}
      />

      <ModalGastosFixos
        isOpen={isModalGastosFixosOpen}
        onClose={() => setIsModalGastosFixosOpen(false)}
        onSalvar={(_, novosCampos) => salvarTipo("gastosFixos", novosCampos)}
        camposIniciais={dadosDoMesAtivo.gastosFixos}
      />

      <ModalVariaveis
        isOpen={isModalVariaveisOpen}
        onClose={() => setIsModalVariaveisOpen(false)}
        onSalvar={(_, novosCampos) => salvarTipo("variaveis", novosCampos)}
        camposIniciais={dadosDoMesAtivo.variaveis}
      />
    </main>
  );
}
