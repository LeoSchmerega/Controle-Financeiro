// src/pages/ContasPage.tsx
// Contas e cartões do usuário. Cartões mostram a fatura aberta e o limite;
// as demais contas mostram o que entrou e saiu no mês atual.
import { useMemo, useState } from "react";
import { CreditCard, Edit2, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import ModalConta from "../components/Contas/ModalConta";
import ModalFatura from "../components/Contas/ModalFatura";
import type { Conta } from "../types/financeiro";
import {
  ROTULOS_TIPO_CONTA,
  formatarDiaMes,
  formatarMoeda,
  resumoDoCartao,
} from "../utils/contaUtils";
import { mesAnoAtual, mesAnoDeData } from "../utils/dataUtils";

export default function ContasPage() {
  const { contas, lancamentos, removerConta, contarLancamentosPorConta } =
    useFinance();
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [faturaDe, setFaturaDe] = useState<Conta | null>(null);
  const [excluindo, setExcluindo] = useState<Conta | null>(null);

  const ordenadas = useMemo(
    () =>
      [...contas].sort(
        (a, b) => Number(b.ativa) - Number(a.ativa) || a.ordem - b.ordem,
      ),
    [contas],
  );

  // Entradas e saídas do mês atual por conta (para contas que não são cartão)
  const movimentoDoMes = useMemo(() => {
    const mes = mesAnoAtual();
    const mapa = new Map<string, { entradas: number; saidas: number }>();
    lancamentos.forEach((l) => {
      if (!l.contaId || mesAnoDeData(l.data) !== mes) return;
      const atual = mapa.get(l.contaId) ?? { entradas: 0, saidas: 0 };
      if (l.tipo === "receita") atual.entradas += l.valor;
      else atual.saidas += l.valor;
      mapa.set(l.contaId, atual);
    });
    return mapa;
  }, [lancamentos]);

  const abrirNova = () => {
    setContaEditando(null);
    setModalAberto(true);
  };
  const abrirEdicao = (conta: Conta) => {
    setContaEditando(conta);
    setModalAberto(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Contas e Cartões
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Saiba de onde sai cada gasto e acompanhe as faturas dos cartões.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNova}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Nova Conta</span>
        </button>
      </div>

      {ordenadas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <CreditCard className="w-8 h-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">
            Nenhuma conta ou cartão cadastrado
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Cadastre seus cartões e contas para saber de onde sai cada gasto e
            acompanhar o valor de cada fatura.
          </p>
          <button
            type="button"
            onClick={abrirNova}
            className="mt-1 text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            Cadastrar a primeira
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordenadas.map((conta) => {
            const resumo =
              conta.tipo === "cartao_credito"
                ? resumoDoCartao(conta, lancamentos)
                : null;
            const movimento = movimentoDoMes.get(conta.id);
            const usoLimite =
              resumo && conta.limite
                ? Math.min(100, (resumo.limiteUsado / conta.limite) * 100)
                : null;

            return (
              <article
                key={conta.id}
                className={`bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col ${
                  conta.ativa ? "" : "opacity-60"
                }`}
              >
                {/* Faixa com a cor da conta */}
                <div className="h-1.5" style={{ backgroundColor: conta.cor }} />

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <header className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: conta.cor }}
                      >
                        {conta.tipo === "cartao_credito" ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold text-slate-900 truncate">
                          {conta.nome}
                          {conta.ultimosDigitos && (
                            <span className="ml-1.5 text-slate-400 font-bold">
                              •••• {conta.ultimosDigitos}
                            </span>
                          )}
                        </h2>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {ROTULOS_TIPO_CONTA[conta.tipo]}
                          {!conta.ativa && " · inativa"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(conta)}
                        aria-label={`Editar ${conta.nome}`}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcluindo(conta)}
                        aria-label={`Excluir ${conta.nome}`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </header>

                  {resumo ? (
                    <>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Fatura aberta
                        </p>
                        <p className="text-2xl font-black text-brand">
                          {formatarMoeda(resumo.totalFaturaAberta)}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          Fecha {formatarDiaMes(resumo.fechamento)} · Vence{" "}
                          {formatarDiaMes(resumo.vencimento)}
                        </p>
                      </div>

                      {usoLimite !== null && resumo.limiteDisponivel !== undefined && (
                        <div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usoLimite >= 90 ? "bg-rose-500" : "bg-brand"
                              }`}
                              style={{ width: `${usoLimite}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            Disponível {formatarMoeda(resumo.limiteDisponivel)} de{" "}
                            {formatarMoeda(conta.limite!)}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setFaturaDe(conta)}
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                        Ver faturas
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Entradas no mês
                        </p>
                        <p className="text-base font-black text-emerald-600">
                          {formatarMoeda(movimento?.entradas ?? 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Saídas no mês
                        </p>
                        <p className="text-base font-black text-brand">
                          {formatarMoeda(movimento?.saidas ?? 0)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ModalConta
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        contaEditando={contaEditando}
      />

      <ModalFatura
        key={faturaDe?.id ?? "nenhum"}
        cartao={faturaDe}
        onClose={() => setFaturaDe(null)}
      />

      {/* Confirmação de exclusão */}
      {excluindo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="excluir-conta-titulo"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <h2 id="excluir-conta-titulo" className="text-base font-extrabold text-slate-900">
              Excluir "{excluindo.nome}"?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {contarLancamentosPorConta(excluindo.id) > 0
                ? `${contarLancamentosPorConta(excluindo.id)} lançamento(s) continuarão existindo, mas ficarão sem conta vinculada. Se quiser só esconder, edite e desmarque "Conta ativa".`
                : "Nenhum lançamento usa esta conta."}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setExcluindo(null)}
                className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  removerConta(excluindo.id);
                  setExcluindo(null);
                }}
                className="w-1/2 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-md transition-colors cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
