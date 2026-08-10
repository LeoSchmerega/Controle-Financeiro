// src/utils/valorUtils.ts
// Sanitiza uma entrada de valor monetário digitada pelo usuário, limitando a
// no máximo 6 dígitos na parte inteira e 2 dígitos na parte decimal.
export function formatarValorMonetario(valorDigitado: string): string {
  let valorFormatado = valorDigitado.replace(/[^0-9.,]/g, "");
  const partes = valorFormatado.split(/[.,]/);

  if (partes.length > 1) {
    const parteInteira = partes[0].slice(0, 6);
    const parteDecimal = partes[1].slice(0, 2);
    const separador = valorFormatado.includes(",") ? "," : ".";
    valorFormatado = `${parteInteira}${separador}${parteDecimal}`;
  } else {
    valorFormatado = partes[0].slice(0, 6);
  }

  return valorFormatado;
}
