-- =============================================
-- 웹진 CMS - Supabase DB 스키마
-- Supabase Dashboard > SQL Editor 에서 실행
-- =============================================


-- ===== 1. 유저 =====
CREATE TABLE users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  name         text NOT NULL,
  password_hash text NOT NULL,
  role         text NOT NULL DEFAULT 'reporter',  -- admin / editor / reporter
  last_login_at timestamptz,
  created_at   timestamptz DEFAULT now()
);


-- ===== 2. 디자인 템플릿 =====
CREATE TABLE templates (
  id           bigserial PRIMARY KEY,
  name         text NOT NULL,
  description  text,
  layout_type  text NOT NULL,   -- basic / image-top / image-left / image-right / image-2col / magazine
  image_slots  int  NOT NULL DEFAULT 0,
  slot_labels  jsonb NOT NULL DEFAULT '[]',
  created_at   timestamptz DEFAULT now()
);


-- ===== 3. 기사 =====
CREATE TABLE articles (
  id           bigserial PRIMARY KEY,
  title        text NOT NULL,
  category     text,
  author_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'draft',  -- published / draft / archived
  content      text,
  template_id  bigint REFERENCES templates(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- 기사 이미지 슬롯
CREATE TABLE article_images (
  id          bigserial PRIMARY KEY,
  article_id  bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  slot        int    NOT NULL,
  url         text,
  name        text,
  created_at  timestamptz DEFAULT now()
);


-- ===== 4. 구독자 =====
CREATE TABLE subscribers (
  id              bigserial PRIMARY KEY,
  email           text UNIQUE NOT NULL,
  status          text NOT NULL DEFAULT 'active',  -- active / inactive
  subscribed_at   timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);


-- ===== 5. 메인 페이지 구성 =====
-- 최신 1건만 사용 (sections 전체를 JSON으로 저장)
CREATE TABLE main_page_config (
  id          bigserial PRIMARY KEY,
  sections    jsonb NOT NULL DEFAULT '[]',
  updated_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at  timestamptz DEFAULT now()
);


-- ===== 6. 웹진 발송 이력 =====
CREATE TABLE webzine_history (
  id            bigserial PRIMARY KEY,
  issue         int NOT NULL,
  year_month    text NOT NULL,   -- 예: '2025-05'
  sent_at       timestamptz,
  article_count int DEFAULT 0,
  status        text DEFAULT 'sent',
  html_url      text,
  created_at    timestamptz DEFAULT now()
);


-- ===== RLS 활성화 =====
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE webzine_history ENABLE ROW LEVEL SECURITY;


-- ===== 기본 시드 데이터 - 템플릿 =====
INSERT INTO templates (name, description, layout_type, image_slots, slot_labels) VALUES
  ('기본형',       '이미지 없이 제목과 본문만 표시합니다.',                    'basic',       0, '[]'),
  ('이미지 상단형', '대표 이미지가 상단에, 본문이 아래에 배치됩니다.',           'image-top',   1, '["대표 이미지"]'),
  ('좌측 이미지형', '이미지가 좌측, 본문이 우측에 나란히 배치됩니다.',           'image-left',  1, '["좌측 이미지"]'),
  ('우측 이미지형', '본문이 좌측, 이미지가 우측에 나란히 배치됩니다.',           'image-right', 1, '["우측 이미지"]'),
  ('2단 이미지형',  '이미지 2개가 나란히, 본문이 아래에 배치됩니다.',            'image-2col',  2, '["이미지 1", "이미지 2"]'),
  ('매거진형',      '상단 대표 이미지, 본문, 하단 보조 이미지 2개로 구성됩니다.', 'magazine',    3, '["대표 이미지", "보조 이미지 1", "보조 이미지 2"]');
