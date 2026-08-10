import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
// 1. Importação dos tipos universais do projeto
import type { PaginaAtiva } from "../../types";
import type { TemaCor } from "../../utils/temasCores";

// 2. Importação dos SVGs como componentes React
import Logo from "../../assets/icones/logo.svg?react";
import IconDashboard from "../../assets/icones/ic-dashboard.svg?react";
import IconLancamentos from "../../assets/icones/ic-lancamentos.svg?react";
import IconCategoria from "../../assets/icones/ic-categoria.svg?react";

// 3. Tipagem dos itens de navegação
interface NavItem {
  id: PaginaAtiva;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// 4. Configuração das rotas do menu
const NAV_ITEMS: NavItem[] = [
  { id: "Dashboard", label: "Dashboard", Icon: IconDashboard },
  { id: "Categorias", label: "Categorias", Icon: IconCategoria },
  { id: "Lançamentos", label: "Lançamentos", Icon: IconLancamentos },
];

// 5. Interface de Props (Contrato estrito com App.tsx)
interface SidebarProps {
  paginaAtiva: PaginaAtiva;
  onSelectPagina: (pagina: PaginaAtiva) => void;
  temasCores: TemaCor[];
  temaCorAtivo: TemaCor;
  onTrocarTemaCor: (tema: TemaCor) => void;
  // Controle do drawer off-canvas em mobile (< md). Em telas md+ a sidebar
  // fica sempre visível e esses dois props não têm efeito visual.
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  paginaAtiva,
  onSelectPagina,
  temasCores,
  temaCorAtivo,
  onTrocarTemaCor,
  isOpen,
  onClose,
}: SidebarProps) {
  const [seletorCoresAberto, setSeletorCoresAberto] = useState(false);

  // Em mobile, selecionar uma página fecha o drawer automaticamente —
  // em md+ onClose() não faz nada porque o drawer nem existe visualmente.
  const handleSelectPagina = (pagina: PaginaAtiva) => {
    onSelectPagina(pagina);
    onClose();
  };

  return (
    <aside
      // 👇 h-full (em vez de min-h-screen) para respeitar a altura real do
      // card pai em App.tsx, que é menor que 100vh por causa do padding.
      // Abaixo de md: drawer off-canvas (absolute + translate-x). Em md+:
      // volta a ser uma coluna estática, sempre visível, como antes.
      className={`absolute inset-y-0 left-0 z-40 flex flex-col justify-between w-64 bg-brand-soft select-none h-full border-r border-brand/15 shrink-0 p-6 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Navegação Principal"
      aria-hidden={!isOpen ? true : undefined}
    >
      {/* Bloco Superior: Brand/Header + Navegação */}
      <div className="flex flex-col gap-8">
        {/* Header Restaurado (Logo SVG Original + Título) */}
        <header className="flex items-center gap-3 px-2 pt-2">
          <div className="flex items-center justify-center w-auto h-auto rounded-full shrink-0">
            <Logo className="w-17.5 h-17.5 fill-current" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex-1">
            Fy Control
          </h1>
          {/* Fechar o drawer só faz sentido em mobile — some em md+ */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="md:hidden flex items-center justify-center min-w-11 min-h-11 -mr-2 text-slate-500 hover:text-brand rounded-md hover:bg-white/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </header>

        {/* Navegação Semântica com Efeitos de Hover Modernos */}
        <nav aria-label="Menu Principal">
          <ul className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const isActive = paginaAtiva === id;

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPagina(id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-brand text-white shadow-lg shadow-brand/20 translate-x-1"
                        : "text-slate-800 hover:bg-white/60 hover:text-slate-900 hover:translate-x-1"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 shrink-0 [&_path]:transition-colors ${
                        isActive ? "[&_path]:fill-white" : "[&_path]:fill-black"
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer: Seletor de Tema de Cor */}
      <footer className="mt-auto pt-4 border-t border-brand/15">
        <button
          type="button"
          onClick={() => setSeletorCoresAberto((prev) => !prev)}
          aria-expanded={seletorCoresAberto}
          aria-controls="paleta-temas-cor"
          className="flex items-center gap-3 w-full px-2 py-2.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span
            className="w-6 h-6 rounded-full border-2 border-white shadow-xs shrink-0"
            style={{ backgroundColor: temaCorAtivo.cor }}
            aria-hidden="true"
          />
          <span className="flex-1 text-left text-xs font-bold text-slate-700">
            Tema de cor
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              seletorCoresAberto ? "rotate-180" : ""
            }`}
          />
        </button>

        {seletorCoresAberto && (
          <div
            id="paleta-temas-cor"
            className="flex flex-wrap gap-2 mt-3 px-2 animate-fade-in"
            role="group"
            aria-label="Selecionar cor do tema"
          >
            {temasCores.map((temaCorItem) => {
              const isSelected = temaCorItem.id === temaCorAtivo.id;

              return (
                <button
                  key={temaCorItem.id}
                  type="button"
                  onClick={() => onTrocarTemaCor(temaCorItem)}
                  title={temaCorItem.nome}
                  aria-label={`Usar tema ${temaCorItem.nome}`}
                  aria-pressed={isSelected}
                  style={{ backgroundColor: temaCorItem.cor }}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-slate-500 scale-105"
                      : ""
                  }`}
                />
              );
            })}
          </div>
        )}
      </footer>
    </aside>
  );
}
