// src/pages/CategoriasPage.tsx
import { useState, useMemo } from "react";
import HeaderCategoria from "../components/Categoria/HeaderCategoria";
import ModalNovaCategoria from "../components/Categoria/ModalNovaCategoria";
import ModalExcluirCategoria from "../components/Categoria/ModalExcluirCategoria";
import { useFinance } from "../context/FinanceContext";
import {
  formatarDataRelativa,
  paraObjetoData,
  mesAnoDeData,
  mesAnoAtual,
  gerarOpcoesMesAno,
  deslocarMesAno,
  formatarRotuloMesAno,
} from "../utils/dataUtils";
import {
  Search,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Award,
  Edit2,
  Trash2,
  Power,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Categoria, TipoTransacao } from "../types/financeiro";

export default function CategoriasPage() {
  const {
    categorias,
    lancamentos,
    alternarAtivaCategoria,
    moverOrdemCategoria,
  } = useFinance();

  // Opções de mês de referência, geradas a partir das datas já lançadas
  const opcoesMeses = useMemo(
    () => gerarOpcoesMesAno(lancamentos.map((l) => l.data)),
    [lancamentos],
  );
  const [mesSelecionado, setMesSelecionado] = useState<string>(
    opcoesMeses[0]?.valor ?? mesAnoAtual(),
  );

  // Garante que o mês atualmente selecionado apareça no <select>, mesmo que
  // ele não tenha nenhuma categoria com movimentação (navegado via setas ‹ ›)
  const opcoesMesesParaExibir = useMemo(() => {
    if (opcoesMeses.some((o) => o.valor === mesSelecionado)) {
      return opcoesMeses;
    }
    const combinadas = [
      ...opcoesMeses,
      { valor: mesSelecionado, rotulo: formatarRotuloMesAno(mesSelecionado) },
    ];
    return combinadas.sort((a, b) => b.valor.localeCompare(a.valor));
  }, [opcoesMeses, mesSelecionado]);

  const [termoBusca, setTermoBusca] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<"todas" | TipoTransacao>(
    "todas",
  );
  const [filtroStatus, setFiltroStatus] = useState<
    "todas" | "ativas" | "inativas"
  >("ativas");
  const [filtroUso, setFiltroUso] = useState<"todas" | "usadas" | "sem-uso">(
    "todas",
  );
  const [ordenacao, setOrdenacao] = useState<"ordem" | "nome" | "valor">(
    "ordem",
  );

  // Controle dos modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null,
  );
  const [categoriaParaExcluir, setCategoriaParaExcluir] =
    useState<Categoria | null>(null);

  // Estatísticas de uso de cada categoria, calculadas a partir dos
  // lançamentos reais (fonte única de verdade — nada de números fictícios).
  // "Total gasto/transações" respeita o mês de referência selecionado;
  // "última vez usada" olha o histórico inteiro, pra ajudar a decidir o
  // que arquivar mesmo que o mês atual não tenha nenhum lançamento.
  const statsPorCategoria = useMemo(() => {
    const mapa = new Map<
      string,
      { totalGastoMes: number; totalTransacoes: number }
    >();

    lancamentos
      .filter((lanc) => mesAnoDeData(lanc.data) === mesSelecionado)
      .forEach((lanc) => {
        const atual = mapa.get(lanc.categoriaId) ?? {
          totalGastoMes: 0,
          totalTransacoes: 0,
        };
        atual.totalGastoMes += lanc.valor;
        atual.totalTransacoes += 1;
        mapa.set(lanc.categoriaId, atual);
      });

    return mapa;
  }, [lancamentos, mesSelecionado]);

  // Última vez que cada categoria foi usada, considerando todo o histórico
  const ultimoUsoPorCategoria = useMemo(() => {
    const mapa = new Map<string, string>();

    lancamentos.forEach((lanc) => {
      const dataAtual = paraObjetoData(mapa.get(lanc.categoriaId) ?? "");
      const dataLanc = paraObjetoData(lanc.data);
      if (!dataAtual || (dataLanc && dataLanc > dataAtual)) {
        mapa.set(lanc.categoriaId, lanc.data);
      }
    });

    return mapa;
  }, [lancamentos]);

  const categoriasComStats = useMemo(() => {
    return categorias.map((cat) => {
      const stats = statsPorCategoria.get(cat.id);
      const ultimaData = ultimoUsoPorCategoria.get(cat.id);
      return {
        ...cat,
        totalGastoMes: stats?.totalGastoMes ?? 0,
        totalTransacoes: stats?.totalTransacoes ?? 0,
        ultimaTransacao: ultimaData
          ? formatarDataRelativa(ultimaData)
          : "Nunca usada",
      };
    });
  }, [categorias, statsPorCategoria, ultimoUsoPorCategoria]);

  // Totais para cálculo de porcentagem e métricas
  const totalDespesasGeral = useMemo(() => {
    return categoriasComStats
      .filter((c) => c.tipo === "despesa")
      .reduce((acc, c) => acc + c.totalGastoMes, 0);
  }, [categoriasComStats]);

  const totalReceitasGeral = useMemo(() => {
    return categoriasComStats
      .filter((c) => c.tipo === "receita")
      .reduce((acc, c) => acc + c.totalGastoMes, 0);
  }, [categoriasComStats]);

  // Categoria mais utilizada (com maior número de transações)
  const categoriaMaisUtilizada = useMemo(() => {
    const usadas = categoriasComStats.filter((c) => c.totalTransacoes > 0);
    if (usadas.length === 0) return "---";
    return [...usadas].sort(
      (a, b) => b.totalTransacoes - a.totalTransacoes,
    )[0].nome;
  }, [categoriasComStats]);

  // Filtragem e Ordenação dinâmica
  const categoriasFiltradas = useMemo(() => {
    return categoriasComStats
      .filter((cat) => {
        const bateuBusca = cat.nome
          .toLowerCase()
          .includes(termoBusca.toLowerCase());
        const bateuTipo = filtroTipo === "todas" || cat.tipo === filtroTipo;
        const bateuStatus =
          filtroStatus === "todas" ||
          (filtroStatus === "ativas" ? cat.ativa : !cat.ativa);
        const bateuUso =
          filtroUso === "todas" ||
          (filtroUso === "usadas"
            ? cat.totalTransacoes > 0
            : cat.totalTransacoes === 0);
        return bateuBusca && bateuTipo && bateuStatus && bateuUso;
      })
      .sort((a, b) => {
        if (ordenacao === "valor") {
          return b.totalGastoMes - a.totalGastoMes;
        }
        if (ordenacao === "nome") {
          return a.nome.localeCompare(b.nome);
        }
        // "ordem": agrupa por tipo e respeita o campo manual de ordenação
        if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo);
        return a.ordem - b.ordem;
      });
  }, [categoriasComStats, termoBusca, filtroTipo, filtroStatus, filtroUso, ordenacao]);

  const handleAbrirNovaCategoria = () => {
    setCategoriaEditando(null);
    setIsModalOpen(true);
  };

  const handleAbrirEdicao = (cat: Categoria) => {
    setCategoriaEditando(cat);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Header Padronizado */}
      <HeaderCategoria
        mesSelecionado={mesSelecionado}
        onAlterarMes={setMesSelecionado}
        onMesAnterior={() =>
          setMesSelecionado((atual) => deslocarMesAno(atual, -1))
        }
        onProximoMes={() =>
          setMesSelecionado((atual) => deslocarMesAno(atual, 1))
        }
        opcoesMeses={opcoesMesesParaExibir}
        onNovaCategoria={handleAbrirNovaCategoria}
      />

      <div className="space-y-6">
        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          {/* Input de Busca */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
            />
          </div>

          {/* Controles de Filtro e Ordenação */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(e.target.value as "todas" | TipoTransacao)
              }
              className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="todas">Todos os Tipos</option>
              <option value="despesa">Apenas Despesas</option>
              <option value="receita">Apenas Receitas</option>
            </select>

            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(
                  e.target.value as "todas" | "ativas" | "inativas",
                )
              }
              className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="ativas">Somente Ativas</option>
              <option value="inativas">Somente Inativas</option>
              <option value="todas">Ativas e Inativas</option>
            </select>

            <select
              value={filtroUso}
              onChange={(e) =>
                setFiltroUso(e.target.value as "todas" | "usadas" | "sem-uso")
              }
              className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="todas">Qualquer Uso</option>
              <option value="usadas">Com Lançamentos</option>
              <option value="sem-uso">Sem Uso</option>
            </select>

            <select
              value={ordenacao}
              onChange={(e) =>
                setOrdenacao(e.target.value as "ordem" | "nome" | "valor")
              }
              className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="ordem">Ordem Manual</option>
              <option value="valor">Ordenar por Valor</option>
              <option value="nome">Ordenar por Nome (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Métricas de Resumo (KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Categorias
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {categorias.length}
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Despesas
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {categorias.filter((c) => c.tipo === "despesa").length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-brand">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Receitas
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {categorias.filter((c) => c.tipo === "receita").length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mais Utilizada
              </p>
              <p className="text-lg font-bold text-slate-800 mt-1 truncate max-w-35">
                {categoriaMaisUtilizada}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Grid de Cards de Categoria */}
        {categoriasFiltradas.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-xs">
            <p className="text-slate-500 font-medium">
              Nenhuma categoria encontrada com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasFiltradas.map((cat) => {
              const baseTotal =
                cat.tipo === "despesa"
                  ? totalDespesasGeral
                  : totalReceitasGeral;
              const percentualDoTotal =
                baseTotal > 0
                  ? Math.round((cat.totalGastoMes / baseTotal) * 100)
                  : 0;
              const percentualDoOrcamento = cat.orcamentoMensal
                ? Math.round((cat.totalGastoMes / cat.orcamentoMensal) * 100)
                : null;
              const estourouOrcamento =
                percentualDoOrcamento !== null && percentualDoOrcamento > 100;

              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                    cat.ativa ? "" : "opacity-60"
                  }`}
                >
                  <div>
                    {/* Topo do Card */}
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${cat.cor}1A` }}
                        >
                          {cat.icone}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 truncate">
                          {cat.nome}
                        </h3>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            cat.tipo === "despesa"
                              ? "bg-red-100 text-brand"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {cat.tipo}
                        </span>
                        {!cat.ativa && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                            Inativa
                          </span>
                        )}
                        {cat.padrao && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                            Padrão
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Valor do Mês */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 font-medium">
                        {cat.tipo === "despesa"
                          ? "Total gasto neste mês"
                          : "Total recebido neste mês"}
                      </p>
                      <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                        R${" "}
                        {cat.totalGastoMes.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    {/* Barra de Progresso / Porcentagem */}
                    <div className="space-y-1.5 mb-6">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            estourouOrcamento
                              ? "bg-rose-600"
                              : cat.tipo === "despesa"
                                ? "bg-brand"
                                : "bg-emerald-600"
                          }`}
                          style={{
                            width: `${Math.min(percentualDoOrcamento ?? percentualDoTotal, 100)}%`,
                          }}
                        />
                      </div>
                      <p
                        className={`text-xs text-right font-medium ${
                          estourouOrcamento ? "text-rose-600" : "text-slate-500"
                        }`}
                      >
                        {percentualDoOrcamento !== null
                          ? `${percentualDoOrcamento}% do orçamento (R$ ${cat.orcamentoMensal!.toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 },
                            )})`
                          : `${percentualDoTotal}% dos ${
                              cat.tipo === "despesa"
                                ? "gastos do mês"
                                : "receitas do mês"
                            }`}
                      </p>
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 mb-3">
                      <span>{cat.totalTransacoes} transações</span>
                      <span>Última: {cat.ultimaTransacao}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moverOrdemCategoria(cat.id, "cima")}
                          disabled={ordenacao !== "ordem"}
                          title="Mover para cima"
                          aria-label="Mover categoria para cima"
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverOrdemCategoria(cat.id, "baixo")}
                          disabled={ordenacao !== "ordem"}
                          title="Mover para baixo"
                          aria-label="Mover categoria para baixo"
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => alternarAtivaCategoria(cat.id)}
                          title={cat.ativa ? "Desativar" : "Ativar"}
                          aria-label={
                            cat.ativa ? "Desativar categoria" : "Ativar categoria"
                          }
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            cat.ativa
                              ? "text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100"
                              : "text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAbrirEdicao(cat)}
                          title="Editar"
                          aria-label="Editar categoria"
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoriaParaExcluir(cat)}
                          disabled={cat.padrao}
                          title={
                            cat.padrao
                              ? "Categoria padrão não pode ser excluída"
                              : "Excluir"
                          }
                          aria-label="Excluir categoria"
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição de Categoria */}
      <ModalNovaCategoria
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoriaEditando={categoriaEditando}
        tipoSugerido={filtroTipo === "todas" ? "despesa" : filtroTipo}
      />

      {/* Modal de Exclusão com tratamento de vínculo */}
      <ModalExcluirCategoria
        isOpen={categoriaParaExcluir !== null}
        onClose={() => setCategoriaParaExcluir(null)}
        categoria={categoriaParaExcluir}
      />
    </>
  );
}
