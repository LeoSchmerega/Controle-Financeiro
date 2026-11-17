// src/pages/LoginPage.tsx
// Tela de entrada: login (email + senha) e criação de conta, que também
// pede os dados pessoais (nome, sobrenome, CPF, telefone) já validados.
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import Logo from "../assets/icones/logo.svg?react";
import { useAuth } from "../context/AuthContext";
import { PERFIL_VAZIO } from "../services/perfilService";
import type { Perfil } from "../services/perfilService";
import { aplicarTemaCor, obterTemaCorSalvo } from "../utils/temasCores";
import {
  mascararCpf,
  mascararTelefone,
  somenteDigitos,
  validarPerfil,
} from "../utils/documentoUtils";

type Modo = "entrar" | "criar";

const classeInput =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 aria-invalid:border-red-400";

function Campo({
  rotulo,
  erro,
  children,
}: {
  rotulo: string;
  erro?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-bold text-slate-600">{rotulo}</span>
      {children}
      {erro && <span className="text-xs text-red-600">{erro}</span>}
    </label>
  );
}

// Bloco que abre/fecha animando a altura (truque do grid 0fr → 1fr, que
// funciona com conteúdo de altura automática) junto com a opacidade.
// Fechado, fica "inert": sem foco pelo Tab e invisível a leitores de tela.
function Recolhivel({
  aberto,
  children,
}: {
  aberto: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={!aberto}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      {/* -mx-1 px-1: folga lateral para o anel de foco dos inputs não ser cortado */}
      <div className="min-h-0 overflow-hidden -mx-1 px-1">{children}</div>
    </div>
  );
}

export default function LoginPage() {
  const { entrar, criarConta } = useAuth();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
  // Erros por campo só aparecem depois da primeira tentativa de envio
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // O tema de cor normalmente é aplicado pelo App — aqui ele ainda não
  // montou, então aplicamos o tema salvo para a tela já nascer na cor certa.
  useEffect(() => {
    aplicarTemaCor(obterTemaCorSalvo());
  }, []);

  const criando = modo === "criar";
  const errosPerfil = criando ? validarPerfil(perfil) : {};
  const erroConfirmacao =
    criando && confirmarSenha && senha !== confirmarSenha
      ? "As senhas não conferem."
      : undefined;
  const erroDe = (campo: keyof typeof errosPerfil) =>
    tentouEnviar ? errosPerfil[campo] : undefined;

  const atualizarPerfil = (campo: keyof Perfil, valor: string) =>
    setPerfil((atual) => ({ ...atual, [campo]: valor }));

  const trocarModo = (novo: Modo) => {
    setModo(novo);
    setErro(null);
    setAviso(null);
    setTentouEnviar(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);

    if (criando) {
      setTentouEnviar(true);
      if (Object.keys(errosPerfil).length > 0) return;
      if (senha !== confirmarSenha) {
        setErro("As senhas não conferem.");
        return;
      }
    }

    setEnviando(true);
    const resultado = criando
      ? await criarConta(email.trim(), senha, perfil)
      : await entrar(email.trim(), senha);
    setEnviando(false);

    if (resultado.erro) {
      setErro(resultado.erro);
    } else if (resultado.precisaConfirmarEmail) {
      setAviso(
        `Conta criada! Enviamos um link de confirmação para ${email.trim()}. Confirme e depois entre aqui.`,
      );
      setModo("entrar");
      setSenha("");
      setConfirmarSenha("");
      setPerfil(PERFIL_VAZIO);
      setTentouEnviar(false);
    }
    // Sucesso no login: o AuthContext recebe a sessão e o app troca de tela sozinho.
  };

  return (
    <div className="h-dvh w-screen p-4 flex items-center justify-center bg-brand box-border overflow-y-auto">
      <div
        className={`my-auto w-full rounded-3xl bg-white p-6 sm:p-8 text-slate-900 shadow-2xl transition-[max-width] duration-300 ease-out motion-reduce:transition-none ${
          criando ? "max-w-md" : "max-w-sm"
        }`}
      >
        <header className="flex flex-col items-center gap-2 mb-6">
          <Logo className="w-16 h-16 fill-current" />
          <h1 className="text-2xl font-extrabold tracking-tight">Fy Control</h1>
          {/* key={modo}: recria o texto a cada troca, disparando o fade */}
          <p key={modo} className="text-sm text-slate-500 animate-fade-in">
            {criando ? "Crie sua conta" : "Entre na sua conta"}
          </p>
        </header>

        {/* Sem "gap" no form: o espaçamento fica dentro de cada bloco, para
            que um bloco recolhido não deixe um espaço vazio sobrando. */}
        <form
          onSubmit={handleSubmit}
          noValidate={criando}
          className="flex flex-col"
        >
          <Recolhivel aberto={criando}>
            <div className="flex flex-col gap-3 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo rotulo="Nome" erro={erroDe("nome")}>
                  <input
                    type="text"
                    autoComplete="given-name"
                    maxLength={60}
                    value={perfil.nome}
                    onChange={(e) => atualizarPerfil("nome", e.target.value)}
                    aria-invalid={Boolean(erroDe("nome"))}
                    className={classeInput}
                  />
                </Campo>
                <Campo rotulo="Sobrenome" erro={erroDe("sobrenome")}>
                  <input
                    type="text"
                    autoComplete="family-name"
                    maxLength={80}
                    value={perfil.sobrenome}
                    onChange={(e) =>
                      atualizarPerfil("sobrenome", e.target.value)
                    }
                    aria-invalid={Boolean(erroDe("sobrenome"))}
                    className={classeInput}
                  />
                </Campo>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo rotulo="CPF" erro={erroDe("cpf")}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={mascararCpf(perfil.cpf)}
                    onChange={(e) =>
                      atualizarPerfil(
                        "cpf",
                        somenteDigitos(e.target.value).slice(0, 11),
                      )
                    }
                    aria-invalid={Boolean(erroDe("cpf"))}
                    className={classeInput}
                  />
                </Campo>
                <Campo rotulo="Telefone" erro={erroDe("telefone")}>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(00) 00000-0000"
                    value={mascararTelefone(perfil.telefone)}
                    onChange={(e) =>
                      atualizarPerfil(
                        "telefone",
                        somenteDigitos(e.target.value).slice(0, 11),
                      )
                    }
                    aria-invalid={Boolean(erroDe("telefone"))}
                    className={classeInput}
                  />
                </Campo>
              </div>
            </div>
          </Recolhivel>

          <div className="flex flex-col gap-3">
            <Campo rotulo="Email">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={classeInput}
              />
            </Campo>

            <Campo rotulo="Senha">
              <input
                type="password"
                required
                minLength={6}
                autoComplete={criando ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={classeInput}
              />
            </Campo>
          </div>

          <Recolhivel aberto={criando}>
            <div className="pt-3 pb-0.5">
              <Campo rotulo="Confirmar senha" erro={erroConfirmacao}>
                <input
                  type="password"
                  required={criando}
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  aria-invalid={Boolean(erroConfirmacao)}
                  className={classeInput}
                />
              </Campo>
            </div>
          </Recolhivel>

          <div className="flex flex-col gap-3 pt-3">
            {erro && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}
            {aviso && (
              <p
                role="status"
                className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {aviso}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-hover disabled:opacity-60 cursor-pointer"
            >
              {enviando && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span key={modo} className="animate-fade-in">
                {criando ? "Criar conta" : "Entrar"}
              </span>
            </button>
          </div>
        </form>

        <p
          key={modo}
          className="mt-6 text-center text-sm text-slate-500 animate-fade-in"
        >
          {criando ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => trocarModo(criando ? "entrar" : "criar")}
            className="font-bold text-brand hover:underline cursor-pointer"
          >
            {criando ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
}
