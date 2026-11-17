-- 001_perfis.sql
-- Dados cadastrais de cada usuário (1 linha por conta). O email NÃO fica
-- aqui: ele é do Supabase Auth (auth.users) e é alterado por lá.
-- Rodar no Supabase: SQL Editor → colar tudo → Run.

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  sobrenome text not null default '',
  -- Guardados só com dígitos; a máscara é aplicada na tela
  cpf text check (cpf is null or cpf ~ '^[0-9]{11}$'),
  telefone text check (telefone is null or telefone ~ '^[0-9]{10,11}$'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- RLS: cada pessoa só enxerga e altera o próprio perfil
alter table public.perfis enable row level security;

drop policy if exists "perfis: ver o proprio" on public.perfis;
create policy "perfis: ver o proprio" on public.perfis
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "perfis: criar o proprio" on public.perfis;
create policy "perfis: criar o proprio" on public.perfis
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "perfis: editar o proprio" on public.perfis;
create policy "perfis: editar o proprio" on public.perfis
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Atualiza "atualizado_em" automaticamente a cada edição
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists perfis_atualizado_em on public.perfis;
create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();
