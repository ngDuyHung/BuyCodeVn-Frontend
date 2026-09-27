# Sprint 05 - Bao cao thuc thi

Ngay hoan thanh frontend: 2026-09-19

## Ket qua

- Tao `/domains` trong client layout, co breadcrumb, public domain check va URL context `?domain=`.
- Normalize input truoc khi goi API; ho tro domain thuong va TLD nhieu cap theo ket qua backend.
- Hien availability, message, register price va renew price bang decimal string.
- Checkout yeu cau login va quay lai dung domain da check.
- Form dang ky ho tro 1-10 nam, name, email, phone, CCCD optional va inline validation khop contract.
- Coupon preview dung `register_price * years` qua `decimal.js`; wallet va insufficient balance duoc xu ly truoc submit.
- Tach ket qua `success` va `pending_manual`; pending xac nhan da ghi nhan thanh toan va dang cho Admin, khong hien nhu giao dich that bai.
- Contact draft chi luu khi user chu dong chon va chi gom name/email/phone. CCCD khong duoc ghi vao localStorage.
- Header desktop/mobile va footer da tro den `/domains`.

## Kiem thu

- `npm test`: 27 files, 76 tests dat.
- Bao phu normalize, TLD `.edu.vn`, unsupported TLD, domain unavailable, contact validation, coupon, yearly decimal total, guest return URL, automatic/manual result va draft privacy.
- `npx tsc --noEmit`: dat.
- `npm run lint`: 0 errors, 9 warnings anh cu ngoai scope Sprint 05.

## Runtime backend

- `POST /api/v1/orders/check-domain` la public va tra unified business error dung contract.
- `.com` hien tra HTTP 400 vi TenTen account/API key chua duoc cau hinh.
- `.edu.vn` va TLD la tra HTTP 400 voi message chua ho tro do chua co active pricing phu hop.
- `POST /api/v1/orders/buy-domain` khong token tra HTTP 401 `UNAUTHENTICATED`.

## Gioi han xac minh

- Chua the chay purchase success/pending E2E that cho den khi backend co TenTen credential hoac TLD manual active, wallet/coupon test phu hop.
- Automatic success, pending manual, unavailable, coupon va insufficient balance duoc bao phu bang automated tests theo contract hien tai.
