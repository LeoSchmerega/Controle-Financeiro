// src/constants/categoriasPadrao.ts
import type { Categoria } from "../types/categoria";

export const CATEGORIAS_PADRAO: Categoria[] = [
  // Receitas
  { id: "cat-salario", nome: "Salário", tipo: "RECEITAS", isPadrao: true },
  { id: "cat-freelance", nome: "Freelancer", tipo: "RECEITAS", isPadrao: true },
  {
    id: "cat-investimentos",
    nome: "Investimentos",
    tipo: "RECEITAS",
    isPadrao: true,
  },

  // Gastos Fixos
  { id: "cat-aluguel", nome: "Aluguel", tipo: "GASTOS_FIXOS", isPadrao: true },
  { id: "cat-agua", nome: "Água", tipo: "GASTOS_FIXOS", isPadrao: true },
  { id: "cat-luz", nome: "Luz", tipo: "GASTOS_FIXOS", isPadrao: true },
  {
    id: "cat-internet",
    nome: "Internet",
    tipo: "GASTOS_FIXOS",
    isPadrao: true,
  },

  // Variáveis
  {
    id: "cat-alimentacao",
    nome: "Alimentação",
    tipo: "VARIAVEIS",
    isPadrao: true,
  },
  {
    id: "cat-transporte",
    nome: "Transporte",
    tipo: "VARIAVEIS",
    isPadrao: true,
  },
  { id: "cat-lazer", nome: "Lazer", tipo: "VARIAVEIS", isPadrao: true },
];
