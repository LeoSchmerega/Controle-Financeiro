-- 002_perfil_no_cadastro.sql
-- Cria automaticamente a linha em public.perfis quando uma conta nova é
-- criada, usando os dados enviados no cadastro (nome, sobrenome, cpf,
-- telefone → options.data do signUp).
--
-- Por que no banco e não no app? Com "Confirm email" ligado, logo após o
-- cadastro ainda não existe sessão, então o app não tem permissão (RLS)
-- para gravar o perfil. O trigger roda no servidor e não depende disso.
--
-- Rodar no Supabase: SQL Editor → colar tudo → Run (depois do 001).

create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_cpf text := regexp_replace(coalesce(meta ->> 'cpf', ''), '[^0-9]', '', 'g');
  v_tel text := regexp_replace(coalesce(meta ->> 'telefone', ''), '[^0-9]', '', 'g');
begin
  -- O app já valida tudo; aqui só higienizamos. Valor fora do formato vira
  -- null em vez de impedir a criação da conta.
  insert into public.perfis (id, nome, sobrenome, cpf, telefone)
  values (
    new.id,
    left(trim(coalesce(meta ->> 'nome', '')), 60),
    left(trim(coalesce(meta ->> 'sobrenome', '')), 80),
    case when v_cpf ~ '^[0-9]{11}$' then v_cpf end,
    case when v_tel ~ '^[0-9]{10,11}$' then v_tel end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- A função só deve rodar pelo trigger, nunca chamada direto pela API
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();
