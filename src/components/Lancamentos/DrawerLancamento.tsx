import { useState, useEffect } from "react";
import { X, ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { dataParaISO, dataParaBR } from "../../utils/dataUtils";
import { formatarValorMonetario } from "../../utils/valorUtils";
import ModalCategoriaRapida from "./ModalCategoriaRapida";
import type {
  TipoTransacao,
  TipoGasto,
  Lancamento,
} from "../../types/financeiro";

interface DrawerLancamentoProps {
  isOpen: boolean;
  onClose: () => void;
  // Quando presente, o drawer entra em modo de edição desse lançamento
  lancamentoEditando?: Lancamento | null;
}

export default function DrawerLancamento({
  isOpen,
  onClose,
  lancamentoEditando = null,
}: DrawerLancamentoProps) {
  const { categorias, adicionarLancamento, editarLancamento } = useFinance();
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
    } else {
      setTipo("receita");
      setTipoGasto("variavel");
      setDescricao("");
      setCategoriaId("");
      setValor("");
      setData(new Date().toISOString().slice(0, 10));
      setFormaPagamento("Pix");
      setObservacao("");
    }
  }, [isOpen, lancamentoEditando]);

  if (!isOpen) return null;

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
    };

    if (emEdicao && lancamentoEditando) {
      editarLancamento(lancamentoEditando.id, dadosLancamento);
    } else {
      adicionarLancamento(dadosLancamento);
    }

    onClose();
  };

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
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
              </div>
            </div>
            <span className="text-[10px] text-slate-400 -mt-2.5 block">
              As categorias são filtradas de acordo com o tipo.
            </span>

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
                    setFormaPagamento(
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
