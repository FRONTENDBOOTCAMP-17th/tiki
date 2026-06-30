-- 좌석을 등급과 별개로 구역/그룹으로 묶어 관리하기 위한 컬럼.
-- 별도 그룹 테이블 없이 자유 텍스트로 둔다(그룹 목록은 seat.group_name distinct 값으로 도출).
alter table public.seat add column if not exists group_name text;
