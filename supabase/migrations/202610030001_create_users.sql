create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
grant update (display_name, updated_at) on table public.users to authenticated;
grant all on table public.users to service_role;

drop policy if exists users_select_self on public.users;
create policy users_select_self
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists users_update_self on public.users;
create policy users_update_self
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  initial_role text;
begin
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtextextended('public.users:first-admin-bootstrap', 0));
    if exists (select 1 from public.users where role = 'admin') then
      initial_role := 'viewer';
    else
      initial_role := 'admin';
    end if;

    insert into public.users (id, email, display_name, role)
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'display_name', ''),
      initial_role
    )
    on conflict (id) do update
      set email = excluded.email,
          display_name = excluded.display_name,
          updated_at = now();
  else
    update public.users
      set email = coalesce(new.email, ''),
          display_name = coalesce(new.raw_user_meta_data ->> 'display_name', ''),
          updated_at = now()
      where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_created on auth.users;
create trigger on_auth_user_profile_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_auth_user_profile();

grant usage on schema public to authenticated;
grant execute on function public.handle_auth_user_profile() to supabase_auth_admin;