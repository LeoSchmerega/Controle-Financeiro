// src/utils/documentoUtils.ts
// Máscaras e validações de CPF e telefone (padrão brasileiro). No banco
// tudo fica só com dígitos; a máscara existe apenas na tela.

export const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

// 12345678901 → 123.456.789-01 (aplica conforme a pessoa digita)
export function mascararCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

// Valida os dois dígitos verificadores do CPF
export function cpfValido(valor: string): boolean {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const calcularDigito = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(d[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(d[9]) && calcularDigito(10) === Number(d[10]);
}

// 11987654321 → (11) 98765-4321 | 1134567890 → (11) 3456-7890
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Fixo (10 dígitos) ou celular (11 dígitos, começando com 9 após o DDD)
export function telefoneValido(valor: string): boolean {
  const d = somenteDigitos(valor);
  if (d.length === 10) return true;
  return d.length === 11 && d[2] === "9";
}

// Regras do perfil — as mesmas no cadastro e na tela de Configurações.
// Recebe CPF/telefone só com dígitos. Retorna a mensagem de erro de cada
// campo inválido (campo ausente = válido).
export interface ErrosPerfil {
  nome?: string;
  sobrenome?: string;
  cpf?: string;
  telefone?: string;
}

export function validarPerfil(perfil: {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
}): ErrosPerfil {
  const erros: ErrosPerfil = {};
  if (perfil.nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (perfil.sobrenome.trim().length < 2) erros.sobrenome = "Informe seu sobrenome.";
  if (!perfil.cpf) erros.cpf = "Informe seu CPF.";
  else if (!cpfValido(perfil.cpf)) erros.cpf = "CPF inválido.";
  if (!perfil.telefone) erros.telefone = "Informe seu telefone.";
  else if (!telefoneValido(perfil.telefone))
    erros.telefone = "Telefone inválido. Use DDD + número.";
  return erros;
}
