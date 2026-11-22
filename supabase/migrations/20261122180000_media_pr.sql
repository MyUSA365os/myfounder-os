create table public.media_pr_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null default public.my_workspace_id() references public.workspaces(id) on delete cascade,
  company text not null check (char_length(company) between 1 and 120),
  campaign text not null check (char_length(campaign) between 1 and 160),
  kind text not null check (kind in ('campaign','pitch','relationship','response','interview','coverage','backlink','referral','lead','client_result')),
  title text not null check (char_length(title) between 1 and 200),
  stage text not null default 'draft' check (stage in ('draft','review','recorded','archived')),
  source_ref text check (char_length(source_ref) <= 1000),
  quantity integer check (quantity is null or (quantity >= 0 and kind in ('referral','lead','client_result'))),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index media_pr_records_workspace on public.media_pr_records(workspace_id, occurred_on desc);
alter table public.media_pr_records enable row level security;
revoke all on public.media_pr_records from anon, authenticated;
grant select on public.media_pr_records to authenticated;
grant insert (workspace_id, company, campaign, kind, title, source_ref, quantity, occurred_on)
  on public.media_pr_records to authenticated;
grant update(stage) on public.media_pr_records to authenticated;
create policy media_pr_workspace on public.media_pr_records to authenticated
  using (workspace_id = (select public.my_workspace_id()))
  with check (workspace_id = (select public.my_workspace_id()));

create table public.media_pr_audit (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null,
  record_id uuid references public.media_pr_records(id) on delete cascade,
  action text not null check (action in ('created','stage_changed','mcp_probe')),
  occurred_at timestamptz not null default now()
);
create index media_pr_audit_workspace on public.media_pr_audit(workspace_id, occurred_at desc);
alter table public.media_pr_audit enable row level security;
revoke all on public.media_pr_audit from anon, authenticated;
grant select on public.media_pr_audit to authenticated;
grant insert on public.media_pr_audit to service_role;
create policy media_pr_audit_read on public.media_pr_audit for select to authenticated
  using (workspace_id = (select public.my_workspace_id()));

create function public.audit_media_pr_record() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.stage = old.stage then return new; end if;
  insert into public.media_pr_audit (workspace_id, actor_id, record_id, action)
    values (new.workspace_id, auth.uid(), new.id, case when tg_op = 'INSERT' then 'created' else 'stage_changed' end);
  return new;
end;
$$;
revoke all on function public.audit_media_pr_record() from public, anon, authenticated;
create trigger media_pr_record_audit after insert or update on public.media_pr_records
  for each row execute function public.audit_media_pr_record();
