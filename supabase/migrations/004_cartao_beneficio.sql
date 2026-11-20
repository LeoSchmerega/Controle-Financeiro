-- 004_cartao_beneficio.sql
-- Cartão benefício (vale alimentação/refeição/transporte, ex: Caju, Flash,
-- VR) com saldos separados no mesmo cartão.
-- Rodar no Supabase: SQL Editor → colar tudo → Run (depois do 003).

-- Novo tipo de conta
alter table public.contas drop constraint if exists contas_tipo_check;
alter table public.contas add constraint contas_tipo_check
  check (tipo in ('cartao_credito', 'conta_corrente', 'carteira_digital', 'dinheiro', 'beneficio'));

-- Quais saldos o cartão benefício tem
alter table public.contas add column if not exists carteiras text[];
alter table public.contas drop constraint if exists contas_carteiras_check;
alter table public.contas add constraint contas_carteiras_check
  check (carteiras is null or carteiras <@ array['alimentacao', 'refeicao', 'transporte', 'livre']);

-- De qual saldo saiu (ou em qual entrou) cada lançamento / despesa fixa
alter table public.lancamentos add column if not exists carteira text
  check (carteira in ('alimentacao', 'refeicao', 'transporte', 'livre'));
alter table public.series_fixas add column if not exists carteira text
  check (carteira in ('alimentacao', 'refeicao', 'transporte', 'livre'));
