# Fy Control — Controle Financeiro Pessoal

Aplicação web para controle de finanças pessoais: cadastro de lançamentos (receitas e despesas), categorias personalizáveis, metas financeiras e um dashboard com visão consolidada, tudo em tempo real e a partir de uma única fonte de dados.

🔗 **Acesse online:** https://leoschmerega.github.io/Controle-Financeiro/

## ✨ Funcionalidades

- **Dashboard** — resumo financeiro do mês (receitas, despesas, saldo), gráfico de fluxo financeiro (receitas x despesas por período), despesas por categoria, últimos lançamentos e indicadores (maior categoria de gasto, categoria mais usada, economia do mês etc.)
- **Lançamentos** — cadastro, edição e exclusão de receitas/despesas, com filtros por período, categoria e tipo, navegação por mês de referência
- **Categorias** — CRUD completo de categorias (nome, cor, ícone, tipo), com controle de uso e vínculo com lançamentos
- **Metas financeiras** — criação de metas, acompanhamento de progresso e contribuições
- **Temas de cor** — personalização da identidade visual do app direto pela barra lateral, com a escolha salva no navegador

## 🛠️ Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build e dev server
- [Tailwind CSS v4](https://tailwindcss.com/) — estilização
- [Recharts](https://recharts.org/) — gráficos
- [Lucide React](https://lucide.dev/) — ícones

## 🚀 Rodando localmente

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento
npm run dev

# build de produção
npm run build

# pré-visualizar o build
npm run preview
```

## 📦 Deploy

O deploy é automático: a cada push na branch `main`, um workflow do GitHub Actions builda o projeto e publica no GitHub Pages.

## 📁 Estrutura do projeto

```
src/
├── components/     # Componentes organizados por domínio (Dashboard, Lancamentos, Categoria, SideBar)
├── context/         # Estado global da aplicação (FinanceContext)
├── pages/           # Páginas principais (Dashboard, Lançamentos, Categorias)
├── types/           # Tipagens compartilhadas
├── utils/           # Funções utilitárias (datas, valores, temas, paleta visual)
├── hooks/
├── services/
└── styles/
```
