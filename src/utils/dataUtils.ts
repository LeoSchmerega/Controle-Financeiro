// src/utils/dataUtils.ts
// Utilitários para conciliar os dois formatos de data usados no projeto:
// - "dd/mm/yyyy" (formato exibido nas telas, padrão BR)
// - "yyyy-mm-dd" (formato exigido pelo <input type="date">, padrão ISO)

// Converte "dd/mm/yyyy" -> "yyyy-mm-dd". Se já estiver em ISO, retorna como está.
export function dataParaISO(data: string): string {
  if (!data) return "";
  if (data.includes("-")) return data;

  const [dia, mes, ano] = data.split("/");
  if (!dia || !mes || !ano) return "";
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

// Converte "yyyy-mm-dd" -> "dd/mm/yyyy". Se já estiver em BR, retorna como está.
export function dataParaBR(data: string): string {
  if (!data) return "";
  if (data.includes("/")) return data;

  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return "";
  return `${dia}/${mes}/${ano}`;
}

// Converte "dd/mm/yyyy" ou "yyyy-mm-dd" em um objeto Date, para permitir
// comparação/ordenação. Retorna null se a string estiver vazia ou inválida.
export function paraObjetoData(valor: string): Date | null {
  if (!valor) return null;

  if (valor.includes("/")) {
    const [dia, mes, ano] = valor.split("/").map(Number);
    if (!dia || !mes || !ano) return null;
    return new Date(ano, mes - 1, dia);
  }

  const [ano, mes, dia] = valor.split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

// Formata uma data (dd/mm/yyyy ou yyyy-mm-dd) de forma amigável, relativa a
// hoje: "Hoje", "Ontem" ou dd/mm/yyyy. Retorna "—" se não houver data.
export function formatarDataRelativa(valor: string): string {
  const data = paraObjetoData(valor);
  if (!data) return "—";

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diffDias = Math.round(
    (inicioHoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Ontem";
  return dataParaBR(valor);
}

const MESES_ABREVIADOS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

// Extrai a competência "yyyy-mm" de uma data (dd/mm/yyyy ou yyyy-mm-dd),
// usada como chave para agrupar/filtrar lançamentos por mês de referência.
export function mesAnoDeData(valor: string): string {
  const data = paraObjetoData(valor);
  if (!data) return "";
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${data.getFullYear()}-${mes}`;
}

// Competência "yyyy-mm" do mês atual (real, do dispositivo do usuário)
export function mesAnoAtual(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}`;
}

// Formata uma competência "yyyy-mm" como rótulo amigável, ex: "AGO / 2026"
export function formatarRotuloMesAno(mesAno: string): string {
  const [ano, mes] = mesAno.split("-").map(Number);
  if (!ano || !mes) return mesAno;
  return `${MESES_ABREVIADOS[mes - 1]} / ${ano}`;
}

// Gera as opções de "Mês de referência" a partir das datas dos lançamentos
// existentes (sempre incluindo o mês atual), da mais recente para a mais antiga.
export function gerarOpcoesMesAno(
  datas: string[],
): { valor: string; rotulo: string }[] {
  const competencias = new Set<string>([mesAnoAtual()]);
  datas.forEach((data) => {
    const mesAno = mesAnoDeData(data);
    if (mesAno) competencias.add(mesAno);
  });

  return Array.from(competencias)
    .sort((a, b) => b.localeCompare(a))
    .map((valor) => ({ valor, rotulo: formatarRotuloMesAno(valor) }));
}

// Desloca uma competência "yyyy-mm" em N meses (negativo = meses anteriores),
// permitindo navegar para qualquer mês — tenha ele lançamentos ou não.
export function deslocarMesAno(mesAno: string, quantidadeMeses: number): string {
  const [ano, mes] = mesAno.split("-").map(Number);
  if (!ano || !mes) return mesAno;

  const data = new Date(ano, mes - 1 + quantidadeMeses, 1);
  const mesResultado = String(data.getMonth() + 1).padStart(2, "0");
  return `${data.getFullYear()}-${mesResultado}`;
}
