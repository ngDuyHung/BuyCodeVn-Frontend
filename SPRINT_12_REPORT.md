# Sprint 12 - Admin Orders, Coupon va Service Operations

Ngay hoan thanh: 2026-09-27

## Da trien khai

- Them ba route Admin `/admin/coupons`, `/admin/orders`, `/admin/services` va link sidebar theo permission tuong ung.
- Coupon co list, search, status, pagination, create/edit/delete; form chi cho dung mot discount type, validate tai client va chuan hoa code uppercase khong khoang trang.
- Coupon hien usage limit, expiry va cac trang thai dang dung, da tat, het han, het luot.
- Order co filter theo khach hang, user ID, status, item type, date va amount; detail hien items, service, coupon va config an toan.
- User service co filter/search/list/detail; domain pending co confirm approve rieng cho registration va renewal.
- Hosting manual pending co form kich hoat bang username/password; action chi hien khi API resource cap quyen.
- UI dung status contract `processing`, `completed`, `failed`; khong them endpoint cap nhat status tong quat.

## Backend bo sung

- Coupon code duoc normalize trong request truoc unique validation.
- Update coupon dung `array_key_exists` de co the xoa discount cu khi chuyen giua percent va fixed amount.
- Them feature test cho normalize/duplicate, chuyen discount type va tu choi hai discount type cung luc.

## Kiem thu

- Frontend: 60 test files, 155 tests pass.
- Backend: 70 tests, 522 assertions pass.
- TypeScript `npx tsc --noEmit`: pass.
- ESLint `npm run lint`: pass.
- Production build `npm run build`: pass.
- Pint tren cac file backend thay doi: pass.
- HTTP smoke tren local: `/admin/coupons`, `/admin/orders`, `/admin/services` deu tra 200.

## Ghi chu release

- Duplicate/stale domain approve duoc bao ve boi busy state tren UI va idempotency/state guard tai backend.
- Browser responsive QA tiep tuc nam trong release gate tong the o Sprint 15 theo thoa thuan nguoi dung tu kiem thu giao dien.
