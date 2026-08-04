import React, { useState } from "react";
import HeaderLancamento from "../components/HeaderLancamento";
import type { OpcaoMes } from "../types/index"; // Ajuste o caminho se a interface estiver em src/types

// Array montado exatamente conforme o contrato da interface OpcaoMes
const OPCOES_MESES_PADRAO: OpcaoMes[] = [
  { valor: "2026-01", rotulo: "Janeiro 2026" },
  { valor: "2026-02", rotulo: "Fevereiro 2026" },
  { valor: "2026-03", rotulo: "Março 2026" },
  { valor: "2026-04", rotulo: "Abril 2026" },
  { valor: "2026-05", rotulo: "Maio 2026" },
  { valor: "2026-06", rotulo: "Junho 2026" },
  { valor: "2026-07", rotulo: "Julho 2026" },
  { valor: "2026-08", rotulo: "Agosto 2026" },
];

const LancamentosPage = () => {
  // Guarda o valor no formato "YYYY-MM" para corresponder ao campo 'valor' do OpcaoMes
  const [mesSelecionado, setMesSelecionado] = useState<string>("2026-08");

  const handleAlterarMes = (novoMesValor: string) => {
    setMesSelecionado(novoMesValor);
    // Aqui você fará a busca dos lançamentos filtrando por este mês
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <HeaderLancamento
        mesSelecionado={mesSelecionado}
        onAlterarMes={handleAlterarMes}
        opcoesMeses={OPCOES_MESES_PADRAO}
      />
    </main>
  );
};

export default LancamentosPage;
