-- Friendsgiving database setup. Run once in your Supabase SQL Editor.
-- Visitors can add an entry; updates require that entry's private edit key.
-- Guest groupings stay in the page; no visitor can change someone else's entry.
begin;
create schema if not exists private_garrett;
revoke all on schema private_garrett from public, anon, authenticated;
create table if not exists public.garrett_signups (
 id uuid primary key,
 name text not null check (char_length(btrim(name)) between 1 and 60),
 bringing text not null check (char_length(btrim(bringing)) between 1 and 160),
 kind text not null check (kind in ('main','side','dessert','drink','other')),
 note text not null default '' check (char_length(note)<=160),
 drink_preference text not null default '' check (char_length(drink_preference)<=160),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists private_garrett.signup_keys (
 signup_id uuid primary key references public.garrett_signups(id) on delete cascade,
 token_hash text not null
);
alter table public.garrett_signups enable row level security;
alter table private_garrett.signup_keys enable row level security;
revoke all on public.garrett_signups from public, anon, authenticated;
revoke all on private_garrett.signup_keys from public, anon, authenticated;
grant select on public.garrett_signups to anon, authenticated;
drop policy if exists garrett_read_signups on public.garrett_signups;
create policy garrett_read_signups on public.garrett_signups for select to anon, authenticated using (true);
create or replace function public.garrett_save_signup(
 p_id uuid, p_token text, p_name text, p_bringing text, p_kind text,
 p_note text default '', p_drink_preference text default ''
) returns setof public.garrett_signups
language plpgsql security definer set search_path = ''
as $$
declare stored_hash text; incoming_hash text;
begin
 if p_id is null or p_token is null or p_token !~ '^[a-f0-9]{64}$'
 then raise exception 'Invalid edit key'; end if;
 incoming_hash := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')),'hex');
 select token_hash into stored_hash from private_garrett.signup_keys where signup_id=p_id for update;
 if stored_hash is null then
   insert into public.garrett_signups (id,name,bringing,kind,note,drink_preference)
   values (p_id,btrim(p_name),btrim(p_bringing),p_kind,coalesce(btrim(p_note),''),coalesce(btrim(p_drink_preference),''));
   insert into private_garrett.signup_keys (signup_id,token_hash) values (p_id,incoming_hash);
 else
   if stored_hash <> incoming_hash then raise exception 'This edit key does not match this entry'; end if;
   update public.garrett_signups set name=btrim(p_name),bringing=btrim(p_bringing),kind=p_kind,
     note=coalesce(btrim(p_note),''),drink_preference=coalesce(btrim(p_drink_preference),''),updated_at=now()
     where id=p_id;
 end if;
 return query select * from public.garrett_signups where id=p_id;
end;
$$;
revoke all on function public.garrett_save_signup(uuid,text,text,text,text,text,text) from public;
grant execute on function public.garrett_save_signup(uuid,text,text,text,text,text,text) to anon, authenticated;
commit;
notify pgrst, 'reload schema';
