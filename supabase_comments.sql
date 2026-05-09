-- Supabase 匿名评论系统初始化脚本
-- 使用方法：Supabase Dashboard -> SQL Editor -> New query -> 粘贴并运行

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  nickname text not null default '匿名访客',
  email text,
  content text not null,
  user_agent text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists comments_page_path_created_at_idx
  on public.comments (page_path, created_at desc);

create index if not exists comments_status_idx
  on public.comments (status);

alter table public.comments enable row level security;

-- 允许任何访客读取已通过的评论
create policy "Anyone can read approved comments"
  on public.comments
  for select
  using (status = 'approved');

-- 允许任何访客提交评论，但只能提交为 approved/pending/rejected 以外无法绕过 check；
-- with check 固定限制新评论必须是 approved。若你想开启人工审核，把 'approved' 改成 'pending'，
-- 同时前端提交后会提示等待审核。
create policy "Anyone can create comments"
  on public.comments
  for insert
  with check (
    status = 'approved'
    and length(trim(nickname)) between 1 and 40
    and length(trim(content)) between 1 and 1000
    and (email is null or length(trim(email)) <= 120)
  );

-- 可选：如果要人工审核，把上面的 insert policy 删除后运行这个：
-- create policy "Anyone can create pending comments"
--   on public.comments
--   for insert
--   with check (
--     status = 'pending'
--     and length(trim(nickname)) between 1 and 40
--     and length(trim(content)) between 1 and 1000
--     and (email is null or length(trim(email)) <= 120)
--   );

-- 可选：在 Supabase Table Editor 里手动把 status 从 pending 改为 approved 即可显示。
