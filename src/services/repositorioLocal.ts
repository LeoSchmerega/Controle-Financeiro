// src/services/repositorioLocal.ts
// Implementação do repositório usando o localStorage do navegador — é o
// armazenamento atual do app. As chaves são as mesmas de antes, então
// quem já usa o app não perde nada. Também servirá de fonte para o
// "importar dados locais" quando o app passar a usar o Supabase.
import type {
  Colecao,
  DadosFinanceiros,
  RepositorioFinanceiro,
} from "./repositorio";

export const CHAVES_STORAGE: Record<Colecao, string> = {
  categorias: "fycontrol:categorias",
  lancamentos: "fycontrol:lancamentos",
  seriesFixas: "fycontrol:seriesFixas",
  metas: "fycontrol:metas",
  contas: "fycontrol:contas",
};

// Lê uma coleção salva. Se não existir ou o JSON estiver corrompido,
// devolve lista vazia em vez de quebrar a aplicação.
function lerColecao<T>(chave: string): T[] {
  try {
    const bruto = window.localStorage.getItem(chave);
    const valor = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(valor) ? (valor as T[]) : [];
  } catch {
    return [];
  }
}

export function lerDadosLocais(): DadosFinanceiros {
  return {
    categorias: lerColecao(CHAVES_STORAGE.categorias),
    lancamentos: lerColecao(CHAVES_STORAGE.lancamentos),
    seriesFixas: lerColecao(CHAVES_STORAGE.seriesFixas),
    metas: lerColecao(CHAVES_STORAGE.metas),
    contas: lerColecao(CHAVES_STORAGE.contas),
  };
}

export const repositorioLocal: RepositorioFinanceiro = {
  async carregar() {
    return lerDadosLocais();
  },

  async sincronizar(colecao, _anterior, atual) {
    try {
      window.localStorage.setItem(CHAVES_STORAGE[colecao], JSON.stringify(atual));
    } catch {
      // Sem persistência disponível (modo privado, quota excedida...) —
      // o app continua funcionando, só não guarda a sessão.
    }
  },
};
