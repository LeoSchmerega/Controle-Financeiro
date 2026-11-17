// src/pages/ConfiguracoesPage.tsx
// Configurações da conta: dados pessoais (tabela perfis), email e senha
// (Supabase Auth). Cada bloco salva de forma independente.
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { HardDriveUpload, KeyRound, Mail, RefreshCw, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { lerDadosLocais } from "../services/repositorioLocal";
import {
  PERFIL_VAZIO,
  alterarEmail,
  alterarSenha,
  buscarPerfil,
  perfilDosMetadados,
  perfilEstaVazio,
  salvarPerfil,
} from "../services/perfilService";
import type { Perfil } from "../services/perfilService";
import {
  mascararCpf,
  mascararTelefone,
  somenteDigitos,
  validarPerfil,
} from "../utils/documentoUtils";

type Feedback = { tipo: "sucesso" | "erro"; texto: string } | null;

const classeInput =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50 disabled:text-slate-500";

const classeBotao =
  "bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

// --- Peças visuais reaproveitadas pelos três blocos ---

function Secao({
  icone,
  titulo,
  descricao,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
      <header className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 shrink-0 rounded-full bg-brand-soft text-brand flex items-center justify-center">
          {icone}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{titulo}</h2>
          <p className="text-xs text-slate-500 font-medium">{descricao}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Campo({
  rotulo,
  erro,
  dica,
  children,
}: {
  rotulo: string;
  erro?: string;
  dica?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-bold text-slate-600">{rotulo}</span>
      {children}
      {erro ? (
        <span className="text-xs text-red-600">{erro}</span>
      ) : (
        dica && <span className="text-xs text-slate-400">{dica}</span>
      )}
    </label>
  );
}

function Mensagem({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  const sucesso = feedback.tipo === "sucesso";
  return (
    <p
      role={sucesso ? "status" : "alert"}
      className={`rounded-xl px-4 py-3 text-sm ${
        sucesso ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {feedback.texto}
    </p>
  );
}

// --- Página ---

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const { importarDados, erroCarregamento } = useFinance();

  // Dados que ficaram salvos neste navegador da época antes do login
  const [dadosLocais] = useState(lerDadosLocais);
  const totalLocal =
    dadosLocais.lancamentos.length +
    dadosLocais.seriesFixas.length +
    dadosLocais.metas.length +
    dadosLocais.contas.length;
  const [feedbackImportacao, setFeedbackImportacao] = useState<Feedback>(null);

  const handleImportar = () => {
    const adicionados = importarDados(dadosLocais);
    setFeedbackImportacao({
      tipo: "sucesso",
      texto:
        adicionados > 0
          ? `${adicionados} item(ns) importado(s) para a sua conta.`
          : "Tudo já estava na sua conta — nada novo para importar.",
    });
  };
  const userId = usuario?.id ?? "";

  // Dados pessoais — "salvo" é a última versão do banco, para saber se há
  // alterações pendentes e habilitar o botão só quando houver.
  const [perfilSalvo, setPerfilSalvo] = useState<Perfil>(PERFIL_VAZIO);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [feedbackPerfil, setFeedbackPerfil] = useState<Feedback>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const [novoEmail, setNovoEmail] = useState("");
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState<Feedback>(null);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [feedbackSenha, setFeedbackSenha] = useState<Feedback>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelado = false;
    const doCadastro = perfilDosMetadados(usuario?.user_metadata);

    buscarPerfil(userId)
      .then(async (dados) => {
        // Perfil vazio no banco, mas com dados do cadastro guardados na
        // conta: recupera e grava, para não ter que digitar tudo de novo.
        if (perfilEstaVazio(dados) && doCadastro) {
          await salvarPerfil(userId, doCadastro);
          return doCadastro;
        }
        return dados;
      })
      .then((dados) => {
        if (cancelado) return;
        setPerfilSalvo(dados);
        setPerfil(dados);
      })
      .catch((erro: Error) => {
        if (!cancelado) setFeedbackPerfil({ tipo: "erro", texto: erro.message });
      })
      .finally(() => {
        if (!cancelado) setCarregandoPerfil(false);
      });
    return () => {
      cancelado = true;
    };
    // Só recarrega ao trocar de conta — o objeto "usuario" muda a cada
    // renovação de token e não deve disparar uma nova busca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Mesmas regras do cadastro (ver validarPerfil)
  const errosPerfil = validarPerfil(perfil);
  const perfilValido = Object.keys(errosPerfil).length === 0;
  const perfilAlterado = JSON.stringify(perfil) !== JSON.stringify(perfilSalvo);

  const atualizarCampo = (campo: keyof Perfil, valor: string) => {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
    setFeedbackPerfil(null);
  };

  const handleSalvarPerfil = async (e: FormEvent) => {
    e.preventDefault();
    setTentouSalvar(true);
    if (!perfilValido) return;

    setSalvandoPerfil(true);
    try {
      await salvarPerfil(userId, perfil);
      setPerfilSalvo(perfil);
      setTentouSalvar(false);
      setFeedbackPerfil({ tipo: "sucesso", texto: "Dados salvos com sucesso." });
    } catch (erro) {
      setFeedbackPerfil({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleAlterarEmail = async (e: FormEvent) => {
    e.preventDefault();
    const email = novoEmail.trim();
    if (email.toLowerCase() === usuario?.email?.toLowerCase()) {
      setFeedbackEmail({ tipo: "erro", texto: "Esse já é o seu email atual." });
      return;
    }

    setSalvandoEmail(true);
    try {
      await alterarEmail(email);
      setNovoEmail("");
      setFeedbackEmail({
        tipo: "sucesso",
        texto: `Enviamos um link de confirmação para ${email}. O email só muda depois que você clicar nele.`,
      });
    } catch (erro) {
      setFeedbackEmail({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setSalvandoEmail(false);
    }
  };

  const handleAlterarSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      setFeedbackSenha({ tipo: "erro", texto: "As senhas não conferem." });
      return;
    }

    setSalvandoSenha(true);
    try {
      await alterarSenha(novaSenha);
      setNovaSenha("");
      setConfirmarSenha("");
      setFeedbackSenha({ tipo: "sucesso", texto: "Senha alterada com sucesso." });
    } catch (erro) {
      setFeedbackSenha({ tipo: "erro", texto: (erro as Error).message });
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Configurações
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Gerencie seus dados pessoais e o acesso à sua conta.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Dados pessoais */}
        <Secao
          icone={<UserRound className="w-4 h-4" />}
          titulo="Dados pessoais"
          descricao="Seu nome e contatos cadastrados."
        >
          {carregandoPerfil ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-brand" />
              Carregando...
            </div>
          ) : (
            <form onSubmit={handleSalvarPerfil} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo rotulo="Nome" erro={tentouSalvar ? errosPerfil.nome : undefined}>
                  <input
                    type="text"
                    autoComplete="given-name"
                    maxLength={60}
                    value={perfil.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    className={classeInput}
                  />
                </Campo>
                <Campo
                  rotulo="Sobrenome"
                  erro={tentouSalvar ? errosPerfil.sobrenome : undefined}
                >
                  <input
                    type="text"
                    autoComplete="family-name"
                    maxLength={80}
                    value={perfil.sobrenome}
                    onChange={(e) => atualizarCampo("sobrenome", e.target.value)}
                    className={classeInput}
                  />
                </Campo>
                <Campo
                  rotulo="CPF"
                  erro={tentouSalvar ? errosPerfil.cpf : undefined}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={mascararCpf(perfil.cpf)}
                    onChange={(e) =>
                      atualizarCampo("cpf", somenteDigitos(e.target.value).slice(0, 11))
                    }
                    className={classeInput}
                  />
                </Campo>
                <Campo
                  rotulo="Telefone"
                  erro={tentouSalvar ? errosPerfil.telefone : undefined}
                >
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(00) 00000-0000"
                    value={mascararTelefone(perfil.telefone)}
                    onChange={(e) =>
                      atualizarCampo("telefone", somenteDigitos(e.target.value).slice(0, 11))
                    }
                    className={classeInput}
                  />
                </Campo>
              </div>

              <Mensagem feedback={feedbackPerfil} />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!perfilAlterado || salvandoPerfil}
                  className={classeBotao}
                >
                  {salvandoPerfil && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Salvar dados
                </button>
              </div>
            </form>
          )}
        </Secao>

        {/* Email */}
        <Secao
          icone={<Mail className="w-4 h-4" />}
          titulo="Email"
          descricao="Usado para entrar no app."
        >
          <form onSubmit={handleAlterarEmail} className="flex flex-col gap-4">
            <Campo rotulo="Email atual">
              <input type="email" value={usuario?.email ?? ""} disabled className={classeInput} />
            </Campo>
            <Campo rotulo="Novo email">
              <input
                type="email"
                required
                autoComplete="email"
                value={novoEmail}
                onChange={(e) => {
                  setNovoEmail(e.target.value);
                  setFeedbackEmail(null);
                }}
                className={classeInput}
              />
            </Campo>

            <Mensagem feedback={feedbackEmail} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!novoEmail.trim() || salvandoEmail}
                className={classeBotao}
              >
                {salvandoEmail && <RefreshCw className="w-4 h-4 animate-spin" />}
                Alterar email
              </button>
            </div>
          </form>
        </Secao>

        {/* Senha */}
        <Secao
          icone={<KeyRound className="w-4 h-4" />}
          titulo="Senha"
          descricao="Mínimo de 6 caracteres."
        >
          <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo rotulo="Nova senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setFeedbackSenha(null);
                  }}
                  className={classeInput}
                />
              </Campo>
              <Campo rotulo="Confirmar nova senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    setFeedbackSenha(null);
                  }}
                  className={classeInput}
                />
              </Campo>
            </div>

            <Mensagem feedback={feedbackSenha} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!novaSenha || !confirmarSenha || salvandoSenha}
                className={classeBotao}
              >
                {salvandoSenha && <RefreshCw className="w-4 h-4 animate-spin" />}
                Alterar senha
              </button>
            </div>
          </form>
        </Secao>

        {/* Importar dados antigos deste navegador */}
        {totalLocal > 0 && (
          <Secao
            icone={<HardDriveUpload className="w-4 h-4" />}
            titulo="Dados salvos neste navegador"
            descricao="Do tempo em que o app guardava tudo só no navegador."
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Encontramos {dadosLocais.lancamentos.length} lançamento(s),{" "}
                {dadosLocais.seriesFixas.length} despesa(s) fixa(s),{" "}
                {dadosLocais.metas.length} meta(s) e{" "}
                {dadosLocais.categorias.length} categoria(s). Importe para tê-los
                na sua conta em qualquer dispositivo. Itens que já existem não
                são duplicados.
              </p>

              <Mensagem feedback={feedbackImportacao} />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleImportar}
                  disabled={Boolean(erroCarregamento)}
                  title={erroCarregamento ?? undefined}
                  className={classeBotao}
                >
                  Importar para minha conta
                </button>
              </div>
            </div>
          </Secao>
        )}
      </div>
    </div>
  );
}
