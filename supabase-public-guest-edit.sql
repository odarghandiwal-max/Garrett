-- Run ONCE in Supabase SQL Editor for the existing Garrett guest list.
-- Does not delete or replace existing guest rows.
begin;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.garrett_guest_groups to anon, authenticated;
alter table public.garrett_guest_groups enable row level security;
drop policy if exists "Anyone can read guest groups" on public.garrett_guest_groups;
drop policy if exists "Only host admins insert guest groups" on public.garrett_guest_groups;
drop policy if exists "Only host admins update guest groups" on public.garrett_guest_groups;
drop policy if exists "Only host admins delete guest groups" on public.garrett_guest_groups;
drop policy if exists "Anyone can insert guest groups" on public.garrett_guest_groups;
drop policy if exists "Anyone can update guest groups" on public.garrett_guest_groups;
drop policy if exists "Anyone can delete guest groups" on public.garrett_guest_groups;
create policy "Anyone can read guest groups" on public.garrett_guest_groups for select to anon, authenticated using (true);
create policy "Anyone can insert guest groups" on public.garrett_guest_groups for insert to anon, authenticated with check (true);
create policy "Anyone can update guest groups" on public.garrett_guest_groups for update to anon, authenticated using (true) with check (true);
create policy "Anyone can delete guest groups" on public.garrett_guest_groups for delete to anon, authenticated using (true);
commit;
notify pgrst, 'reload schema';
