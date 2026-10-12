-- Shared potluck editing, requested by the host.
-- Anyone with the page link may edit any potluck entry.
-- No sign-in or private edit key is required. Deletes are not enabled.
create or replace function public.garrett_save_signup(
 p_id uuid, p_token text, p_name text, p_bringing text, p_kind text,
 p_note text default '', p_drink_preference text default ''
) returns setof public.garrett_signups
language plpgsql security definer set search_path = ''
as $$
begin
 if p_id is null then raise exception 'An entry ID is required'; end if;
 insert into public.garrett_signups (id,name,bringing,kind,note,drink_preference)
 values (p_id,btrim(p_name),btrim(p_bringing),p_kind,coalesce(btrim(p_note),''),coalesce(btrim(p_drink_preference),''))
 on conflict (id) do update set
 name=excluded.name,bringing=excluded.bringing,kind=excluded.kind,
 note=excluded.note,drink_preference=excluded.drink_preference,updated_at=now();
 return query select * from public.garrett_signups where id=p_id;
end;
$$;
revoke all on function public.garrett_save_signup(uuid,text,text,text,text,text,text) from public;
grant execute on function public.garrett_save_signup(uuid,text,text,text,text,text,text) to anon, authenticated;
notify pgrst, 'reload schema';
