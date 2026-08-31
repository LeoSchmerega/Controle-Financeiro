import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type {
  Categoria,
  Lancamento,
  Meta,
  NovaCategoriaInput,
  NovaMetaInput,
  SerieFixa,
  TotaisFinanceiros,
} from "../types/financeiro";
import type { ReactNode } from "react";
import { calcularTotaisLancamentos } from "../utils/financeiroUtils";
import { PALETA_CORES, ICONES_META } from "../utils/paletaVisual";
import {
  mesAnoDeData,
  mesAnoAtual,
  deslocarMesAno,
  somarMesesAData,
  competenciaEDiaParaData,
  paraObjetoData,
} from "../utils/dataUtils";

// Chaves de persistência no localStorage — mesmo prefixo já usado pelo tema
// de cor (ver utils/temasCores.ts), pra manter tudo do Fy Control agrupado.
const CHAVE_CATEGORIAS_STORAGE = "fycontrol:categorias";
const CHAVE_LANCAMENTOS_STORAGE = "fycontrol:lancamentos";
const CHAVE_METAS_STORAGE = "fycontrol:metas";
const CHAVE_SERIES_FIXAS_STORAGE = "fycontrol:seriesFixas";

// Quantos meses à frente do mês atual as despesas fixas recorrentes são
// materializadas automaticamente. Ao navegar além dessa janela, a tela de
// Lançamentos estende a geração sob demanda (ver garantirLancamentosFixosAte).
const HORIZONTE_MESES_FIXO = 12;

// Opções aceitas ao cadastrar um lançamento — parcelamento só se aplica a
// despesas variáveis (uma despesa fixa já se repete todo mês sozinha).
export interface OpcoesNovoLancamento {
  parcelas?: number;
}

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
  adicionarLancamento: (
    novoLanc: Omit<Lancamento, "id">,
    opcoes?: OpcoesNovoLancamento,
  ) => void;
  editarLancamento: (
    id: string,
    dadosAtualizados: Omit<Lancamento, "id">,
  ) => void;
  removerLancamento: (id: string) => void;
  // Encerra apenas a ocorrência do mês desse lançamento — a recorrência
  // continua normalmente nos meses seguintes.
  excluirOcorrenciaFixaApenasEsteMes: (id: string) => void;
  // Remove essa ocorrência e todas as futuras, encerrando a recorrência a
  // partir deste mês (os meses anteriores já lançados permanecem no histórico).
  pararRecorrenciaFixa: (id: string) => void;
  // Garante que toda despesa fixa ativa tenha uma ocorrência materializada
  // até a competência informada — chamada ao navegar para meses futuros.
  garantirLancamentosFixosAte: (mesAnoLimite: string) => void;
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

  // Séries de despesas fixas recorrentes — o "molde" (valor, categoria,
  // dia do mês...) a partir do qual os lançamentos mensais são gerados.
  const [seriesFixas, setSeriesFixas] = useState<SerieFixa[]>(() =>
    lerDoStorage<SerieFixa[]>(CHAVE_SERIES_FIXAS_STORAGE, []),
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

  // Função para cadastrar um novo Lançamento. Aceita duas variações especiais:
  // - Despesa fixa (tipoGasto "fixo"): em vez de um único registro, cria uma
  //   SerieFixa que passa a se repetir todo mês sozinha (ver garantirLancamentosFixosAte).
  // - Parcelamento (opcoes.parcelas > 1): divide o valor em N lançamentos,
  //   um por mês, vinculados pelo mesmo grupo.
  const adicionarLancamento = (
    novoLanc: Omit<Lancamento, "id">,
    opcoes?: OpcoesNovoLancamento,
  ) => {
    const numeroParcelas =
      opcoes?.parcelas && opcoes.parcelas > 1 ? opcoes.parcelas : 1;

    if (
      novoLanc.tipo === "despesa" &&
      novoLanc.tipoGasto === "fixo" &&
      numeroParcelas === 1
    ) {
      const mesInicio = mesAnoDeData(novoLanc.data);
      const diaDoMes = paraObjetoData(novoLanc.data)?.getDate() ?? 1;
      const serie: SerieFixa = {
        id: `serie_${Date.now()}`,
        descricao: novoLanc.descricao,
        valor: novoLanc.valor,
        categoriaId: novoLanc.categoriaId,
        formaPagamento: novoLanc.formaPagamento,
        observacao: novoLanc.observacao,
        diaDoMes,
        mesInicio,
        mesFim: null,
        mesesExcluidos: [],
      };
      setSeriesFixas((prev) => [...prev, serie]);
      return;
    }

    if (numeroParcelas > 1) {
      const grupoId = `parc_${Date.now()}`;
      const valorParcela =
        Math.floor((novoLanc.valor / numeroParcelas) * 100) / 100;

      const criados: Lancamento[] = Array.from(
        { length: numeroParcelas },
        (_, indice) => {
          const numero = indice + 1;
          const ehUltima = numero === numeroParcelas;
          // A última parcela absorve a diferença de arredondamento das
          // anteriores, garantindo que a soma das parcelas bata com o valor total.
          const valorAjustado = ehUltima
            ? Math.round(
                (novoLanc.valor - valorParcela * (numeroParcelas - 1)) * 100,
              ) / 100
            : valorParcela;

          return {
            ...novoLanc,
            id: `lanc_${grupoId}_${numero}`,
            descricao: `${novoLanc.descricao} (${numero}/${numeroParcelas})`,
            valor: valorAjustado,
            data: somarMesesAData(novoLanc.data, indice),
            parcela: { grupoId, numero, total: numeroParcelas },
          };
        },
      );
      setLancamentos((prev) => [...criados, ...prev]);
      return;
    }

    const criado: Lancamento = { ...novoLanc, id: `lanc_${Date.now()}` };
    setLancamentos((prev) => [criado, ...prev]);
  };

  // Função para editar um Lançamento já existente. Preserva os vínculos de
  // parcelamento/recorrência do registro original (o formulário não os
  // conhece) e, quando o lançamento pertence a uma despesa fixa recorrente,
  // atualiza também o molde da série — assim os próximos meses ainda não
  // gerados já nascem com os dados novos.
  const editarLancamento = (
    id: string,
    dadosAtualizados: Omit<Lancamento, "id">,
  ) => {
    const original = lancamentos.find((item) => item.id === id);

    setLancamentos((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...dadosAtualizados,
              id,
              parcela: item.parcela,
              recorrenciaFixaId: item.recorrenciaFixaId,
            }
          : item,
      ),
    );

    if (original?.recorrenciaFixaId) {
      setSeriesFixas((prev) =>
        prev.map((serie) =>
          serie.id === original.recorrenciaFixaId
            ? {
                ...serie,
                descricao: dadosAtualizados.descricao,
                valor: dadosAtualizados.valor,
                categoriaId: dadosAtualizados.categoriaId,
                formaPagamento: dadosAtualizados.formaPagamento,
                observacao: dadosAtualizados.observacao,
              }
            : serie,
        ),
      );
    }
  };

  // Função para remover um Lançamento pelo ID — remove só esse registro,
  // sem mexer em série/recorrência (usado para lançamentos avulsos).
  const removerLancamento = (id: string) => {
    setLancamentos((prev) => prev.filter((item) => item.id !== id));
  };

  // Remove apenas a ocorrência do mês desse lançamento fixo, marcando a
  // competência como excluída na série — assim ela não é regerada nas
  // próximas garantias, mas a recorrência segue normalmente nos outros meses.
  const excluirOcorrenciaFixaApenasEsteMes = (id: string) => {
    const item = lancamentos.find((l) => l.id === id);
    if (!item?.recorrenciaFixaId) {
      removerLancamento(id);
      return;
    }

    const competencia = mesAnoDeData(item.data);
    setSeriesFixas((prev) =>
      prev.map((serie) =>
        serie.id === item.recorrenciaFixaId &&
        !serie.mesesExcluidos.includes(competencia)
          ? { ...serie, mesesExcluidos: [...serie.mesesExcluidos, competencia] }
          : serie,
      ),
    );
    removerLancamento(id);
  };

  // Remove essa ocorrência e todas as futuras, encerrando a recorrência a
  // partir deste mês. Os meses anteriores já lançados permanecem intactos
  // no histórico.
  const pararRecorrenciaFixa = (id: string) => {
    const item = lancamentos.find((l) => l.id === id);
    if (!item?.recorrenciaFixaId) {
      removerLancamento(id);
      return;
    }

    const competencia = mesAnoDeData(item.data);
    const serieId = item.recorrenciaFixaId;

    setLancamentos((prev) =>
      prev.filter(
        (l) =>
          !(l.recorrenciaFixaId === serieId && mesAnoDeData(l.data) >= competencia),
      ),
    );

    setSeriesFixas((prev) =>
      prev
        .map((serie) => {
          if (serie.id !== serieId) return serie;
          const mesAnterior = deslocarMesAno(competencia, -1);
          // Se a recorrência estava encerrando antes mesmo de ter começado
          // (ex: parar logo na primeira ocorrência), a série inteira some.
          return mesAnterior < serie.mesInicio
            ? null
            : { ...serie, mesFim: mesAnterior };
        })
        .filter((serie): serie is SerieFixa => serie !== null),
    );
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

  useEffect(() => {
    salvarNoStorage(CHAVE_SERIES_FIXAS_STORAGE, seriesFixas);
  }, [seriesFixas]);

  // Materializa o lançamento de uma competência específica a partir do
  // molde da série fixa — id determinístico (serie + competência) evita
  // gerar duplicado ao rodar a garantia mais de uma vez.
  const gerarLancamentoDaSerie = (
    serie: SerieFixa,
    competencia: string,
  ): Lancamento => ({
    id: `lanc_${serie.id}_${competencia}`,
    descricao: serie.descricao,
    valor: serie.valor,
    data: competenciaEDiaParaData(competencia, serie.diaDoMes),
    tipo: "despesa",
    tipoGasto: "fixo",
    categoriaId: serie.categoriaId,
    formaPagamento: serie.formaPagamento,
    observacao: serie.observacao,
    recorrenciaFixaId: serie.id,
  });

  // Garante que toda série fixa ativa tenha uma ocorrência lançada em cada
  // competência entre o início dela e "mesAnoLimite" (ou o fim da série, se
  // houver um) — pulando competências removidas manualmente. É assim que
  // uma despesa fixa "sempre aparece nos próximos meses": a cada chamada
  // (montagem do app, ou navegação para um mês futuro) as lacunas até o
  // limite pedido são preenchidas.
  const garantirLancamentosFixosAte = (mesAnoLimite: string) => {
    setLancamentos((prev) => {
      const idsExistentes = new Set(prev.map((l) => l.id));
      const novos: Lancamento[] = [];

      seriesFixas.forEach((serie) => {
        const limite =
          serie.mesFim && serie.mesFim < mesAnoLimite
            ? serie.mesFim
            : mesAnoLimite;
        if (limite < serie.mesInicio) return;

        let competencia = serie.mesInicio;
        // Bound de segurança: nunca itera mais que ~50 anos de meses, mesmo
        // que algum dado corrompido cause um loop maior que o esperado.
        let seguranca = 0;
        while (competencia <= limite && seguranca < 600) {
          const idPrevisto = `lanc_${serie.id}_${competencia}`;
          if (
            !serie.mesesExcluidos.includes(competencia) &&
            !idsExistentes.has(idPrevisto)
          ) {
            novos.push(gerarLancamentoDaSerie(serie, competencia));
          }
          competencia = deslocarMesAno(competencia, 1);
          seguranca += 1;
        }
      });

      return novos.length > 0 ? [...prev, ...novos] : prev;
    });
  };

  // Sempre que as séries mudarem (nova despesa fixa criada, valor editado,
  // recorrência encerrada...), garante a janela padrão de 12 meses à
  // frente. A tela de Lançamentos estende essa garantia ao navegar além
  // dessa janela (ver garantirLancamentosFixosAte exposta no contexto).
  useEffect(() => {
    garantirLancamentosFixosAte(deslocarMesAno(mesAnoAtual(), HORIZONTE_MESES_FIXO));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesFixas]);

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
        excluirOcorrenciaFixaApenasEsteMes,
        pararRecorrenciaFixa,
        garantirLancamentosFixosAte,
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
