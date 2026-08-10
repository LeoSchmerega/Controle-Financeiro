import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type {
  Categoria,
  Lancamento,
  Meta,
  NovaCategoriaInput,
  NovaMetaInput,
  TotaisFinanceiros,
} from "../types/financeiro";
import type { ReactNode } from "react";
import { calcularTotaisLancamentos } from "../utils/financeiroUtils";
import { PALETA_CORES, ICONES_META } from "../utils/paletaVisual";

// Chaves de persistência no localStorage — mesmo prefixo já usado pelo tema
// de cor (ver utils/temasCores.ts), pra manter tudo do Fy Control agrupado.
const CHAVE_CATEGORIAS_STORAGE = "fycontrol:categorias";
const CHAVE_LANCAMENTOS_STORAGE = "fycontrol:lancamentos";
const CHAVE_METAS_STORAGE = "fycontrol:metas";

// Lê um valor salvo no localStorage. Se não existir (primeira visita da
// pessoa nesse navegador) ou o JSON estiver corrompido, cai no valor
// padrão em vez de quebrar a aplicação.
function lerDoStorage<T>(chave: string, valorPadrao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : valorPadrao;
  } catch {
    return valorPadrao;
  }
}

// Grava no localStorage silenciosamente — se falhar (modo privado, quota
// excedida, etc.) o app continua funcionando só sem persistir a sessão.
function salvarNoStorage<T>(chave: string, valor: T) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem persistência disponível — segue o app funcionando normalmente.
  }
}

// Resultado de uma tentativa de exclusão de categoria — a UI decide o que
// mostrar (bloqueado, pedir reatribuição, ou sucesso) a partir disso.
export interface ResultadoRemocaoCategoria {
  sucesso: boolean;
  motivo?: string;
}

// 1. Interface que define tudo o que nosso Contexto vai expor para o app
interface FinanceContextData {
  categorias: Categoria[];
  lancamentos: Lancamento[];
  metas: Meta[];
  adicionarMeta: (novaMeta: NovaMetaInput) => Meta;
  editarMeta: (id: string, dadosAtualizados: Partial<Omit<Meta, "id">>) => void;
  contribuirParaMeta: (id: string, valor: number) => void;
  removerMeta: (id: string) => void;
  adicionarCategoria: (novaCat: NovaCategoriaInput) => Categoria;
  editarCategoria: (
    id: string,
    dadosAtualizados: Partial<Omit<Categoria, "id" | "padrao">>,
  ) => void;
  alternarAtivaCategoria: (id: string) => void;
  moverOrdemCategoria: (id: string, direcao: "cima" | "baixo") => void;
  removerCategoria: (
    id: string,
    categoriaDestinoId?: string,
  ) => ResultadoRemocaoCategoria;
  contarLancamentosPorCategoria: (categoriaId: string) => number;
  adicionarLancamento: (novoLanc: Omit<Lancamento, "id">) => void;
  editarLancamento: (
    id: string,
    dadosAtualizados: Omit<Lancamento, "id">,
  ) => void;
  removerLancamento: (id: string) => void;
  totais: TotaisFinanceiros;
}

// 2. Criação do Contexto
const FinanceContext = createContext<FinanceContextData>(
  {} as FinanceContextData,
);

// Categorias padrão do sistema — usadas apenas na primeira visita da
// pessoa neste navegador (nada salvo ainda no localStorage). Inclui as
// duas categorias "Outros", usadas como destino padrão ao excluir uma
// categoria com vínculos. Não são dado pessoal, só rótulos/ícones prontos
// pra facilitar o primeiro uso.
const CATEGORIAS_PADRAO: Categoria[] = [
  {
    id: "cat_1",
    nome: "Salário",
    tipo: "receita",
    cor: "#0F766E",
    icone: "💰",
    ativa: true,
    ordem: 1,
  },
  {
    id: "cat_2",
    nome: "Aluguel",
    tipo: "despesa",
    cor: "#8B0000",
    icone: "🏠",
    ativa: true,
    ordem: 1,
  },
  {
    id: "cat_3",
    nome: "Mercado",
    tipo: "despesa",
    cor: "#B45309",
    icone: "🛒",
    ativa: true,
    ordem: 2,
  },
  {
    id: "cat_4",
    nome: "Farmácia",
    tipo: "despesa",
    cor: "#1D4ED8",
    icone: "💊",
    ativa: true,
    ordem: 3,
  },
  {
    id: "cat_5",
    nome: "Internet",
    tipo: "despesa",
    cor: "#7E22CE",
    icone: "📶",
    ativa: true,
    ordem: 4,
  },
  {
    id: "cat_outros_receita",
    nome: "Outros",
    tipo: "receita",
    cor: "#64748B",
    icone: "📦",
    ativa: true,
    ordem: 99,
    padrao: true,
  },
  {
    id: "cat_outros_despesa",
    nome: "Outros",
    tipo: "despesa",
    cor: "#64748B",
    icone: "📦",
    ativa: true,
    ordem: 99,
    padrao: true,
  },
];

// 3. Provedor (Provider) que vai envelopar a nossa aplicação
export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  // Categorias: carrega do localStorage se a pessoa já usou o app neste
  // navegador; senão começa com o catálogo padrão acima.
  const [categorias, setCategorias] = useState<Categoria[]>(() =>
    lerDoStorage(CHAVE_CATEGORIAS_STORAGE, CATEGORIAS_PADRAO),
  );

  // Lançamentos: sem mock — pessoa nova sempre começa zerada. O que ela
  // cadastrar é persistido e volta a aparecer em visitas futuras.
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() =>
    lerDoStorage<Lancamento[]>(CHAVE_LANCAMENTOS_STORAGE, []),
  );

  // Função para cadastrar uma nova Categoria — preenche com valores padrão
  // tudo que não for informado (cor, ícone, ordem, status).
  const adicionarCategoria = (novaCat: NovaCategoriaInput): Categoria => {
    const categoriasDoTipo = categorias.filter((c) => c.tipo === novaCat.tipo);
    const proximaOrdem =
      categoriasDoTipo.length > 0
        ? Math.max(...categoriasDoTipo.map((c) => c.ordem)) + 1
        : 1;
    const corAutomatica =
      PALETA_CORES[categoriasDoTipo.length % PALETA_CORES.length];

    const criada: Categoria = {
      id: `cat_${Date.now()}`,
      nome: novaCat.nome,
      tipo: novaCat.tipo,
      icone: novaCat.icone ?? "🏷️",
      cor: novaCat.cor ?? corAutomatica,
      ativa: novaCat.ativa ?? true,
      ordem: proximaOrdem,
      orcamentoMensal: novaCat.orcamentoMensal,
      padrao: false,
    };
    setCategorias((prev) => [...prev, criada]);
    return criada;
  };

  // Função para editar os dados de uma Categoria já existente
  const editarCategoria = (
    id: string,
    dadosAtualizados: Partial<Omit<Categoria, "id" | "padrao">>,
  ) => {
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, ...dadosAtualizados } : cat,
      ),
    );
  };

  // Ativa/desativa uma categoria (exclusão "suave" — some dos seletores,
  // mas o histórico de lançamentos permanece intacto)
  const alternarAtivaCategoria = (id: string) => {
    setCategorias((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ativa: !cat.ativa } : cat)),
    );
  };

  // Move a categoria uma posição para cima/baixo dentro do seu tipo,
  // trocando o campo "ordem" com a vizinha mais próxima
  const moverOrdemCategoria = (id: string, direcao: "cima" | "baixo") => {
    setCategorias((prev) => {
      const alvo = prev.find((c) => c.id === id);
      if (!alvo) return prev;

      const irmas = prev
        .filter((c) => c.tipo === alvo.tipo)
        .sort((a, b) => a.ordem - b.ordem);
      const indiceAtual = irmas.findIndex((c) => c.id === id);
      const indiceVizinha =
        direcao === "cima" ? indiceAtual - 1 : indiceAtual + 1;

      if (indiceVizinha < 0 || indiceVizinha >= irmas.length) return prev;

      const vizinha = irmas[indiceVizinha];
      return prev.map((c) => {
        if (c.id === alvo.id) return { ...c, ordem: vizinha.ordem };
        if (c.id === vizinha.id) return { ...c, ordem: alvo.ordem };
        return c;
      });
    });
  };

  // Quantos lançamentos apontam para essa categoria — usado para decidir
  // se a exclusão pode ser direta ou precisa de reatribuição
  const contarLancamentosPorCategoria = (categoriaId: string) =>
    lancamentos.filter((l) => l.categoriaId === categoriaId).length;

  // Remove uma categoria. Se houver lançamentos vinculados, exige um
  // "categoriaDestinoId" para reatribuí-los antes de excluir; sem isso, a
  // exclusão é bloqueada. Categorias marcadas como "padrao" nunca são excluídas.
  const removerCategoria = (
    id: string,
    categoriaDestinoId?: string,
  ): ResultadoRemocaoCategoria => {
    const categoria = categorias.find((c) => c.id === id);
    if (!categoria) {
      return { sucesso: false, motivo: "Categoria não encontrada." };
    }
    if (categoria.padrao) {
      return {
        sucesso: false,
        motivo: "Categorias padrão do sistema não podem ser excluídas.",
      };
    }

    const vinculados = contarLancamentosPorCategoria(id);
    if (vinculados > 0) {
      if (!categoriaDestinoId) {
        return {
          sucesso: false,
          motivo: `Existem ${vinculados} lançamento(s) vinculado(s) a esta categoria. Escolha uma categoria de destino para reatribuí-los antes de excluir.`,
        };
      }
      setLancamentos((prev) =>
        prev.map((l) =>
          l.categoriaId === id ? { ...l, categoriaId: categoriaDestinoId } : l,
        ),
      );
    }

    setCategorias((prev) => prev.filter((c) => c.id !== id));
    return { sucesso: true };
  };

  // Função para cadastrar um novo Lançamento
  const adicionarLancamento = (novoLanc: Omit<Lancamento, "id">) => {
    const criado: Lancamento = { ...novoLanc, id: `lanc_${Date.now()}` };
    setLancamentos((prev) => [criado, ...prev]);
  };

  // Função para editar um Lançamento já existente
  const editarLancamento = (
    id: string,
    dadosAtualizados: Omit<Lancamento, "id">,
  ) => {
    setLancamentos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...dadosAtualizados, id } : item,
      ),
    );
  };

  // Função para remover um Lançamento pelo ID
  const removerLancamento = (id: string) => {
    setLancamentos((prev) => prev.filter((item) => item.id !== id));
  };

  // Metas financeiras — sem mock, carrega do localStorage se existir;
  // senão começa vazio e o usuário cadastra as próprias pela Dashboard.
  const [metas, setMetas] = useState<Meta[]>(() =>
    lerDoStorage<Meta[]>(CHAVE_METAS_STORAGE, []),
  );

  // Persiste cada estado no localStorage sempre que ele muda, para que a
  // pessoa encontre os próprios dados salvos ao voltar (mesmo navegador).
  useEffect(() => {
    salvarNoStorage(CHAVE_CATEGORIAS_STORAGE, categorias);
  }, [categorias]);

  useEffect(() => {
    salvarNoStorage(CHAVE_LANCAMENTOS_STORAGE, lancamentos);
  }, [lancamentos]);

  useEffect(() => {
    salvarNoStorage(CHAVE_METAS_STORAGE, metas);
  }, [metas]);

  // Função para cadastrar uma nova Meta — preenche cor/ícone/valor
  // acumulado com padrões sensatos quando não informados.
  const adicionarMeta = (novaMeta: NovaMetaInput): Meta => {
    const corAutomatica = PALETA_CORES[metas.length % PALETA_CORES.length];

    const criada: Meta = {
      id: `meta_${Date.now()}`,
      nome: novaMeta.nome,
      valorObjetivo: novaMeta.valorObjetivo,
      valorAcumulado: novaMeta.valorAcumulado ?? 0,
      cor: novaMeta.cor ?? corAutomatica,
      icone: novaMeta.icone ?? ICONES_META[0],
    };
    setMetas((prev) => [...prev, criada]);
    return criada;
  };

  // Função para editar os dados de uma Meta já existente
  const editarMeta = (id: string, dadosAtualizados: Partial<Omit<Meta, "id">>) => {
    setMetas((prev) =>
      prev.map((meta) =>
        meta.id === id ? { ...meta, ...dadosAtualizados } : meta,
      ),
    );
  };

  // Soma um valor ao progresso acumulado da meta (aporte). Nunca deixa o
  // acumulado ficar negativo.
  const contribuirParaMeta = (id: string, valor: number) => {
    setMetas((prev) =>
      prev.map((meta) =>
        meta.id === id
          ? { ...meta, valorAcumulado: Math.max(0, meta.valorAcumulado + valor) }
          : meta,
      ),
    );
  };

  // Função para remover uma Meta pelo ID
  const removerMeta = (id: string) => {
    setMetas((prev) => prev.filter((meta) => meta.id !== id));
  };

  // Cálculo memoizado dos Totais para os Cards superiores (KPIs)
  const totais = useMemo(
    () => calcularTotaisLancamentos(lancamentos),
    [lancamentos],
  );

  return (
    <FinanceContext.Provider
      value={{
        categorias,
        lancamentos,
        metas,
        adicionarMeta,
        editarMeta,
        contribuirParaMeta,
        removerMeta,
        adicionarCategoria,
        editarCategoria,
        alternarAtivaCategoria,
        moverOrdemCategoria,
        removerCategoria,
        contarLancamentosPorCategoria,
        adicionarLancamento,
        editarLancamento,
        removerLancamento,
        totais,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// 4. Custom Hook para consumir o contexto de forma simples em qualquer tela
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
};
