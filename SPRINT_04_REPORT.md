# Sprint 04 - Bao cao thuc thi

Ngay hoan thanh frontend: 2026-09-19

## Ket qua

- Tao public hosting service cho list/detail theo unified envelope va pagination.
- Public `HostingPlan` chi giu `id`, `name`, `disk_quota`, `price_per_month`; khong co server ID/IP/token/package noi bo.
- Thay toan bo bang gia hosting hard-code tren trang chu bang du lieu API, loading, empty va error state.
- Tao `/hosting` voi grid so sanh dung luong, gia thang, pagination va deep link `?plan={id}`.
- Checkout ho tro domain, cac chu ky `1,3,6,12,24,36`, coupon preview, wallet va insufficient balance.
- Tong tien dung `decimal.js` qua `price_per_month * months`; backend van la nguon ket qua checkout cuoi.
- Guest duoc dua den login va quay lai dung plan da chon.
- Provisioning error giu message backend; neu message cho biet da refund thi frontend refresh wallet.
- Response 201 duoc tach theo `data.status`: `success` hien hosting da kich hoat, `pending_manual` hien dang cho ky thuat vien xu ly va chua co thong tin dang nhap.
- Checkout khong doc hoac render password. Credential owner-scoped, doi mat khau va gia han hosting duoc giu cho Customer Center o Sprint 07.
- Header, mobile menu, services section va footer da tro den `/hosting`.
- Thiet ke lai hosting card theo UI ban dau: ten goi, gia noi bat, danh sach quyen loi va CTA vien xanh.
- Dong bo container `1350px`, khoang cach `18px` va grid toi da 5 cot voi khu danh sach ma nguon; trang chu tai toi da 5 goi.
- Them bo loc danh muc server public tai `/hosting`, dong bo `server_category` va `page` vao URL, giu deep link checkout `plan` va tu xoa category slug khong hop le.
- Category storefront chi dung `id`, `slug`, `name`; khong goi API server quan tri va khong nhan IP/token/type/package noi bo.

## Kiem thu

- `npm test`: 24 files, 66 tests dat.
- Test public plan envelope, buy-hosting payload, decimal multiplication va domain normalization/validation.
- Test tat ca chu ky `1,3,6,12,24,36`, domain invalid, guest return URL, automatic success, pending manual, khong render password va provisioning refund.
- `npx tsc --noEmit`: dat.
- `npm run lint`: 0 errors, 9 warnings anh cu ngoai scope Sprint 04.
- `npm run build`: dat; route `/hosting` duoc prerender thanh cong.
- Frontend `/hosting` va `/` tra HTTP 200; home khong con cac gia hard-code cu.

## Runtime backend

- `GET /api/v1/services/hosting-plans?per_page=100` tra unified envelope/pagination voi public plan `id=1` dang hoat dong.
- `GET /api/v1/services/hosting-plans/1` tra dung cac field an toan: `id`, `name`, `disk_quota`, `price_per_month`.
- `GET /api/v1/services/server-categories` tra category public `Server 01` (`server-01`) va khong co field ha tang noi bo.
- `GET /api/v1/services/hosting-plans?server_category=1&per_page=100` loc thanh cong va tra plan thuoc category.
- Buy-hosting khong token tra HTTP 401 `UNAUTHENTICATED`.
- Domain sai va cycle sai tra HTTP 422 `VALIDATION_ERROR`.
- Buy-hosting voi plan 1, domain hop le va chu ky 12 thang da qua buoc plan/provisioning precheck, tra HTTP 400 `BUSINESS_RULE_VIOLATION` do vi test khong du so du; khong co transaction/order nao duoc tao.

## Gioi han xac minh

- Chua the chay success provisioning/refund E2E that cho den khi co wallet du so du hoac coupon test phu hop.
- Nhanh automatic success, pending manual, refund va insufficient balance da duoc bao phu bang automated tests va bam theo backend action/contract hien tai.
