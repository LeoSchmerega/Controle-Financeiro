// src/App.tsx
import { useState, useEffect } from "react";
import Sidebar from "./components/SideBar";
import HistoricoFinanceiro from "./components/HistoricoFinanceiroLancamento";
import type { PaginaAtiva, Tema } from "./types/categoria";

// --- SUB-COMPONENTES PARA PÁGINAS SIMPLES / PLACEHOLDERS ---
function DashboardView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <header className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Visão geral do seu patrimônio e fluxo de caixa.
        </p>
      </header>
    </div>
  );
}

function CategoriaView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <header className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Categorias</h2>
        <p className="text-sm text-slate-500">
          Gerencie e organize suas categorias de gastos e receitas.
        </p>
      </header>

      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center">
        <p className="text-slate-600 font-medium">
          Em breve: Gerenciador de Categorias.
        </p>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>("Dashboard");
  const [tema, setTema] = useState<Tema>("escuro");

  // Sincroniza a classe 'dark' no <html> conforme o estado do tema
  useEffect(() => {
    const root = document.documentElement;
    if (tema === "escuro") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [tema]);

  // Renderização condicional por página ativa
  const renderConteudoPagina = () => {
    switch (paginaAtiva) {
      case "Dashboard":
        return <DashboardView />;
      case "Lançamentos":
        return (
          <div className="max-w-7xl mx-auto animate-fade-in">
            <HistoricoFinanceiro />
          </div>
        );
      case "Categorias":
        return <CategoriaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    /* Moldura externa com h-dvh para suporte responsivo mobile/desktop */
    <div className="h-dvh w-screen p-2 sm:p-4 md:p-6 lg:p-10 flex items-center justify-center bg-[#8B0000] box-border overflow-hidden">
      {/* Moldura Interna */}
      <div className="flex h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[40px] bg-white text-slate-900 shadow-2xl">
        {/* Sidebar */}
        <Sidebar
          paginaAtiva={paginaAtiva}
          onSelectPagina={setPaginaAtiva}
          tema={tema}
          onToggleTema={setTema}
        />

        {/* Conteúdo Dinâmico */}
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
