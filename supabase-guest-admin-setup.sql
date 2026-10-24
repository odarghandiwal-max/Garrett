-- Run in Supabase SQL Editor. Create two users in Authentication > Users first.
-- Then replace the UUID placeholders at the bottom with their Auth user IDs.
begin;
create table if not exists public.garrett_guest_groups (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(trim(label)) between 1 and 100),
 names jsonb not null default '[]'::jsonb check (jsonb_typeof(names)='array'),
 kids jsonb not null default '[]'::jsonb check (jsonb_typeof(kids)='array'),
 status text not null default 'invited' check (status in ('invited','confirmed','maybe','declined')),
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.garrett_guest_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.garrett_guest_groups enable row level security;
alter table public.garrett_guest_admins enable row level security;
revoke all on public.garrett_guest_admins from anon, authenticated;
grant select on public.garrett_guest_groups to anon, authenticated;
grant insert,update,delete on public.garrett_guest_groups to authenticated;
create or replace function public.garrett_is_guest_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.garrett_guest_admins where user_id=auth.uid());
$$;
revoke all on function public.garrett_is_guest_admin() from public;
grant execute on function public.garrett_is_guest_admin() to authenticated;
drop policy if exists "Anyone can read guest groups" on public.garrett_guest_groups;
create policy "Anyone can read guest groups" on public.garrett_guest_groups for select to anon,authenticated using (true);
drop policy if exists "Only host admins insert guest groups" on public.garrett_guest_groups;
create policy "Only host admins insert guest groups" on public.garrett_guest_groups for insert to authenticated with check (public.garrett_is_guest_admin());
drop policy if exists "Only host admins update guest groups" on public.garrett_guest_groups;
create policy "Only host admins update guest groups" on public.garrett_guest_groups for update to authenticated using (public.garrett_is_guest_admin()) with check (public.garrett_is_guest_admin());
drop policy if exists "Only host admins delete guest groups" on public.garrett_guest_groups;
create policy "Only host admins delete guest groups" on public.garrett_guest_groups for delete to authenticated using (public.garrett_is_guest_admin());
insert into public.garrett_guest_groups(label,names,kids,status,sort_order)
select v.label,v.names::jsonb,v.kids::jsonb,v.status,v.sort_order from (values
 ('Sterling & Jasmine','["Sterling","Jasmine"]','["Harlo","Atlas"]','invited',1),
 ('Tyler & Kayla','["Tyler","Kayla"]','["Hunter"]','invited',2),
 ('Sophia & Parker','["Sophia","Parker"]','[]','invited',3),
 ('Adi & Dolav','["Adi","Dolav"]','[]','invited',4),
 ('Shauna & Paul','["Shauna","Paul"]','[]','invited',5),
 ('Annabelle & Rafik','["Annabelle","Rafik"]','[]','maybe',6),
 ('Evan & Louise','["Evan","Louise"]','[]','maybe',7),
 ('Michelle','["Michelle"]','[]','invited',8),
 ('Brad','["Brad"]','[]','invited',9),
 ('Nawa','["Nawa"]','[]','invited',10),
 ('Zoe','["Zoe"]','[]','maybe',11)
) as v(label,names,kids,status,sort_order)
where not exists(select 1 from public.garrett_guest_groups);
commit;

-- After creating separate Supabase Auth users for both hosts, run:
-- insert into public.garrett_guest_admins(user_id) values
-- ('REPLACE_WITH_ONAY_AUTH_USER_UUID'),
-- ('REPLACE_WITH_JORDAN_AUTH_USER_UUID')
-- on conflict do nothing;
-- Never place passwords, service_role keys, or UUID-based admin grants in public GitHub files.
