// src/services/perfilService.ts
// Leitura/gravação do perfil (tabela public.perfis) e alteração de email e
// senha (Supabase Auth). A tela de Configurações só fala com este arquivo.
import { supabase, URL_DO_APP } from "../lib/supabase";
import { cpfValido, somenteDigitos, telefoneValido } from "../utils/documentoUtils";

export interface Perfil {
  nome: string;
  sobrenome: string;
  cpf: string; // só dígitos ("" quando não informado)
  telefone: string; // só dígitos ("" quando não informado)
}

export const PERFIL_VAZIO: Perfil = { nome: "", sobrenome: "", cpf: "", telefone: "" };

// Mensagem amigável para os erros mais prováveis
function mensagemDeErro(erro: { code?: string; message: string }): string {
  if (erro.code === "PGRST205" || erro.code === "42P01")
    return "A tabela de perfis ainda não existe no Supabase. Rode o arquivo supabase/migrations/001_perfis.sql no SQL Editor.";
  if (erro.code === "23514") return "CPF ou telefone em formato inválido.";
  if (erro.message.toLowerCase().includes("failed to fetch"))
    return "Sem conexão com o servidor.";
  return erro.message;
}

export async function buscarPerfil(userId: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from("perfis")
    .select("nome, sobrenome, cpf, telefone")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(mensagemDeErro(error));
  if (!data) return PERFIL_VAZIO; // ainda não preencheu o perfil

  return {
    nome: data.nome ?? "",
    sobrenome: data.sobrenome ?? "",
    cpf: data.cpf ?? "",
    telefone: data.telefone ?? "",
  };
}

export const perfilEstaVazio = (p: Perfil) =>
  !p.nome && !p.sobrenome && !p.cpf && !p.telefone;

// Os dados digitados no cadastro também ficam guardados na própria conta
// (user_metadata). Serve de reserva caso o perfil no banco esteja vazio —
// ex: o trigger da migration 002 não existia quando a conta foi criada.
// Só aproveita CPF/telefone válidos, para não esbarrar nas regras do banco.
export function perfilDosMetadados(
  metadados: Record<string, unknown> | undefined,
): Perfil | null {
  if (!metadados) return null;
  const texto = (chave: string) =>
    typeof metadados[chave] === "string" ? (metadados[chave] as string) : "";

  const cpf = somenteDigitos(texto("cpf"));
  const telefone = somenteDigitos(texto("telefone"));
  const perfil: Perfil = {
    nome: texto("nome").trim().slice(0, 60),
    sobrenome: texto("sobrenome").trim().slice(0, 80),
    cpf: cpfValido(cpf) ? cpf : "",
    telefone: telefoneValido(telefone) ? telefone : "",
  };
  return perfilEstaVazio(perfil) ? null : perfil;
}

// Cria o perfil na primeira vez ou atualiza se já existir (upsert)
export async function salvarPerfil(userId: string, perfil: Perfil): Promise<void> {
  const { error } = await supabase.from("perfis").upsert({
    id: userId,
    nome: perfil.nome.trim(),
    sobrenome: perfil.sobrenome.trim(),
    cpf: perfil.cpf || null,
    telefone: perfil.telefone || null,
  });
  if (error) throw new Error(mensagemDeErro(error));
}

// O Supabase envia um link de confirmação; o email só muda depois do clique
export async function alterarEmail(novoEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser(
    { email: novoEmail },
    { emailRedirectTo: URL_DO_APP },
  );
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already") || m.includes("registered"))
      throw new Error("Este email já está em uso por outra conta.");
    if (m.includes("rate limit"))
      throw new Error("Muitas tentativas. Aguarde um pouco e tente de novo.");
    throw new Error(error.message);
  }
}

export async function alterarSenha(novaSenha: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("should be different"))
      throw new Error("A nova senha precisa ser diferente da atual.");
    if (m.includes("at least"))
      throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    throw new Error(error.message);
  }
}
