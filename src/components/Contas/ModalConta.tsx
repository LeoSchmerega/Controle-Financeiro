// src/components/Contas/ModalConta.tsx
// Drawer de criação/edição de conta ou cartão. Para cartão de crédito pede
// também fechamento, vencimento e limite — nunca número completo, validade
// ou CVV, que o app não precisa e não deve guardar.
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CreditCard, ShieldCheck, X } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { PALETA_CORES } from "../../utils/paletaVisual";
import { formatarValorMonetario } from "../../utils/valorUtils";
import {
  CARTEIRAS_BENEFICIO,
  ROTULOS_CARTEIRA,
  ROTULOS_TIPO_CONTA,
} from "../../utils/contaUtils";
import type { CarteiraBeneficio, Conta, TipoConta } from "../../types/financeiro";

const TIPOS: TipoConta[] = [
  "cartao_credito",
  "beneficio",
  "conta_corrente",
  "carteira_digital",
  "dinheiro",
];
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

const classeCampo =
  "w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand";
const classeRotulo =
  "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1";

interface ModalContaProps {
  isOpen: boolean;
  onClose: () => void;
  contaEditando?: Conta | null;
}

export default function ModalConta({
  isOpen,
  onClose,
  contaEditando = null,
}: ModalContaProps) {
  const { contas, adicionarConta, editarConta } = useFinance();
  const emEdicao = contaEditando !== null;

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoConta>("cartao_credito");
  const [cor, setCor] = useState<string>(PALETA_CORES[0]);
  const [ultimosDigitos, setUltimosDigitos] = useState("");
  const [diaFechamento, setDiaFechamento] = useState(1);
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [limite, setLimite] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [carteiras, setCarteiras] =
    useState<CarteiraBeneficio[]>(CARTEIRAS_BENEFICIO);

  // Preenche (ou limpa) o formulário ao abrir
  useEffect(() => {
    if (!isOpen) return;
    if (contaEditando) {
      setNome(contaEditando.nome);
      setTipo(contaEditando.tipo);
      setCor(contaEditando.cor);
      setUltimosDigitos(contaEditando.ultimosDigitos ?? "");
      setDiaFechamento(contaEditando.diaFechamento ?? 1);
      setDiaVencimento(contaEditando.diaVencimento ?? 10);
      setLimite(
        contaEditando.limite !== undefined
          ? String(contaEditando.limite).replace(".", ",")
          : "",
      );
      setAtiva(contaEditando.ativa);
      setCarteiras(contaEditando.carteiras ?? CARTEIRAS_BENEFICIO);
    } else {
      setNome("");
      setTipo("cartao_credito");
      setCor(PALETA_CORES[contas.length % PALETA_CORES.length]);
      setUltimosDigitos("");
      setDiaFechamento(1);
      setDiaVencimento(10);
      setLimite("");
      setAtiva(true);
      setCarteiras(CARTEIRAS_BENEFICIO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contaEditando]);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ehCartao = tipo === "cartao_credito";
  const ehBeneficio = tipo === "beneficio";

  const alternarCarteira = (c: CarteiraBeneficio) =>
    setCarteiras((atuais) =>
      atuais.includes(c)
        ? atuais.filter((x) => x !== c)
        : CARTEIRAS_BENEFICIO.filter((x) => x === c || atuais.includes(x)),
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    if (ehBeneficio && carteiras.length === 0) return;

    const dados = {
      nome: nome.trim(),
      tipo,
      cor,
      ativa,
      // Campos de cartão só existem para cartão de crédito
      ultimosDigitos:
        ehCartao && ultimosDigitos.length === 4 ? ultimosDigitos : undefined,
      diaFechamento: ehCartao ? diaFechamento : undefined,
      diaVencimento: ehCartao ? diaVencimento : undefined,
      limite:
        ehCartao && limite ? parseFloat(limite.replace(",", ".")) : undefined,
      carteiras: ehBeneficio ? carteiras : undefined,
    };

    if (emEdicao && contaEditando) {
      editarConta(contaEditando.id, dados);
    } else {
      adicionarConta(dados);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-conta-titulo"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-in overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
              <h2 id="modal-conta-titulo" className="font-bold text-lg text-slate-800">
                {emEdicao ? "Editar Conta" : "Nova Conta ou Cartão"}
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              aria-label="Fechar"
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="form-conta" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Tipo */}
            <div>
              <span className={classeRotulo}>Tipo</span>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    aria-pressed={tipo === t}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tipo === t
                        ? "bg-white text-brand shadow-xs border border-brand/30"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {ROTULOS_TIPO_CONTA[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div>
              <label htmlFor="conta-nome" className={classeRotulo}>
                Apelido
              </label>
              <input
                id="conta-nome"
                type="text"
                placeholder={
                  ehCartao
                    ? "Ex: Nubank, Inter Black..."
                    : ehBeneficio
                      ? "Ex: Caju, Flash, VR..."
                      : "Ex: Itaú, Carteira..."
                }
                value={nome}
                maxLength={40}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                className={classeCampo}
              />
            </div>

            {ehCartao && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="conta-fechamento" className={classeRotulo}>
                      Fecha dia
                    </label>
                    <select
                      id="conta-fechamento"
                      value={diaFechamento}
                      onChange={(e) => setDiaFechamento(Number(e.target.value))}
                      className={classeCampo}
                    >
                      {DIAS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="conta-vencimento" className={classeRotulo}>
                      Vence dia
                    </label>
                    <select
                      id="conta-vencimento"
                      value={diaVencimento}
                      onChange={(e) => setDiaVencimento(Number(e.target.value))}
                      className={classeCampo}
                    >
                      {DIAS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 -mt-2.5 block">
                  Compras a partir do dia do fechamento entram na fatura seguinte.
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="conta-limite" className={classeRotulo}>
                      Limite (R$){" "}
                      <span className="text-slate-400 font-normal normal-case">opcional</span>
                    </label>
                    <input
                      id="conta-limite"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={limite}
                      onChange={(e) => setLimite(formatarValorMonetario(e.target.value))}
                      className={classeCampo}
                    />
                  </div>
                  <div>
                    <label htmlFor="conta-digitos" className={classeRotulo}>
                      Final{" "}
                      <span className="text-slate-400 font-normal normal-case">opcional</span>
                    </label>
                    <input
                      id="conta-digitos"
                      type="text"
                      inputMode="numeric"
                      placeholder="1234"
                      value={ultimosDigitos}
                      onChange={(e) =>
                        setUltimosDigitos(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className={classeCampo}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    Nunca pedimos o número completo, a validade ou o código de
                    segurança do cartão. O final serve só para diferenciar
                    cartões parecidos.
                  </span>
                </div>
              </>
            )}

            {ehBeneficio && (
              <div>
                <span className={classeRotulo}>Saldos do cartão</span>
                <div className="grid grid-cols-2 gap-2">
                  {CARTEIRAS_BENEFICIO.map((c) => (
                    <label
                      key={c}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer select-none transition-colors ${
                        carteiras.includes(c)
                          ? "border-brand/40 bg-red-50 text-brand"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={carteiras.includes(c)}
                        onChange={() => alternarCarteira(c)}
                        className="w-4 h-4 accent-brand cursor-pointer"
                      />
                      {ROTULOS_CARTEIRA[c]}
                    </label>
                  ))}
                </div>
                <span
                  className={`text-[10px] mt-1 block ${
                    carteiras.length === 0 ? "text-red-600" : "text-slate-400"
                  }`}
                >
                  {carteiras.length === 0
                    ? "Marque pelo menos um saldo."
                    : "Cada saldo é controlado separadamente: o que entra em Refeição só sai de Refeição."}
                </span>
              </div>
            )}

            {/* Cor */}
            <div>
              <span className={classeRotulo}>Cor</span>
              <div className="flex flex-wrap gap-2">
                {PALETA_CORES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(c)}
                    aria-label={`Selecionar cor ${c}`}
                    aria-pressed={cor === c}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                      cor === c ? "ring-2 ring-offset-2 ring-slate-400" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {emEdicao && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  className="w-4 h-4 accent-brand cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Conta ativa</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (inativas somem do lançamento, mas mantêm o histórico)
                </span>
              </label>
            )}
          </form>
        </div>

        <div className="pt-4 border-t border-slate-100 flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-conta"
            className="w-1/2 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-hover shadow-md transition-colors cursor-pointer"
          >
            {emEdicao ? "Salvar Alterações" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
