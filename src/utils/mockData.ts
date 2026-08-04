// src/utils/mockData.ts
import type { MapaFinanceiro } from "../types";

export const MOCK_MAPA_FINANCEIRO: MapaFinanceiro = {
  "2026-08": {
    receitas: [
      { categoriaId: "salario", rotulo: "Salário", valor: "5000" },
      { categoriaId: "freelancer", rotulo: "Freelancer", valor: "1200" },
    ],
    gastosFixos: [
      { categoriaId: "aluguel", rotulo: "Aluguel", valor: "1500" },
      { categoriaId: "internet", rotulo: "Internet", valor: "120" },
    ],
    variaveis: [
      { categoriaId: "restaurante", rotulo: "Restaurante", valor: "350" },
    ],
  },
};
