import { useState, useEffect } from "react";
import {
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Repeat,
  Info,
} from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { dataParaISO, dataParaBR } from "../../utils/dataUtils";
import { formatarValorMonetario } from "../../utils/valorUtils";
import {
  ROTULOS_CARTEIRA,
  ROTULOS_TIPO_CONTA,
  formaParaConta,
  formatarMoeda,
  saldosDoBeneficio,
  tiposDeContaParaForma,
} from "../../utils/contaUtils";
import ModalCategoriaRapida from "./ModalCategoriaRapida";
import type {
  CarteiraBeneficio,
  Conta,
  TipoConta,
  TipoTransacao,
  TipoGasto,
  Lancamento,
} from "../../types/financeiro";

// Ordem dos grupos no seletor de conta
const ORDEM_TIPOS_CONTA: TipoConta[] = [
  "cartao_credito",
  "beneficio",
  "conta_corrente",
  "carteira_digital",
  "dinheiro",
];

// Data de hoje (yyyy-mm-dd) no fuso do dispositivo. toISOString() usa UTC
// e, no Brasil, depois das 21h já devolveria o dia seguinte.
function hojeISO(): string {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

// Saldo inicial para um cartão benefício: mantém o atual se o cartão o
// tiver; senão, o primeiro saldo do cartão.
function carteiraPara(conta: Conta | undefined, atual: CarteiraBeneficio | ""): CarteiraBeneficio | "" {
  if (conta?.tipo !== "beneficio") return "";
  const disponiveis = conta.carteiras ?? [];
  return atual && disponiveis.includes(atual) ? atual : (disponiveis[0] ?? "");
}

// Opções de parcelamento oferecidas no cadastro de uma despesa variável.
const OPCOES_PARCELAS = Array.from({ length: 24 }, (_, i) => i + 1);

interface DrawerLancamentoProps {
  isOpen: boolean;
  onClose: () => void;
  // Quando presente, o drawer entra em modo de edição desse lançamento
  lancamentoEditando?: Lancamento | null;
  // Ao criar: já abre com esta conta/cartão e este tipo selecionados
  // (usado pelos botões da tela Contas e Cartões)
  contaInicialId?: string;
  tipoInicial?: TipoTransacao;
}

export default function DrawerLancamento({
  isOpen,
  onClose,
  lancamentoEditando = null,
  contaInicialId,
  tipoInicial,
}: DrawerLancamentoProps) {
  const {
    categorias,
    contas,
    lancamentos,
    adicionarLancamento,
    editarLancamento,
  } = useFinance();
  const emEdicao = lancamentoEditando !== null;

  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoTransacao>("receita");
  const [tipoGasto, setTipoGasto] = useState<TipoGasto>("variavel");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("2026-08-08");
  const [formaPagamento, setFormaPagamento] =
    useState<Lancamento["formaPagamento"]>("Pix");
  const [observacao, setObservacao] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [contaId, setContaId] = useState("");
  const [carteira, setCarteira] = useState<CarteiraBeneficio | "">("");

  // Preenche (ou limpa) o formulário sempre que o drawer é aberto
  useEffect(() => {
    if (!isOpen) return;

    if (lancamentoEditando) {
      setTipo(lancamentoEditando.tipo);
      setTipoGasto(lancamentoEditando.tipoGasto ?? "variavel");
      setDescricao(lancamentoEditando.descricao);
      setCategoriaId(lancamentoEditando.categoriaId);
      setValor(String(lancamentoEditando.valor).replace(".", ","));
      setData(dataParaISO(lancamentoEditando.data));
      setFormaPagamento(lancamentoEditando.formaPagamento);
      setObservacao(lancamentoEditando.observacao ?? "");
      setParcelas(1);
      setContaId(lancamentoEditando.contaId ?? "");
      setCarteira(lancamentoEditando.carteira ?? "");
    } else {
      const contaInicial = contas.find((c) => c.id === contaInicialId);
      setTipo(tipoInicial ?? (contaInicial ? "despesa" : "receita"));
      setTipoGasto("variavel");
      setDescricao("");
      setCategoriaId("");
      setValor("");
      setData(hojeISO());
      setFormaPagamento(contaInicial ? formaParaConta(contaInicial.tipo, "Pix") : "Pix");
      setObservacao("");
      setParcelas(1);
      setContaId(contaInicial?.id ?? "");
      setCarteira(carteiraPara(contaInicial, ""));
    }
    // "contas" fica de fora de propósito: mudar uma conta em outra aba não
    // deve apagar o que a pessoa está digitando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lancamentoEditando, contaInicialId, tipoInicial]);

  // Parcelamento só faz sentido para uma despesa variável nova — uma
  // despesa fixa já se repete sozinha todo mês, e o número de parcelas de
  // uma compra já lançada não pode mais ser alterado.
  const podeParcelar =
    !emEdicao && tipo === "despesa" && tipoGasto === "variavel";

  if (!isOpen) return null;

  // Todas as contas ativas (mais a já vinculada, mesmo inativa), agrupadas
  // por tipo no seletor. Escolher a conta define a forma de pagamento.
  const contasSelecionaveis = contas
    .filter((c) => c.ativa || c.id === contaId)
    .sort((a, b) => a.ordem - b.ordem);
  const gruposDeContas = ORDEM_TIPOS_CONTA.map((tipoConta) => ({
    tipoConta,
    contas: contasSelecionaveis.filter((c) => c.tipo === tipoConta),
  })).filter((grupo) => grupo.contas.length > 0);
  const contaSelecionada = contas.find((c) => c.id === contaId);
  const saldos =
    contaSelecionada?.tipo === "beneficio"
      ? saldosDoBeneficio(contaSelecionada, lancamentos)
      : null;

  const handleTrocarConta = (novoId: string) => {
    setContaId(novoId);
    const conta = contas.find((c) => c.id === novoId);
    if (conta) setFormaPagamento(formaParaConta(conta.tipo, formaPagamento));
    setCarteira(carteiraPara(conta, carteira));
  };

  // Ao trocar a forma de pagamento, a conta escolhida pode deixar de fazer
  // sentido (ex: conta corrente → Crédito). Se só houver uma conta
  // compatível, já seleciona; senão, limpa.
  const handleTrocarFormaPagamento = (forma: Lancamento["formaPagamento"]) => {
    setFormaPagamento(forma);
    if (contaSelecionada && tiposDeContaParaForma(forma).includes(contaSelecionada.tipo)) {
      return;
    }
    const tipos = tiposDeContaParaForma(forma);
    const opcoes = contas.filter((c) => c.ativa && tipos.includes(c.tipo));
    const nova = opcoes.length === 1 ? opcoes[0] : undefined;
    setContaId(nova?.id ?? "");
    setCarteira(carteiraPara(nova, carteira));
  };

  // Troca o tipo (Receita/Despesa) e reseta a categoria, que não é mais válida
  const handleTrocarTipo = (novoTipo: TipoTransacao) => {
    setTipo(novoTipo);
    setCategoriaId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaId) {
      alert("Selecione uma categoria.");
      return;
    }

    const dadosLancamento = {
      descricao,
      valor: parseFloat(valor.replace(",", ".")),
      // Guardamos sempre no formato dd/mm/yyyy, igual ao resto dos dados
      data: dataParaBR(data),
      tipo,
      // tipoGasto só faz sentido para despesas
      tipoGasto: tipo === "despesa" ? tipoGasto : undefined,
      categoriaId,
      formaPagamento,
      observacao,
      contaId: contaId || undefined,
      carteira:
        contaSelecionada?.tipo === "beneficio" && carteira ? carteira : undefined,
    };

    if (emEdicao && lancamentoEditando) {
      editarLancamento(lancamentoEditando.id, dadosLancamento);
    } else {
      adicionarLancamento(
        dadosLancamento,
        podeParcelar && parcelas > 1 ? { parcelas } : undefined,
      );
    }

    onClose();
  };

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in overflow-y-auto">
        <div>
          {/* Header do Drawer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h2 className="font-bold text-lg text-slate-800">
              {emEdicao ? "Editar Lançamento" : "Novo Lançamento"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            id="form-lancamento"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
          >
            {/* Seletor de Tipo em Abas (Pílulas) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTrocarTipo("receita")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === "receita"
                    ? "bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                Receita
              </button>
              <button
                type="button"
                onClick={() => handleTrocarTipo("despesa")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  tipo === "despesa"
                    ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                Despesa
              </button>
            </div>

            {/* Fixo x Variável — só aparece quando o tipo é Despesa */}
            {tipo === "despesa" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Natureza do gasto
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTipoGasto("fixo")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      tipoGasto === "fixo"
                        ? "bg-white text-brand shadow-xs border border-brand/30"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGasto("variavel")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      tipoGasto === "variavel"
                        ? "bg-white text-brand shadow-xs border border-brand/30"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Variável
                  </button>
                </div>

                {/* Aviso: gasto fixo se repete sozinho todo mês */}
                {tipoGasto === "fixo" && (
                  <div className="mt-2 flex items-start gap-2 bg-red-50 border border-brand/20 rounded-xl p-2.5 text-[11px] text-brand font-medium">
                    <Repeat className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {emEdicao && lancamentoEditando?.recorrenciaFixaId
                        ? "Este lançamento faz parte de uma despesa fixa recorrente. As alterações valem para esta e para as próximas ocorrências ainda não geradas."
                        : "Esse gasto será lançado automaticamente todo mês, até você removê-lo manualmente."}
                    </span>
                  </div>
                )}

                {/* Aviso: parcela de uma compra já parcelada, não editável */}
                {emEdicao && lancamentoEditando?.parcela && (
                  <div className="mt-2 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-500 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Parcela {lancamentoEditando.parcela.numero} de{" "}
                      {lancamentoEditando.parcela.total}. O parcelamento não
                      pode ser alterado depois de criado.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Parcelamento — só para despesa variável nova */}
            {podeParcelar && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parcelamento
                </label>
                <select
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {OPCOES_PARCELAS.map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "À vista (1x)" : `${n}x`}
                    </option>
                  ))}
                </select>
                {parcelas > 1 && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Serão criados {parcelas} lançamentos mensais.
                  </span>
                )}
              </div>
            )}

            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Salário, Freelance..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Categoria + Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                    className="w-full min-w-0 p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Selecione</option>
                    {categoriasFiltradas.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCategoriaModalOpen(true)}
                    title="Criar nova categoria"
                    aria-label="Criar nova categoria"
                    className="shrink-0 w-9 h-9 flex items-center justify-center border border-dashed border-brand text-brand hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) =>
                    setValor(formatarValorMonetario(e.target.value))
                  }
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                {podeParcelar && parcelas > 1 && !!parseFloat(valor.replace(",", ".")) && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {parcelas}x de R${" "}
                    {(parseFloat(valor.replace(",", ".")) / parcelas).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 },
                    )}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 -mt-2.5 block">
              As categorias são filtradas de acordo com o tipo.
            </span>

            {/* Conta / Cartão — escolher aqui já ajusta a forma de pagamento */}
            <div>
              <label
                htmlFor="lancamento-conta"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Conta ou cartão{" "}
                <span className="text-slate-400 font-normal normal-case">
                  (opcional)
                </span>
              </label>
              {gruposDeContas.length > 0 ? (
                <select
                  id="lancamento-conta"
                  value={contaId}
                  onChange={(e) => handleTrocarConta(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Nenhuma</option>
                  {gruposDeContas.map((grupo) => (
                    <optgroup key={grupo.tipoConta} label={ROTULOS_TIPO_CONTA[grupo.tipoConta]}>
                      {grupo.contas.map((conta) => (
                        <option key={conta.id} value={conta.id}>
                          {conta.nome}
                          {conta.ultimosDigitos ? ` •••• ${conta.ultimosDigitos}` : ""}
                          {!conta.ativa ? " (inativa)" : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl p-2.5">
                  Nenhuma conta cadastrada. Cadastre em Contas e Cartões para
                  saber de onde sai cada gasto.
                </p>
              )}
            </div>

            {/* Saldo do cartão benefício — alimentação, refeição... */}
            {contaSelecionada?.tipo === "beneficio" && (
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {tipo === "receita" ? "Creditar no saldo" : "Usar o saldo"}
                </span>
                {(contaSelecionada.carteiras ?? []).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {(contaSelecionada.carteiras ?? []).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCarteira(c)}
                        aria-pressed={carteira === c}
                        className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${
                          carteira === c
                            ? "border-brand/40 bg-red-50 text-brand"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs font-bold">{ROTULOS_CARTEIRA[c]}</span>
                        <span className="text-[10px] font-semibold opacity-80">
                          Saldo {formatarMoeda(saldos?.[c] ?? 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl p-2.5">
                    Este cartão não tem saldos configurados. Edite-o em Contas e Cartões.
                  </p>
                )}
              </div>
            )}

            {/* Data + Forma de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Forma de pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) =>
                    handleTrocarFormaPagamento(
                      e.target.value as Lancamento["formaPagamento"],
                    )
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Pix">Pix</option>
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Benefício">Benefício (VA/VR)</option>
                </select>
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observação{" "}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Adicione uma observação..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
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
            form="form-lancamento"
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors"
          >
            {emEdicao ? "Salvar Alterações" : "Salvar Lançamento"}
          </button>
        </div>
      </div>

      {/* Modal rápido para criar categoria sem sair do lançamento */}
      <ModalCategoriaRapida
        isOpen={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        tipoInicial={tipo}
        onCriada={(categoriaCriada) => setCategoriaId(categoriaCriada.id)}
      />
    </div>
  );
}
