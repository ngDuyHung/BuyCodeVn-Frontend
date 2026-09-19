# Sprint 01 - Bao cao thuc thi

Ngay thuc hien: 2026-09-18

## Ket qua

- Hoan thanh dang ky, dang nhap, dang xuat va doi mat khau o phia frontend.
- Form hien loi validation client va loi 422 theo dung field.
- Login hien dung message backend cho credential sai, account inactive va network error.
- Redirect sau login chi chap nhan local `returnUrl`, mac dinh `/user`, ngan open redirect.
- Doi mat khau thanh cong khong xoa token hien tai o frontend.
- Link quen mat khau gia da duoc thay bang trang thai “chua ho tro”.
- Input password co nut hien/an va cac thuoc tinh autocomplete/accessibility.

## Thay doi ky thuat

- `useAuthLogic` cung cap `formError`, `fieldErrors`, `resetErrors` va ket qua boolean cho moi action.
- Auth request tu hien thi loi theo context, khong bi global interceptor toast trung lap.
- Them `FormField` va `FormAlert` dung chung cho cac form auth.
- Them `/user/change-password` va ket noi menu user san co.
- Them Vitest 4, Testing Library, jsdom va script `npm test`.
- Test runner va toan bo dependency tree co `npm audit` = 0 vulnerability.

## Kiem thu

- `npm test`: 4 files, 12 tests dat.
- `npm run lint`: 0 errors, 12 warnings anh ton dong tu Sprint 00.
- `npx tsc --noEmit`: dat.
- `npm run build`: dat, sinh 11 static pages va Proxy.
- Route smoke test: `/login` 200, `/register` 200.
- `/user/change-password` khi chua login redirect 307 va giu `returnUrl`.

## Gioi han xac minh

- Backend `http://127.0.0.1:8000` da phan hoi lai khi dong Sprint 02; integration chain register/login/me/change-password/logout van de mo de chay bang tai khoan test rieng.

## Re-audit contract - 2026-09-19

- Login da parse `data.user`, `data.token`, `token_type`, `expires_in`; session luu thoi diem het han va cookie cung TTL backend.
- Register va `/me` da parse unified envelope; change-password/logout giu success envelope.
- Error mapper da doc `error.code`, `error.message`, `error.details`, `request_id`, `Retry-After`; request frontend gui `X-Request-ID`.
- `/login` va `/register` da dung lai public `TopBar`, `Header`, `Footer`; smoke test `/login` HTTP 200 co du header/form/footer.
- Unit test moi bao phu auth envelope, session expiry, unified error va auth layout.
- Toan bo suite sau re-audit: 15 files, 34 tests dat; typecheck/build dat; lint 0 errors, 9 warnings ton dong ngoai catalog.
