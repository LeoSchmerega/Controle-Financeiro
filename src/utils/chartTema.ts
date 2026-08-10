// src/utils/chartTema.ts
// Cores usadas nos gráficos da Dashboard (Recharts). SVG não aceita classes
// do Tailwind, só strings de cor literais — por isso ficam centralizadas
// aqui em vez de espalhadas em cada gráfico, cada uma anotada com o token
// Tailwind equivalente para não perderem sincronia com o resto do app.
export const CORES_GRAFICO = {
  receita: "#059669", // emerald-600
  despesa: "#8B0000", // var(--color-brand)
  grade: "#F1F5F9", // slate-100
  eixo: "#94A3B8", // slate-400
  linhaEixo: "#E2E8F0", // slate-200
  tooltipBorda: "#E2E8F0", // slate-200
  tooltipFundoDestaque: "#F8FAFC", // slate-50
} as const;
