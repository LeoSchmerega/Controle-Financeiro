// src/App.tsx
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
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
  // Drawer da sidebar em mobile (< md) — sempre fechado por padrão; em md+
  // a sidebar ignora esse estado e fica sempre visível (ver SideBar.tsx).
  const [isSidebarAberta, setIsSidebarAberta] = useState(false);

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
      <div className="relative flex h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[40px] bg-white text-slate-900 shadow-2xl">
        <Sidebar
          paginaAtiva={paginaAtiva}
          onSelectPagina={setPaginaAtiva}
          temasCores={TEMAS_CORES}
          temaCorAtivo={temaCor}
          onTrocarTemaCor={setTemaCor}
          isOpen={isSidebarAberta}
          onClose={() => setIsSidebarAberta(false)}
        />

        {/* Overlay escurecido atrás do drawer — só existe em mobile (< md)
            e enquanto o drawer está aberto; toque nele fecha o menu. */}
        {isSidebarAberta && (
          <div
            className="absolute inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setIsSidebarAberta(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex flex-1 flex-col h-full min-w-0">
          {/* Barra superior só em mobile (< md) — em telas maiores a sidebar
              já fica sempre visível, então o botão de menu não existe ali. */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarAberta(true)}
              aria-label="Abrir menu"
              aria-expanded={isSidebarAberta}
              className="flex items-center justify-center min-w-11 min-h-11 -ml-2 text-slate-600 hover:text-brand rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 shrink-0" />
            </button>
            <span className="text-sm font-extrabold text-slate-900">
              Fy Control
            </span>
          </div>

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 md:p-8 outline-none"
          >
            {renderConteudoPagina()}
          </main>
        </div>
      </div>
    </div>
  );
}
