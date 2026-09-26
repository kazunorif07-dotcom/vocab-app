-- 単語カードのテーブル
create table public.cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  word          text not null,
  meaning       text not null,
  example       text not null default '',
  example_ja    text not null default '',
  -- SM-2 用
  ease_factor   real not null default 2.5,
  interval_days integer not null default 0,
  repetitions   integer not null default 0,
  due_date      date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cards_user_due_idx on public.cards (user_id, due_date);

-- 行レベルセキュリティ：ログインした本人の行だけ読み書きできる
alter table public.cards enable row level security;

create policy "自分のカードを読む" on public.cards
  for select to authenticated using (auth.uid() = user_id);

create policy "自分のカードを追加" on public.cards
  for insert to authenticated with check (auth.uid() = user_id);

create policy "自分のカードを更新" on public.cards
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "自分のカードを削除" on public.cards
  for delete to authenticated using (auth.uid() = user_id);

-- 更新したときに updated_at を自動で今の時刻にする
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();
