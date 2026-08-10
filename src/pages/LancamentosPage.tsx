import { useState, useMemo } from "react";
import DrawerLancamento from "../components/Lancamentos/DrawerLancamento";
import CardsResumo from "../components/Lancamentos/CardsResumo";
import TabelaLancamentos from "../components/Lancamentos/TabelaLancamentos";
import { useFinance } from "../context/FinanceContext";
import {
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  paraObjetoData,
  mesAnoDeData,
  mesAnoAtual,
  gerarOpcoesMesAno,
  deslocarMesAno,
  formatarRotuloMesAno,
} from "../utils/dataUtils";
import { calcularTotaisLancamentos } from "../utils/financeiroUtils";
import type {
  TipoTransacao,
  TipoGasto,
  Lancamento,
} from "../types/financeiro";

const FORMAS_PAGAMENTO: Lancamento["formaPagamento"][] = [
  "Pix",
  "Débito",
  "Crédito",
  "Dinheiro",
  "Boleto",
];

export default function LancamentosPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] =
    useState<Lancamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoTransacao>(
    "todos",
  );
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroTipoGasto, setFiltroTipoGasto] = useState<"todos" | TipoGasto>(
    "todos",
  );
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] =
    useState(false);

  const { lancamentos, categorias, removerLancamento } = useFinance();

  // Opções de mês de referência, geradas a partir das datas já lançadas
  const opcoesMeses = useMemo(
    () => gerarOpcoesMesAno(lancamentos.map((l) => l.data)),
    [lancamentos],
  );
  const [mesSelecionado, setMesSelecionado] = useState<string>(
    opcoesMeses[0]?.valor ?? mesAnoAtual(),
  );

  // Garante que o mês atualmente selecionado apareça no <select>, mesmo que
  // ele não tenha nenhum lançamento (navegado via setas ‹ ›)
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

  // Só os lançamentos do mês de referência selecionado
  const lancamentosDoMes = useMemo(
    () =>
      lancamentos.filter((item) => mesAnoDeData(item.data) === mesSelecionado),
    [lancamentos, mesSelecionado],
  );

  // Totais dos Cards de Resumo recalculados apenas com o mês selecionado
  const totaisDoMes = useMemo(
    () => calcularTotaisLancamentos(lancamentosDoMes),
    [lancamentosDoMes],
  );

  // Categorias exibidas no select respeitam o tipo já selecionado
  const categoriasDoFiltro = useMemo(() => {
    if (filtroTipo === "todos") return categorias;
    return categorias.filter((c) => c.tipo === filtroTipo);
  }, [categorias, filtroTipo]);

  const filtrosAtivos =
    (filtroTipo !== "todos" ? 1 : 0) +
    (filtroCategoria !== "todas" ? 1 : 0) +
    (filtroTipoGasto !== "todos" ? 1 : 0) +
    (filtroFormaPagamento !== "todas" ? 1 : 0) +
    (dataInicio ? 1 : 0) +
    (dataFim ? 1 : 0);

  const limparFiltros = () => {
    setFiltroTipo("todos");
    setFiltroCategoria("todas");
    setFiltroTipoGasto("todos");
    setFiltroFormaPagamento("todas");
    setDataInicio("");
    setDataFim("");
  };

  // Filtra os lançamentos com base na busca e em todos os filtros selecionados
  const lancamentosFiltrados = useMemo(() => {
    const inicio = paraObjetoData(dataInicio);
    const fim = paraObjetoData(dataFim);

    return lancamentosDoMes.filter((item) => {
      const bateuBusca = busca
        ? item.descricao.toLowerCase().includes(busca.toLowerCase())
        : true;
      const bateuTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
      const bateuCategoria =
        filtroCategoria === "todas" || item.categoriaId === filtroCategoria;
      const bateuTipoGasto =
        filtroTipoGasto === "todos" || item.tipoGasto === filtroTipoGasto;
      const bateuForma =
        filtroFormaPagamento === "todas" ||
        item.formaPagamento === filtroFormaPagamento;

      const dataItem = paraObjetoData(item.data);
      const bateuInicio = !inicio || (dataItem && dataItem >= inicio);
      const bateuFim = !fim || (dataItem && dataItem <= fim);

      return (
        bateuBusca &&
        bateuTipo &&
        bateuCategoria &&
        bateuTipoGasto &&
        bateuForma &&
        bateuInicio &&
        bateuFim
      );
    });
  }, [
    lancamentosDoMes,
    busca,
    filtroTipo,
    filtroCategoria,
    filtroTipoGasto,
    filtroFormaPagamento,
    dataInicio,
    dataFim,
  ]);

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lançamentos Financeiros
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Gerencie suas receitas e despesas em um só lugar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white px-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <button
              type="button"
              onClick={() => setMesSelecionado((atual) => deslocarMesAno(atual, -1))}
              aria-label="Mês anterior"
              title="Mês anterior"
              className="p-1 text-slate-400 hover:text-brand rounded-md hover:bg-red-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              {opcoesMesesParaExibir.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMesSelecionado((atual) => deslocarMesAno(atual, 1))}
              aria-label="Próximo mês"
              title="Próximo mês"
              className="p-1 text-slate-400 hover:text-brand rounded-md hover:bg-red-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setLancamentoEditando(null);
              setIsDrawerOpen(true);
            }}
            className="bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo — refletem apenas o mês de referência selecionado */}
      <CardsResumo totais={totaisDoMes} />

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 min-w-60">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar lançamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value as "todos" | TipoTransacao);
              setFiltroCategoria("todas");
            }}
            className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="todos">Todos os tipos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="p-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="todas">Todas as categorias</option>
            {categoriasDoFiltro.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          <button
            onClick={() => setMostrarFiltrosAvancados((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              mostrarFiltrosAvancados || filtrosAtivos > 0
                ? "border-brand/30 bg-red-50 text-brand"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {filtrosAtivos > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold">
                {filtrosAtivos}
              </span>
            )}
          </button>

          {filtrosAtivos > 0 && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-brand cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      {mostrarFiltrosAvancados && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 border border-slate-200 rounded-xl mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Natureza do gasto
            </label>
            <select
              value={filtroTipoGasto}
              onChange={(e) =>
                setFiltroTipoGasto(e.target.value as "todos" | TipoGasto)
              }
              className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="todos">Todas</option>
              <option value="fixo">Fixo</option>
              <option value="variavel">Variável</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Forma de pagamento
            </label>
            <select
              value={filtroFormaPagamento}
              onChange={(e) => setFiltroFormaPagamento(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="todas">Todas</option>
              {FORMAS_PAGAMENTO.map((forma) => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              De
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Até
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      )}

      {/* Tabela Principal Componentizada */}
      <TabelaLancamentos
        lancamentos={lancamentosFiltrados}
        categorias={categorias}
        busca={busca}
        onRemover={removerLancamento}
        onEditar={(lancamento) => {
          setLancamentoEditando(lancamento);
          setIsDrawerOpen(true);
        }}
      />

      {/* Drawer do Formulário */}
      <DrawerLancamento
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lancamentoEditando={lancamentoEditando}
      />
    </>
  );
}
