# Sprint 08 - Client hardening va release gate

Ngay hoan thanh frontend hardening: 2026-09-20

## Ket qua

- Audit source va navigation: production scope khong con `href="#"`, `/lien-he`, `/user/vps` hoac `MOCK_ORDERS`.
- Bo Blog/VPS gia khoi production; homepage chi render catalog va hosting co API that. Dich vu chua co contract hien `Sap ra mat` thay vi CTA gia.
- Them focus-visible toan cuc, reduced motion, mobile menu dialog va focus trap/Escape/restore-focus cho mobile menu va ba checkout.
- Them `error.tsx`, `not-found.tsx`, `loading.tsx`, offline banner va thong bao timeout/network co the hanh dong.
- Auth/session duoc verify voi envelope moi, `/auth/me`, TTL 7 ngay, expiry cleanup, 401 redirect va safe return URL.
- Anh local chuyen sang `next/image`; hero/fallback doi WebP: hero 1.30 MB -> 95.9 KB, fallback 5.82 MB -> 206.7 KB.
- Featured product va hosting section duoc dynamic import voi loading skeleton; request doc lap chay song song.
- Security audit: khong render HTML tu API, external demo chi cho HTTP/HTTPS + `noopener noreferrer`, filename download duoc sanitize, CCCD khong persist, credential/password khong log/persist.
- Error contract giu `code`, `request_id`, validation details, `Retry-After`; decimal money van dung string + `decimal.js`.

## Kiem thu

- `npm test`: 39 files, 101 tests dat.
- `npx tsc --noEmit`: dat.
- `npm run lint`: dat, 0 error va 0 warning.
- `npm run build`: dat, 17 static/dynamic routes duoc generate.
- Frontend smoke: `/` va `/source-code` tra 200; `/user` khi chua login redirect 307 den login voi `returnUrl`.

## Backend local smoke

- Register 201, login 200; products, hosting plans, wallet, orders va services tra 200.
- `/auth/me` khong token tra 401; customer goi `/admin/users` tra 403.
- Order/service/wallet transaction khong thuoc customer tra 404.
- Rate limit login: 5 response validation, request thu 6 tra 429.
- Cac response 401/403/404/422/429 deu co `X-Request-ID`.
- Provider conflict 409 duoc bao phu bang automated contract test; local customer moi khong co active provider fixture de kich hoat 409 an toan.

## Known limitations

- Chua co staging URL/credential, active paid service fixture va browser E2E runner; vi vay staging smoke, true browser E2E va viewport screenshot dang blocked.
- Product Owner van can nghiem thu thu cong mobile/desktop truoc release production.
- Bearer token hien duoc persist trong localStorage va cookie client-readable de proxy/client API cung hoat dong. Chuyen sang backend HttpOnly session cookie la backlog bao mat can thay doi auth contract.
- Forgot password, website rental, VPS va blog chua co backend contract nen khong nam trong production navigation.
- Thanh cong mua/gia han can wallet/active provider fixture; cac nhanh nay dang duoc bao phu boi automated test thay vi tao giao dich that.

## Rollback checklist

1. Ghi lai commit/tag va `NEXT_PUBLIC_API_URL` cua ban release dang chay.
2. Giu artifact build truoc do de redeploy ngay; frontend Sprint 08 khong co database migration.
3. Neu auth/network regression, rollback artifact va xoa browser cache/storage cua domain test.
4. Smoke lai `/`, `/login`, `/source-code`, auth guard `/user` va mot API protected sau rollback.
5. Doi chieu `X-Request-ID` voi backend log truoc khi mo lai traffic.

## Release gate con lai

- `[B]` Staging smoke: can staging URL va test credentials/fixtures.
- `[B]` Browser E2E + responsive screenshots: can browser runner hoac Playwright setup.
- `[ ]` Product Owner nghiem thu mobile va desktop.

## Ra soat 2026-09-21

- VPS da co contract va frontend Sprint 08V, nen ghi chu lich su "VPS chua co backend contract" o tren khong con la trang thai hien tai.
- `npm test`: 43 files, 112 tests dat; `npx tsc --noEmit`, `npm run lint` va `npm run build` dat, 19 routes.
- Backend local `GET /services/vps-plans` va `GET /services/vps-os-images` deu tra 200 voi `data=[]`; khong the kiem thu mua/gia han/lifecycle thanh cong tren fixture thuc.
- Computer-use inventory khong co browser; chua chup/kiem thu cac viewport 360/768/1024/1440. Staging URL va Product Owner sign-off van chua co. Client Release Gate chua dong; Sprint 09 chua du dieu kien bat dau theo plan.
