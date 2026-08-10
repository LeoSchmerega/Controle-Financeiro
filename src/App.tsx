// src/App.tsx
import { useState, useEffect } from "react";
import Sidebar from "./components/SideBar/SideBar";
import DashboardPage from "./pages/DashboardPage";
import LancamentosPage from "./pages/LancamentosPage"; // <-- Importamos a nova página refatorada
import CategoriasPage from "./pages/CategoriasPage";
import type { PaginaAtiva } from "./types/categoria";
import {
  TEMAS_CORES,
  CHAVE_TEMA_COR_STORAGE,
  aplicarTemaCor,
  obterTemaCorSalvo,
} from "./utils/temasCores";
import type { TemaCor } from "./utils/temasCores";

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>("Dashboard");
  const [temaCor, setTemaCor] = useState<TemaCor>(() => obterTemaCorSalvo());

  // Aplica o tema de cor escolhido (sobrescreve as variáveis CSS globais) e
  // lembra a escolha entre sessões
  useEffect(() => {
    aplicarTemaCor(temaCor);
    localStorage.setItem(CHAVE_TEMA_COR_STORAGE, temaCor.id);
  }, [temaCor]);

  // Renderização condicional da página ativa
  const renderConteudoPagina = () => {
    switch (paginaAtiva) {
      case "Dashboard":
        return (
          <DashboardPage
            onNavegarParaLancamentos={() => setPaginaAtiva("Lançamentos")}
          />
        );
      case "Lançamentos":
        return <LancamentosPage />; // <-- Agora chamamos a nova página aqui de forma limpa!
      case "Categorias":
        return <CategoriasPage />;
      default:
        return (
          <DashboardPage
            onNavegarParaLancamentos={() => setPaginaAtiva("Lançamentos")}
          />
        );
    }
  };

  return (
    <div className="h-dvh w-screen p-2 sm:p-4 md:p-6 lg:p-10 flex items-center justify-center bg-brand box-border overflow-hidden">
      <div className="flex h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[40px] bg-white text-slate-900 shadow-2xl">
        <Sidebar
          paginaAtiva={paginaAtiva}
          onSelectPagina={setPaginaAtiva}
          temasCores={TEMAS_CORES}
          temaCorAtivo={temaCor}
          onTrocarTemaCor={setTemaCor}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 md:p-8 outline-none"
        >
          {renderConteudoPagina()}
        </main>
      </div>
    </div>
  );
}
