# 헤더 프로필 메뉴 리뷰 반영 기록

15차 리뷰(`review/202606301056-리뷰.md`)에서 헤더 프로필 드롭다운(`ProfileMenu`)에 두 가지 피드백을 받았다. 둘 다 [사소·LOW]지만 구조랑 접근성에 관한 거라 이번에 같이 정리했다.

- 서버에서 `loggedIn`을 props로 받는데 클라이언트에서 사용자 정보를 또 조회한다(waterfall)
- 드롭다운에 `Escape` 닫기랑 포커스 트랩이 없어서 키보드로는 다루기 어렵다

아래는 각각 왜 그랬고 어떻게 바꿨는지에 대한 기록.

## 1. 클라이언트 재조회 없애기

### 원래 어땠나

페이지(서버 컴포넌트)는 이미 `isAuthenticated()`로 로그인 여부를 확인해서 `Header`에 `loggedIn`을 내려주고 있었다. 그런데 정작 `ProfileMenu`는 마운트된 뒤에 클라이언트에서 사용자 정보를 한 번 더 가져왔다.

```ts
// 수정 전 — ProfileMenu.tsx
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) return;
    const { data } = await supabase
      .from("users")
      .select("name, avatar_url, role")
      .eq("id", user.id)
      .single();
    // ...setProfile
  });
}, []);
```

서버 조회가 끝나야 렌더되고, 그 뒤에 클라이언트가 또 조회하는 식으로 **순서대로 이루어지는 워터폴 형식**이라 고쳤다. 같은 정보를 위해 왕복이 한 번 더 생기고 아바타·이름도 한 박자 늦게 채워졌다. 특히 마이페이지 레이아웃은 서버에서 똑같은 `{ name, role, avatar_url }`을 이미 조회해 쓰고 있었는데도 `ProfileMenu`가 또 가져오는 중복이 있었다.

### 어떻게 바꿨나

"서버에서 한 번 조회해서 props로 내려준다"는 흐름으로 통일했다. 클라이언트 조회(`useEffect` + `createClient`)는 전부 걷어냈고, `ProfileMenu`는 받은 값만 그리는 컴포넌트가 됐다.

먼저 서버 쪽 진입점을 하나 만들었다.

```ts
// src/lib/auth.ts — 로그인 상태가 아니면 null
export async function getHeaderProfile(): Promise<HeaderProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return {
    name: data?.name ?? "",
    avatarUrl: data?.avatar_url ?? null,
    role: data?.role ?? "buyer",
  };
}
```

`Header`는 `profile`을 받아 `ProfileMenu`로 넘겨주고, 페이지는 기존 `isAuthenticated()` 자리를 `getHeaderProfile()`로 바꾼 뒤 `loggedIn`은 그 결과에서 파생했다. `getUser` 호출 수는 페이지당 1회로 그대로 유지되고, 사라지는 건 클라이언트 왕복뿐이다.

```tsx
// 예) ranking/page.tsx
const [initialItems, profile, categories] = await Promise.all([
  fetchRanking({ limit: 10 }),
  getHeaderProfile(),
  fetchCategories(),
]);
const loggedIn = !!profile;
// ...
<Header loggedIn={loggedIn} profile={profile} />
```

마이페이지는 이미 들고 있던 `profile`을 그대로 넘기면 돼서 추가 조회가 아예 없어졌고, 결제 페이지도 서버에서 사용자를 이미 조회하니 그 쿼리에 `avatar_url, role`만 더해 `PaymentForm` → `Header`로 흘려보냈다.

## 2. 드롭다운 키보드 접근성

### 이전엔

열린 드롭다운은 화면을 덮는 `fixed inset-0` div를 클릭해야만 닫혔다. 결국 마우스로만 닫을 수 있었고 `Escape`는 먹지 않았다. 메뉴가 열려도 포커스가 트리거 버튼에 그대로 있어서 `Tab`을 누르면 드롭다운 바깥으로 빠져나가 버렸다.

### 바꾼 뒤

`Escape` 닫기, 포커스 이동·복원, `Tab` 순환(포커스 트랩), 그리고 ARIA 속성을 더했다.

```tsx
// 열린 동안: Esc로 닫고, 첫 항목으로 포커스를 옮기고, 닫히면 트리거로 되돌린다
useEffect(() => {
  if (!open) return;
  const trigger = triggerRef.current;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }
  document.addEventListener("keydown", handleKeyDown);

  const first = menuRef.current?.querySelector<HTMLElement>("a, button");
  first?.focus();

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    trigger?.focus();
  };
}, [open]);

// Tab이 드롭다운 밖으로 나가지 않게 처음/끝에서 순환시킨다
function handleTrapTab(e: React.KeyboardEvent) {
  if (e.key !== "Tab") return;
  const items = menuRef.current?.querySelectorAll<HTMLElement>("a, button");
  if (!items || items.length === 0) return;

  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
```

트리거 버튼에는 `aria-haspopup="menu"`와 `aria-expanded`, 드롭다운에는 `role="menu"`를 붙여 메뉴 상태를 읽을 수 있게 했다. 기존 바깥 클릭 닫기는 그대로 둔다.

## 3. 바뀐 파일

| 파일 | 무엇이 바뀌었나 |
|---|---|
| `lib/auth.ts` | `getHeaderProfile()` 추가 |
| `components/ProfileMenu.tsx` | 클라이언트 조회 제거 → props 기반, Esc·포커스 트랩·ARIA 추가 |
| `components/Header.tsx` | `profile`을 받아 `ProfileMenu`로 전달(없으면 안전한 기본값) |
| `page.tsx`, `ranking`, `open`, `category`, `category/[slug]` | `isAuthenticated()` → `getHeaderProfile()`, `profile` 전달 |
| `[eventId]/page.tsx` | id가 필요한 `user`는 두고 `getHeaderProfile()`를 병렬로 추가 |
| `mypage/layout.tsx` | 이미 조회해 둔 `profile`을 그대로 전달 |
| `payment/[orderId]/page.tsx`, `PaymentForm.tsx` | users 조회에 `avatar_url, role` 추가 후 `Header`로 전달 |

---

**요약:** 워터폴 방식으로 짜여진 코드를 없애고 서버에서 받은 프로필을 props로 쓰도록 바꿨으며, 드롭다운에 Esc 닫기·포커스 트랩·ARIA를 더해 키보드로도 다룰 수 있게 했다.
