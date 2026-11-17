// src/context/AuthContext.tsx
// Guarda a sessão do usuário logado (Supabase Auth) e expõe as ações de
// entrar, criar conta e sair para o resto do app.
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Perfil } from "../services/perfilService";

// Resultado das ações de login/cadastro — a tela decide a mensagem.
export interface ResultadoAuth {
  erro?: string;
  // true quando o cadastro deu certo mas o Supabase exige confirmar o email
  precisaConfirmarEmail?: boolean;
}

interface AuthContextData {
  carregando: boolean; // verificando se já existe sessão salva
  usuario: User | null;
  entrar: (email: string, senha: string) => Promise<ResultadoAuth>;
  criarConta: (
    email: string,
    senha: string,
    perfil: Perfil,
  ) => Promise<ResultadoAuth>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Traduz as mensagens mais comuns do Supabase para português
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu email antes de entrar (veja sua caixa de entrada).";
  if (m.includes("user already registered")) return "Este email já tem uma conta.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid format"))
    return "Email inválido.";
  if (m.includes("email rate limit"))
    return "O servidor atingiu o limite de envio de emails por hora. Tente novamente mais tarde.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco.";
  if (m.includes("failed to fetch")) return "Sem conexão com o servidor.";
  return mensagem;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Sessão salva de um acesso anterior (o Supabase guarda no navegador)
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    // Mantém o estado em dia ao entrar, sair ou renovar o token
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const entrar = async (email: string, senha: string): Promise<ResultadoAuth> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    return error ? { erro: traduzirErro(error.message) } : {};
  };

  const criarConta = async (
    email: string,
    senha: string,
    perfil: Perfil,
  ): Promise<ResultadoAuth> => {
    // Os dados do perfil vão em options.data; o trigger
    // "ao_criar_usuario" (migration 002) copia para a tabela perfis.
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome: perfil.nome.trim(),
          sobrenome: perfil.sobrenome.trim(),
          cpf: perfil.cpf,
          telefone: perfil.telefone,
        },
      },
    });
    if (error) return { erro: traduzirErro(error.message) };
    // Sem sessão = o projeto exige confirmação por email
    return { precisaConfirmarEmail: !data.session };
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ carregando, usuario: sessao?.user ?? null, entrar, criarConta, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
