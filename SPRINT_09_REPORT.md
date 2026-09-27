# Sprint 09 - Admin foundation va authorization

Ngay ra soat: 2026-09-21

## Da trien khai

- `/admin` co shell rieng, sidebar/topbar responsive, menu mobile ho tro focus trap/Escape, khong render link den route chua ton tai.
- Guard Admin dua tren session `/auth/me`: role `admin` la super-admin dung `Gate::before` cua backend (permissions array co the rong); operator dung permission cu the. Customer gap trang 403, het session ve login voi `returnUrl`.
- `can(permission)` va permission union theo namespace backend; menu, trang users va permissions deu duoc gate theo quyen.
- Dashboard hien tong user/order/service/product tu API admin neu co quyen; khong dung mock. `/admin/users` ho tro search, role, status, phan trang tren URL. `/admin/permissions` doc danh sach quyen that.
- Data table, filter bar, form field, confirm dialog va admin service/query-state convention. Pagination tai su dung shared component.

## Xac minh

- Automated tests: 48 files, 122 tests pass; TypeScript, lint va production build pass; 3 Admin routes duoc build.
- Local unauthenticated `GET /admin/users?page=2` redirect 307 den `/login?returnUrl=%2Fadmin%2Fusers%3Fpage%3D2`.
- Backend local: customer nhan 403 tren `/admin/users`, `/admin/permissions`, `/admin/services`, `/admin/orders`; Admin nhan 200 tren bon endpoint nay.
- Operator test `cskh` co `orders.view`, `services.view`, `tickets.view`, `tickets.reply`: users/permissions 403; services/orders 200. Cac tai khoan QA da duoc soft-delete qua Admin API sau khi test.

## Con lai

- Chua co browser trong moi truong computer-use de QA viewport/mobile bang screenshot; staging URL va Product Owner sign-off van can.
- Client Release Gate Sprint 08/08V van mo: VPS local/sandbox API success E2E da dat sau khi Sprint 09 bat dau, nhung browser QA, staging va doi soat provider expiry/rebuild credential van can. Sprint 09 khong thay the release gate truoc production.
- Bearer token client-readable cookie/localStorage la auth contract/backlog bao mat da ghi o Sprint 08, chua thay doi trong Sprint 09.
