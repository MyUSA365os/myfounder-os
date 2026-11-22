begin;
insert into auth.users (id, email) values
  ('b1100000-0000-4000-8000-000000000001', 'pr-rls-a@example.invalid'),
  ('b1100000-0000-4000-8000-000000000002', 'pr-rls-b@example.invalid');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'b1100000-0000-4000-8000-000000000001', true);
insert into public.media_pr_records (company, campaign, kind, title)
  values ('MyUSA', 'RLS test', 'campaign', 'Test campaign');
update public.media_pr_records set stage = 'recorded' where campaign = 'RLS test';

do $$
begin
  if (select count(*) from public.media_pr_records where campaign = 'RLS test') <> 1 then
    raise exception 'Owner cannot read own record';
  end if;
  if (select count(*) from public.media_pr_audit where action in ('created','stage_changed')) <> 2 then
    raise exception 'Owner did not receive both audit events';
  end if;
  begin
    update public.media_pr_audit set action = 'mcp_probe';
    raise exception 'Audit records are mutable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', 'b1100000-0000-4000-8000-000000000002', true);
do $$
begin
  if exists(select 1 from public.media_pr_records where campaign = 'RLS test') then
    raise exception 'Other owner can read PR records';
  end if;
  if exists(select 1 from public.media_pr_audit) then
    raise exception 'Other owner can read PR audits';
  end if;
end;
$$;
rollback;
