-- Run once in Supabase SQL Editor for project hefwxmhdgkeqtyyfpwub.
-- Public collaborative day-of task board: anyone with the URL can edit.
create table if not exists public.garrett_day_tasks (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 1 and 100),
 minutes integer not null default 30 check (minutes between 1 and 1440),
 status text not null default 'idle' check (status in ('idle','running','paused','done')),
 started_at timestamptz,
 first_started_at timestamptz,
 finished_at timestamptz,
 elapsed_ms bigint not null default 0 check (elapsed_ms >= 0),
 sort_order integer not null default 0,
 updated_at timestamptz not null default now()
);
alter table public.garrett_day_tasks enable row level security;
drop policy if exists "day_tasks_public_read" on public.garrett_day_tasks;
drop policy if exists "day_tasks_public_insert" on public.garrett_day_tasks;
drop policy if exists "day_tasks_public_update" on public.garrett_day_tasks;
drop policy if exists "day_tasks_public_delete" on public.garrett_day_tasks;
create policy "day_tasks_public_read" on public.garrett_day_tasks for select to anon using (true);
create policy "day_tasks_public_insert" on public.garrett_day_tasks for insert to anon with check (true);
create policy "day_tasks_public_update" on public.garrett_day_tasks for update to anon using (true) with check (true);
create policy "day_tasks_public_delete" on public.garrett_day_tasks for delete to anon using (true);
grant select,insert,update,delete on public.garrett_day_tasks to anon;
insert into public.garrett_day_tasks (name,minutes,sort_order)
select v.name,v.minutes,v.ord from (values
 ('Turkey #1',138,1),('Turkey #2',138,2),('Spiral ham',110,3),
 ('Green bean casserole',40,4),('Sweet potato casserole',40,5),
 ('Mac & cheese',40,6),('Mashed potatoes',45,7),('Gravy',15,8),
 ('Set up food station',30,9)) as v(name,minutes,ord)
where not exists (select 1 from public.garrett_day_tasks);
