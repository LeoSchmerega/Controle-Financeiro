import { useState } from "react";
import Sidebar from "./components/SideBar"; // Ajustado o caminho da importação
import type { PaginaAtiva, Tema } from "./types";

import DadosFinanceiros from "./components/DadosFinanceiros";
import HeaderLancamento from "./components/HeaderLancamento";
import HistoricoFinanceiro from "./components/HistoricoFinanceiro";

export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>("dashboard");
  const [tema, setTema] = useState<Tema>("dark");

  return (
    /* Container Principal: Ocupa 100% da viewport */
    <div className="h-screen w-screen p-4 md:p-8 lg:p-[70px] flex items-center justify-center bg-[#8B0000] box-border overflow-hidden">
      {/* Moldura Interna com Cantos Arredondados */}
      <div className="flex h-full w-full overflow-hidden rounded-3xl lg:rounded-[50px] bg-white text-slate-900 shadow-2xl">
        {/* Sidebar */}
        <Sidebar
          paginaAtiva={paginaAtiva}
          onSelectPagina={(pagina) => setPaginaAtiva(pagina)}
          tema={tema}
          onToggleTema={(novoTema) => setTema(novoTema)}
        />

        {/* Conteúdo Dinâmico (Corrigido: sem w-screen/h-screen internas e com contraste de texto) */}
        <main className="flex-1 h-full overflow-y-auto bg-white p-6 md:p-10">
          {/* PÁGINA 1: DASHBOARD */}
          {paginaAtiva === "dashboard" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <header className="pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-sm text-slate-500">
                  Visão geral do seu patrimônio e fluxo de caixa.
                </p>
              </header>

              {/* O HistoricoFinanceiro contém a chamada do ModalReceita */}
              <HistoricoFinanceiro />
              <DadosFinanceiros />
            </div>
          )}

          {/* PÁGINA 2: LANÇAMENTOS */}
          {paginaAtiva === "lançamentos" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <HeaderLancamento />
              <HistoricoFinanceiro />
            </div>
          )}

          {/* PÁGINA 3: CATEGORIA */}
          {paginaAtiva === "categoria" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <header className="pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  Categorias
                </h2>
                <p className="text-sm text-slate-500">
                  Gerencie e organize suas categorias de gastos e receitas.
                </p>
              </header>

              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-600">
                  Em breve: Gerenciador de Categorias.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
