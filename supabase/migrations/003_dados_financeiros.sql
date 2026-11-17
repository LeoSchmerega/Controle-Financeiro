-- 003_dados_financeiros.sql
-- Tabelas dos dados financeiros: contas/cartões, categorias, lançamentos,
-- despesas fixas recorrentes e metas. Todas pertencem a um usuário
-- (user_id) e são protegidas por RLS: cada pessoa só lê e altera o que é dela.
--
-- Os ids são texto gerado pelo app (ex: "lanc_1731..."), por isso a chave
-- primária é (user_id, id) — dois usuários podem ter um "cat_1" cada.
--
-- Rodar no Supabase: SQL Editor → colar tudo → Run (depois do 001 e 002).

-- ---------------------------------------------------------------- contas
create table if not exists public.contas (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  nome text not null check (char_length(nome) between 1 and 40),
  tipo text not null check (tipo in ('cartao_credito', 'conta_corrente', 'carteira_digital', 'dinheiro')),
  cor text not null,
  ativa boolean not null default true,
  ordem integer not null default 0,
  ultimos_digitos text check (ultimos_digitos is null or ultimos_digitos ~ '^[0-9]{4}$'),
  dia_fechamento smallint check (dia_fechamento between 1 and 31),
  dia_vencimento smallint check (dia_vencimento between 1 and 31),
  limite numeric(12, 2) check (limite is null or limite >= 0),
  primary key (user_id, id)
);

-- ------------------------------------------------------------ categorias
create table if not exists public.categorias (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  icone text,
  cor text not null,
  ativa boolean not null default true,
  ordem integer not null default 0,
  orcamento_mensal numeric(12, 2),
  padrao boolean not null default false,
  primary key (user_id, id)
);

-- ----------------------------------------------------------- lancamentos
create table if not exists public.lancamentos (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  descricao text not null,
  valor numeric(12, 2) not null,
  data date not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  tipo_gasto text check (tipo_gasto in ('fixo', 'variavel')),
  categoria_id text not null,
  conta_id text,
  forma_pagamento text not null,
  observacao text,
  parcela_grupo_id text,
  parcela_numero smallint,
  parcela_total smallint,
  recorrencia_fixa_id text,
  primary key (user_id, id)
);

create index if not exists lancamentos_user_data_idx on public.lancamentos (user_id, data);

-- ---------------------------------------------------------- series_fixas
create table if not exists public.series_fixas (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  descricao text not null,
  valor numeric(12, 2) not null,
  categoria_id text not null,
  conta_id text,
  forma_pagamento text not null,
  observacao text,
  dia_do_mes smallint not null check (dia_do_mes between 1 and 31),
  mes_inicio text not null check (mes_inicio ~ '^[0-9]{4}-[0-9]{2}$'),
  mes_fim text check (mes_fim is null or mes_fim ~ '^[0-9]{4}-[0-9]{2}$'),
  meses_excluidos text[] not null default '{}',
  primary key (user_id, id)
);

-- ----------------------------------------------------------------- metas
create table if not exists public.metas (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  nome text not null,
  valor_objetivo numeric(12, 2) not null,
  valor_acumulado numeric(12, 2) not null default 0,
  cor text not null,
  icone text not null,
  primary key (user_id, id)
);

-- ------------------------------------------------------------------- RLS
-- Mesma regra para as cinco tabelas: só o dono da linha pode ler/gravar.
do $$
declare
  tabela text;
begin
  foreach tabela in array array['contas', 'categorias', 'lancamentos', 'series_fixas', 'metas']
  loop
    execute format('alter table public.%I enable row level security', tabela);
    execute format('drop policy if exists "dono acessa" on public.%I', tabela);
    execute format(
      'create policy "dono acessa" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)',
      tabela
    );
  end loop;
end;
$$;
