create table public.media_pr_reviews (
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id),
  requested_by uuid not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  approved_by uuid,
  report text,
  check ((completed_at is null and approved_by is null and report is null)
    or (completed_at is not null and approved_by is not null and report is not null))
);
alter table public.media_pr_reviews enable row level security;
revoke all on public.media_pr_reviews from public, anon, authenticated;
grant select, insert, update on public.media_pr_reviews to service_role;
create index media_pr_reviews_workspace on public.media_pr_reviews(workspace_id, requested_at desc);
