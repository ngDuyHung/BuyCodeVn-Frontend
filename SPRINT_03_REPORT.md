# Sprint 03 - Bao cao thuc thi

Ngay hoan thanh luong chinh: 2026-09-19

## Ket qua

- Them order service type-safe cho preview coupon, buy product va binary download.
- CTA product detail nhan biet session; guest sang login voi `returnUrl` va quay lai dung product.
- Them modal xac nhan mua voi gia goc, giam gia, thanh tien va coupon optional.
- Coupon duoc normalize uppercase, co loading, success va business error rieng.
- Coupon da nhap phai preview thanh cong truoc khi co the thanh toan.
- Khoa double-submit trong luc request mua dang chay.
- Xu ly product inactive, insufficient balance, already purchased va cac loi HTTP 400/422.
- Mua thanh cong chuyen CTA sang tai file ngay trong session hien tai.
- Download dung Next same-origin streaming route, `fetch` va `Blob`; doc filename tu `Content-Disposition` va response thanh cong khong qua JSON parser.
- Download xu ly 400/401/403/404; 401 xoa session va quay lai luong login.
- Thay placeholder `/user/orders` bang du lieu that, filter status/item type/date, pagination, owner-scoped detail va tai lai product.
- Product detail tai wallet va toan bo completed product orders de khoi phuc trang thai da mua sau reload; refresh wallet sau thanh toan.
- Them `MoneyString` va `decimal.js`; product price, wallet, order va coupon preview khong tinh toan qua binary float.
- Preview coupon number legacy tu backend duoc normalize thanh decimal string ngay tai service boundary.

## Integration backend

- Dung tai khoan integration rieng `sprint03.integration@buycode.test` tren backend local.
- Tao coupon test `SPRINT03FREE100`, preview gia `150000` thanh `0`.
- Buy product `id=1` thanh cong, tao `order_id=1`.
- Goi buy lan hai tra HTTP 400 va message da so huu, dung business rule.
- Tao fixture dev `storage/app/private/storage/files/source.zip` theo `file_url` hien tai cua product.
- Download product da mua tra HTTP 200, `Content-Type: application/zip`, filename `source.zip`, 165 bytes.
- Download truoc khi mua da duoc xac minh tra HTTP 403.
- Next download proxy co cookie tra HTTP 200 va giu dung binary headers; khong co cookie tra JSON HTTP 401.

## Kiem thu

- `npm test`: 18 files, 41 tests dat.
- Test login return URL, coupon preview, double-submit, purchased CTA va download transition.
- Test service payload, Blob response, filename RFC 5987, 403 JSON error va session expiry 401.
- Test money normalization, wallet envelope, order list/detail/filter va ownership qua nhieu trang.
- `npx tsc --noEmit`: dat.
- `npm run lint`: 0 errors, 9 warnings anh cu ngoai pham vi Sprint 03.
- `npm run build`: dat; `/api/download/products/[id]`, catalog list va detail deu server-render on demand.

## Re-audit runtime - 2026-09-19

- Wallet endpoint tra `balance: "0.00"`, `currency: "VND"` va unified envelope dung contract.
- Orders list tra pagination `data`, `links`, `meta`; backend source xac nhan list/detail load item snapshot an toan va khong tra `file_url`/config nhay cam.
- Customer goi Coupon CRUD tra HTTP 403, code `FORBIDDEN`.
- Customer doc order cua user khac tra HTTP 404, code `NOT_FOUND`.
- Download product chua so huu tra HTTP 403; mua khi vi thieu tien tra HTTP 400, code `BUSINESS_RULE_VIOLATION`.
- Preview coupon bi gioi han dung tai request thu 31: 30 response business 400, sau do HTTP 429.
- Request khong token voi `Accept: application/json` tra HTTP 401 unified envelope.
- Coupon `SPRINT03FREE100` da het luot su dung, nen lan re-audit nay khong tao them order; integration buy/repeat-buy/download thanh cong cua lan chay truoc van duoc giu lam baseline.

## Dependency va backend finding

- BE-01, BE-02 va BE-07 da duoc frontend tich hop va runtime verify.
- Preview coupon backend hien serialize amount thanh JSON number du quy uoc chung yeu cau decimal string; frontend da normalize an toan tai service boundary.
- Backend local van bat `APP_DEBUG=true`; can tat debug truoc production.

## Du lieu test da tao

- User integration, coupon `SPRINT03FREE100`, order `id=1` va ZIP fixture van duoc giu trong backend local.
- Re-audit tao them customer `sprint03.reaudit.1789811542@buycode.test` voi wallet 0 va khong co order.
- Khong xoa tu dong de tranh thao tac pha huy du lieu ngoai frontend workspace.
