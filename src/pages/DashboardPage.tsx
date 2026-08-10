// src/pages/DashboardPage.tsx
import { useState, useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import DrawerLancamento from "../components/Lancamentos/DrawerLancamento";
import CardsResumo from "../components/Lancamentos/CardsResumo";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import FluxoFinanceiro from "../components/Dashboard/FluxoFinanceiro";
import DespesasPorCategoria from "../components/Dashboard/DespesasPorCategoria";
import LancamentosRecentes from "../components/Dashboard/LancamentosRecentes";
import MetasFinanceiras from "../components/Dashboard/MetasFinanceiras";
import IndicadoresFinanceiros from "../components/Dashboard/IndicadoresFinanceiros";
import {
  mesAnoDeData,
  mesAnoAtual,
  gerarOpcoesMesAno,
  deslocarMesAno,
  formatarRotuloMesAno,
} from "../utils/dataUtils";
import { calcularTotaisLancamentos } from "../utils/financeiroUtils";

interface DashboardPageProps {
  onNavegarParaLancamentos: () => void;
}

export default function DashboardPage({
  onNavegarParaLancamentos,
}: DashboardPageProps) {
  const { lancamentos, categorias } = useFinance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mesmo padrão de "Mês de referência" já usado em Lançamentos e Categorias
  const opcoesMeses = useMemo(
    () => gerarOpcoesMesAno(lancamentos.map((l) => l.data)),
    [lancamentos],
  );
  const [mesSelecionado, setMesSelecionado] = useState<string>(
    opcoesMeses[0]?.valor ?? mesAnoAtual(),
  );

  const opcoesMesesParaExibir = useMemo(() => {
    if (opcoesMeses.some((o) => o.valor === mesSelecionado)) {
      return opcoesMeses;
    }
    const combinadas = [
      ...opcoesMeses,
      { valor: mesSelecionado, rotulo: formatarRotuloMesAno(mesSelecionado) },
    ];
    return combinadas.sort((a, b) => b.valor.localeCompare(a.valor));
  }, [opcoesMeses, mesSelecionado]);

  // Toda a Dashboard deriva do mesmo estado de lançamentos/categorias do
  // FinanceContext — nada de dados fictícios independentes da aplicação.
  const lancamentosDoMes = useMemo(
    () =>
      lancamentos.filter((item) => mesAnoDeData(item.data) === mesSelecionado),
    [lancamentos, mesSelecionado],
  );

  const totaisDoMes = useMemo(
    () => calcularTotaisLancamentos(lancamentosDoMes),
    [lancamentosDoMes],
  );

  return (
    <>
      <DashboardHeader
        mesSelecionado={mesSelecionado}
        opcoesMeses={opcoesMesesParaExibir}
        onAlterarMes={setMesSelecionado}
        onMesAnterior={() =>
          setMesSelecionado((atual) => deslocarMesAno(atual, -1))
        }
        onProximoMes={() =>
          setMesSelecionado((atual) => deslocarMesAno(atual, 1))
        }
        onNovoLancamento={() => setIsDrawerOpen(true)}
      />

      {/* Cards de Resumo — mesmo componente usado em Lançamentos */}
      <CardsResumo totais={totaisDoMes} />

      {/* Indicadores rápidos */}
      <div className="mb-6">
        <IndicadoresFinanceiros
          lancamentosDoMes={lancamentosDoMes}
          categorias={categorias}
          totaisDoMes={totaisDoMes}
        />
      </div>

      {/* Fluxo financeiro + Despesas por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FluxoFinanceiro lancamentos={lancamentos} mesReferencia={mesSelecionado} />
        </div>
        <DespesasPorCategoria
          lancamentosDoMes={lancamentosDoMes}
          categorias={categorias}
        />
      </div>

      {/* Últimos lançamentos + Metas financeiras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LancamentosRecentes
            lancamentos={lancamentos}
            categorias={categorias}
            onVerTodos={onNavegarParaLancamentos}
          />
        </div>
        <MetasFinanceiras />
      </div>

      {/* Drawer do Formulário — mesmo componente usado em Lançamentos */}
      <DrawerLancamento
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
