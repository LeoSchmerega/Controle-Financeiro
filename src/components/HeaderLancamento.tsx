// src/components/HeaderLancamento.tsx
import type { OpcaoMes } from "../types"; // Certifique-se de importar a tipagem das opções do mês

// 1. Definição da interface das Props do componente
export interface HeaderLancamentoProps {
  mesSelecionado: string;
  onAlterarMes: (novoMes: string) => void; // Ou React.Dispatch<React.SetStateAction<string>>
  opcoesMeses: OpcaoMes[];
}

// 2. Aplicação do tipo na assinatura do componente
export default function HeaderLancamento({
  mesSelecionado,
  onAlterarMes,
  opcoesMeses,
}: HeaderLancamentoProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center pb-4 mb-4 border-b border-slate-200 gap-4">
      <h1 className="text-2xl font-bold text-slate-800">
        Lançamentos Financeiros
      </h1>

      <div className="flex items-center gap-2">
        <label
          htmlFor="seletor-mes"
          className="text-sm font-medium text-slate-600"
        >
          Mês de referência:
        </label>
        <select
          id="seletor-mes"
          value={mesSelecionado}
          onChange={(e) => onAlterarMes(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all cursor-pointer"
        >
          {opcoesMeses.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
