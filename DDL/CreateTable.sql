c




-- publicスキーマにpostsテーブルを作成するっぴ！
create table public.posts (
  id uuid not null default gen_random_uuid(), -- 自動生成されるIDだっぴ
  lat float8 not null,                        -- 緯度
  lng float8 not null,                        -- 経度
  image_url text,                             -- 写真のURL
  comment text check (char_length(comment) <= 40), -- 40文字以内の制約付きだっぴ！
  created_at timestamptz not null default now(), -- 投稿時刻（デフォルトは今！）

  primary key (id)
);

-- 誰でもデータを読み書きできるように設定するっぴ（開発用）
alter table public.posts enable row level security;
create policy "誰でも投稿・閲覧OK" on public.posts for all using (true) with check (true);




最新のDDL
削除用パスワードと桁数

create table public.posts (
  id uuid not null default gen_random_uuid(),
  lat float8 not null,
  lng float8 not null,
  image_url text,
  comment varchar(40),
  created_at timestamptz not null default now(),
  delete_password varchar(8), -- ここをきっちり8文字にしたっぴ！
  primary key (id)
);
