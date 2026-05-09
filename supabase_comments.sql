-- Supabase 匿名评论系统初始化脚本
-- 使用方法：Supabase Dashboard -> SQL Editor -> New query -> 粘贴并运行
-- 这个版本可以重复运行；如果 policy 已存在，会先删除再创建。

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

drop policy if exists "Anyone can read approved comments" on public.comments;
drop policy if exists "Anyone can create comments" on public.comments;
drop policy if exists "Anyone can create pending comments" on public.comments;

-- 允许任何访客读取已通过的评论
create policy "Anyone can read approved comments"
  on public.comments
  for select
  using (status = 'approved');

-- 允许任何访客提交评论。
-- 当前配置为直接通过并显示；如果你想开启人工审核，请看下方可选版本。
create policy "Anyone can create comments"
  on public.comments
  for insert
  with check (
    status = 'approved'
    and length(trim(nickname)) between 1 and 40
    and length(trim(content)) between 1 and 1000
    and (email is null or length(trim(email)) <= 120)
  );

-- 可选：如果要人工审核：
-- 1. 把上面的 "Anyone can create comments" policy 删除或注释掉。
-- 2. 在 comments.js 里把 COMMENT_STATUS_ON_SUBMIT 改成 'pending'。
-- 3. 取消注释下面这个 policy 后运行。
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
