# 🎫 TiKi

**공연·전시·클래스·팬미팅 등 다양한 일정 기반 상품을 판매할 수 있는 예약형 티켓 오픈마켓 플랫폼**

- 기존 이커머스 구조에 슬롯 기반 예약 시스템, 실시간 잔여석 관리, QR 티켓 발급 기능을 결합함.
- 공연 라이브러리 기능을 통해 티켓팅 이후의 사용자 경험까지 확장함.
- 날짜·시간 슬롯 기반의 공통 도메인 구조를 설계하여 다양한 예약형 상품으로 확장 가능함.

## 👥 Team Members

> 팀장 상단 배치, 팀원 이름순 나열

| 역할        | 이름   |
| ----------- | ------ |
| Team Leader | 강재훈 |
| Team Member | 김연수 |
| Team Member | 방효진 |
| Team Member | 이선우 |

## 📅 Project Duration

**2026.05.28 ~ 2026.07.08**

## 🛠 Tech Stack

## ✨ Features

## 📂 Folder Structure

```plaintext
├── public/                  # 정적 파일 (이미지, 아이콘 등)
├── review/                  # 리뷰 및 가이드 문서, E2E 테스트 관련 기록
├── src/                     # 소스 코드 메인 폴더 (Next.js App Router 기반)
│   ├── app/                 # 라우팅 페이지 및 레이아웃 (layout.tsx, page.tsx 등)
│   ├── components/          # 재사용 가능한 공통 컴포넌트
│   ├── hooks/               # 커스텀 훅 관리 폴더
│   ├── lib/                 # 유틸리티 함수, 외부 라이브러리 및 API 설정
│   └── proxy.ts             # 프록시 서버 설정 파일
├── eslint.config.mjs        # ESLint 린트 설정 코드
├── next-env.d.ts            # Next.js TypeScript 타입 정의 파일
├── next.config.ts           # Next.js 환경 설정 파일
├── package-lock.json        # 의존성 잠금 파일 (패키지 버전 고정)
├── package.json             # 프로젝트 의존성(라이브러리) 및 스크립트 관리
├── postcss.config.mjs       # PostCSS 설정 (Tailwind CSS 스타일링 연동)
├── tsconfig.json            # TypeScript 컴파일러 옵션 설정
└── README.md                # 프로젝트 메인 가이드 문서
```

## 🌿 Git Convention

## ⚙️ 환경 변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 Supabase 값을 채움. (팀원은 공유받은 값 사용)

```bash
cp .env.example .env.local
```
