// src/utils/dateUtils.ts
import type { OpcaoMes } from "../types";

const MESES_ABREV = [
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

/**
 * Retorna a chave do mês atual no formato "YYYY-MM"
 */
export function getChaveMesAtual(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

/**
 * Converte "YYYY-MM" em rótulo formatado "JUL / 2026"
 */
export function formatarChaveParaLabel(chave: string): string {
  const [ano, mes] = chave.split("-");
  const indiceMes = parseInt(mes, 10) - 1;
  return `${MESES_ABREV[indiceMes]} / ${ano}`;
}

/**
 * Gera as opções para o <select>.
 * Inclui uma janela móvel (ex: 6 meses atrás e 6 meses à frente)
 * E garante que qualquer mês histórico presente no mapa de dados também apareça.
 */
export function gerarOpcoesMeses(chavesSalvas: string[] = []): OpcaoMes[] {
  const mapaOpcoes = new Map<string, string>();
  const hoje = new Date();

  // 1. Gera janela móvel: 6 meses no passado até 6 meses no futuro
  for (let i = -6; i <= 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const chave = `${ano}-${mes}`;
    mapaOpcoes.set(chave, formatarChaveParaLabel(chave));
  }

  // 2. Adiciona chaves históricas existentes que possam estar fora da janela de 6 meses
  chavesSalvas.forEach((chave) => {
    if (!mapaOpcoes.has(chave) && /^\d{4}-\d{2}$/.test(chave)) {
      mapaOpcoes.set(chave, formatarChaveParaLabel(chave));
    }
  });

  // 3. Converte para array e ordena em ordem decrescente (mais recente primeiro)
  // Ajustado para mapear 'valor' e 'rotulo' em conformidade com o tipo OpcaoMes
  return Array.from(mapaOpcoes.entries())
    .map(([valor, rotulo]) => ({ valor, rotulo }))
    .sort((a, b) => b.valor.localeCompare(a.valor));
}
