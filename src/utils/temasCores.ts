// src/utils/temasCores.ts
// Temas de cor do sistema — a mesma paleta usada nos seletores de categoria
// e meta (ver paletaVisual.ts), agora aplicável ao site inteiro via
// variáveis CSS (--color-brand / --color-brand-hover / --color-brand-soft).
export interface TemaCor {
  id: string;
  nome: string;
  cor: string;
  corHover: string;
  corSuave: string;
}

export const TEMAS_CORES: TemaCor[] = [
  { id: "vermelho", nome: "Vermelho", cor: "#8B0000", corHover: "#6B0000", corSuave: "#FFE8E8" },
  { id: "laranja", nome: "Laranja", cor: "#B45309", corHover: "#944407", corSuave: "#FAF4EF" },
  { id: "verde", nome: "Verde", cor: "#0F766E", corHover: "#0C615A", corSuave: "#EFF6F6" },
  { id: "azul", nome: "Azul", cor: "#1D4ED8", corHover: "#1840B1", corSuave: "#F0F3FC" },
  { id: "roxo", nome: "Roxo", cor: "#7E22CE", corHover: "#671CA9", corSuave: "#F7F1FC" },
  { id: "rosa", nome: "Rosa", cor: "#BE185D", corHover: "#9C144C", corSuave: "#FBF0F4" },
  { id: "oliva", nome: "Oliva", cor: "#4D7C0F", corHover: "#3F660C", corSuave: "#F3F6EF" },
  { id: "ciano", nome: "Ciano", cor: "#0369A1", corHover: "#025684", corSuave: "#EFF5F9" },
  { id: "grafite", nome: "Grafite", cor: "#64748B", corHover: "#525F72", corSuave: "#F5F6F7" },
  { id: "preto", nome: "Preto", cor: "#18181B", corHover: "#4B4B4D", corSuave: "#F1F1F1" },
];

export const TEMA_COR_PADRAO = TEMAS_CORES[0];

export const CHAVE_TEMA_COR_STORAGE = "fycontrol:tema-cor";

// Aplica um tema de cor no documento inteiro, sobrescrevendo as variáveis
// CSS definidas em index.css. Todas as classes bg-brand/text-brand/etc.
// reagem automaticamente, em qualquer tela do app.
export function aplicarTemaCor(tema: TemaCor) {
  const raiz = document.documentElement.style;
  raiz.setProperty("--color-brand", tema.cor);
  raiz.setProperty("--color-brand-hover", tema.corHover);
  raiz.setProperty("--color-brand-soft", tema.corSuave);
}

export function obterTemaCorSalvo(): TemaCor {
  const idSalvo = localStorage.getItem(CHAVE_TEMA_COR_STORAGE);
  return TEMAS_CORES.find((t) => t.id === idSalvo) ?? TEMA_COR_PADRAO;
}
