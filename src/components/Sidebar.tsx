import React from "react";
// 1. Importação apenas dos tipos realmente necessários
import type { PaginaAtiva, Tema } from "../types";

// 2. Importação dos SVGs como componentes React
import Logo from "../assets/icones/logo.svg?react";
import IconDashboard from "../assets/icones/ic-dashboard.svg?react";
import IconLancamentos from "../assets/icones/ic-lancamentos.svg?react";
import IconCategoria from "../assets/icones/ic-categoria.svg?react";
import IconSol from "../assets/icones/ic-sol.svg?react";
import IconLua from "../assets/icones/ic-lua.svg?react";

// 3. Tipagem dos itens de navegação
interface NavItem {
  id: PaginaAtiva;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// 4. Configuração estática das rotas do menu (Fora do componente para não recriar na memória a cada render)
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", Icon: IconDashboard },
  { id: "lançamentos", label: "Lançamentos", Icon: IconLancamentos },
  { id: "categoria", label: "Categoria", Icon: IconCategoria },
];

// 5. Interface de Props que o Sidebar recebe (Contrato com o App.tsx)
interface SidebarProps {
  paginaAtiva: PaginaAtiva;
  onSelectPagina: (pagina: PaginaAtiva) => void;
  tema: Tema;
  onToggleTema: (tema: Tema) => void;
}

export default function Sidebar({
  paginaAtiva,
  onSelectPagina,
  tema,
  onToggleTema,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col justify-between w-[200px] bg-[#FFD8D8] select-none"
      aria-label="Navegação Principal"
    >
      {/* Bloco Superior: Logo + Navegação */}
      <div className="flex-1 flex flex-col">
        {/* Header (Logo + Título) */}
        <header className="flex items-center gap-3 mt-[30px] ">
          <div className="flex items-center justify-center w-auto h-auto rounded-full">
            <Logo className="w-[70px] h-[70px] fill-current" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-red-950">
            Fy Control
          </h1>
        </header>

        {/* Navegação Semântica */}
        <div className="mt-[50px] p-[10px] ">
          <nav aria-label="Menu Principal">
            <ul className="space-y-3">
              {NAV_ITEMS.map(({ id, label, Icon }) => {
                const isActive = paginaAtiva === id;

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onSelectPagina(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center w-full gap-3 px-4 py-2.5 text-sm font-semibold rounded-full transition-colors shadow-sm ${
                        isActive
                          ? "bg-[#8B0000] text-white ring-2 ring-red-400"
                          : "text-black"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 [&_path]:transition-colors ${
                          isActive
                            ? "[&_path]:fill-white"
                            : "[&_path]:fill-black"
                        }`}
                      />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Footer / Alternador de Tema */}
      <footer className="flex items-center justify-start mt-auto p-4">
        <div
          className="flex items-center justify-center w-[100px] h-[50px] rounded-full shadow-sm"
          role="group"
          aria-label="Alternar tema"
        >
          {/* Botão Modo Claro */}
          <button
            type="button"
            onClick={() => onToggleTema("light")}
            aria-label="Ativar modo claro"
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              tema === "light" ? "bg-[#8B0000]" : "bg-transparent shadow-sm"
            }`}
          >
            <IconSol
              className={`w-5 h-5 [&_path]:transition-colors ${
                tema === "light"
                  ? "[&_path]:fill-white"
                  : "[&_path]:fill-black shadow-lm"
              }`}
            />
          </button>

          {/* Botão Modo Escuro */}
          <button
            type="button"
            onClick={() => onToggleTema("dark")}
            aria-label="Ativar modo escuro"
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              tema === "dark" ? "bg-[#8B0000]" : "bg-transparent"
            }`}
          >
            <IconLua
              className={`w-5 h-5 [&_path]:transition-colors ${
                tema === "dark" ? "[&_path]:fill-white" : "[&_path]:fill-black"
              }`}
            />
          </button>
        </div>
      </footer>
    </aside>
  );
}
