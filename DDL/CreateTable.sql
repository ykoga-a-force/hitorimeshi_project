-- publicスキーマに posts テーブルを作成します
CREATE TABLE public.posts (
    -- id: 重複しないID。UUID形式で自動的に作られます（プライマリキー）
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- lat: 緯度（小数点付きの数字）
    lat FLOAT8 NOT NULL,
    
    -- lng: 経度（小数点付きの数字）
    lng FLOAT8 NOT NULL,
    
    -- image_url: 写真が保存されている場所のURL（長い文字）
    image_url TEXT NOT NULL,
    
    -- comment: ひとことメモ（最大40文字まで）
    comment VARCHAR(40),
    
    -- created_at: 投稿された日時（何も入力しないと、その時の時間が自動で入ります）
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);





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


