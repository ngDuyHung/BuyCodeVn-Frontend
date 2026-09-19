# Sprint 00 - Bao cao thuc thi

Ngay thuc hien: 2026-09-18

## Ket qua

- Baseline lint: 17 errors, 16 warnings.
- Sau trien khai: 0 errors, 12 warnings ve cac the `<img>` cu.
- TypeScript: `npx tsc --noEmit` dat.
- Production build: dat, sinh thanh cong 10 static pages va Proxy.
- Route smoke test: `/`, `/login` tra 200; `/user/orders?status=completed` redirect 307 ve login va bao toan `returnUrl`.

## Da trien khai

- API URL qua `NEXT_PUBLIC_API_URL` va co validate URL.
- Type dung chung cho API, identity, catalog, services, orders va finance.
- API error model va response unwrap helper.
- Axios interceptor co phan biet 401 session voi 401 login, co co de caller tu hien thi loi.
- Tach root, client va auth layout.
- Session bootstrap qua `/auth/me`, dong bo Zustand/cookie khi het han.
- Proxy bao ve `/user/*` va dat san auth gate cho `/admin/*`.
- Helper format tien/ngay/status va validation co ban.
- Shared loading, empty, error va pagination components.
- Loai bo toan bo lint error `any` trong code hien tai.

## Contract da chot tu tai lieu

> Bang baseline ben duoi da duoc thay the boi unified envelope trong dot contract refresh ngay 2026-09-19. Xem `SPRINT_PLAN.md` va cac bao cao re-audit Sprint 01-02 de biet trang thai hien tai.

| Nhom | Response frontend dang parse |
| --- | --- |
| Resource | `{ data: T }` hoac `T` cho endpoint dang chuyen tiep |
| Pagination | `{ data: T[], links, meta }` |
| Business action | `{ success, message, data }` |
| Validation | HTTP 422, `{ message, errors: Record<string, string[]> }` |
| Business error | HTTP 400, `{ success: false, message }` |
| Download | Binary stream, khong qua JSON parser |

## Blocker/ton dong

- Backend timeout tai lan kiem tra ban dau; den 2026-09-19 da xac minh response envelope catalog va CORS local trong luc chot Sprint 02.
- 12 canh bao anh la no ky thuat san co; xu ly theo Sprint 02 va Sprint 08 khi chot `image_url`/remote image policy.
- Chua them test runner trong Sprint 00 vi repository chua co testing stack; se chot cong cu truoc cac integration test cua Sprint 01.
