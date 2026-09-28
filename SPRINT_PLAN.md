# BuyCodeVN Frontend - Ke hoach trien khai theo Sprint

> Contract baseline: `FRONTEND_API_DOCUMENTATION.md` cap nhat 2026-09-19. Sprint 02-04 da hoan thanh/re-audit; con dong integration auth Sprint 01 va cac muc Contract Refresh Gate toan cuc truoc khi mo rong Sprint 05.

## 1. Muc dich va nguyen tac su dung

Tai lieu nay la ke hoach trien khai frontend BuyCodeVN dua tren:

- Ma nguon frontend dang co tai thoi diem lap ke hoach.
- Hop dong API trong `FRONTEND_API_DOCUMENTATION.md`.
- Dinh huong kien truc trong `src/FRONTEND_CONTEXT.md`.

Thu tu uu tien bat buoc:

1. Hoan thanh va nghiem thu phan he Client.
2. Chot Client Release Gate.
3. Moi bat dau phan he Admin.

Tai lieu API va context la nguon tham chieu ky thuat, khong phai yeu cau thay the cho ke hoach nay. Khi ma nguon thuc te, tai lieu context va API khac nhau, uu tien xu ly theo thu tu: hop dong API backend da xac minh, ma nguon dang chay, sau do moi den kien truc muc tieu trong context.

## 2. Gia dinh lap ke hoach

- Moi sprint du kien 1 tuan, co the dieu chinh theo nhan su va toc do phan hoi cua backend.
- Mot sprint chi duoc xem la hoan thanh khi dat Definition of Done va tat ca tieu chi nghiem thu cua sprint.
- Khong dung mock data de danh dau mot tinh nang la hoan thanh.
- Cac man hinh phu thuoc API chua co phai hien thi trang thai ro rang hoac an khoi navigation cho den khi contract san sang.
- Khong coi route guard phia frontend la co che bao mat. Backend phai enforce role/permission cho cac endpoint quan tri.
- Muc tieu ban dau la web responsive tren mobile, tablet va desktop.

## 3. Hien trang du an

### Baseline khi lap ke hoach

Danh sach duoi day la hien trang truoc Sprint 00, duoc giu lai de doi chieu pham vi ban dau.

### Da co

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- Axios instance va interceptor co gan Bearer token.
- Zustand persist cho auth; token duoc dong bo sang cookie `auth_token`.
- UI dang ky, dang nhap, dang xuat.
- UI trang chu va cac khoi noi dung marketing dang tinh.
- Trang danh sach source code co tim kiem, category, type va pagination.
- Trang tai khoan co sidebar, dashboard tinh va lich su don hang mock.
- Luong tao lenh nap tien va hien thi QR.

### Chua co hoac chua hoan chinh

- Chua co `middleware.ts` du repo context mo ta co route guard.
- Root layout dang nhung Client Header/Footer vao moi route; chua tach `(client)`, `(auth)` va `admin` layout dung nghia.
- Chua co phan he Admin.
- API URL dang hard-code `http://localhost:8000/api`.
- Phan lon du lieu dung `any`; chua co model/API response type dung chung.
- Chua co xu ly field validation 422 tai tung form.
- Chua co product detail, checkout, download, hosting/domain purchase, withdrawal va change password.
- Dashboard, order history va thong ke dang la mock vi backend chua co read API tuong ung.
- Nhieu navigation dang tro den `#`.
- `file_url` cua product dang bi dung nhu URL anh, trong khi contract mo ta day la duong dan file tai ve.
- Chua co test tu dong.

### Cap nhat sau Sprint 04 - 2026-09-19

- Sprint 00-04 da co implementation, automated tests va production build; Sprint 02-04 da re-audit theo contract moi.
- Backend contract moi da bo sung wallet, order, my-services, admin APIs, permission enforcement, product image/demo va domain renewal.
- Contract Refresh Gate con `CR-05` integration auth/session expiry; cac muc envelope, error, money, product, security va fixture da dat.
- Sprint 05-08 va toan bo Admin chua bat dau; BE-10 va BE-12 van deferred.

## 4. Backend Contract Status

Cap nhat theo `FRONTEND_API_DOCUMENTATION.md` ngay 2026-09-19:

| ID | Trang thai | Contract da xac nhan / phan con lai | Anh huong |
| --- | --- | --- | --- |
| BE-01 | Resolved | `GET /api/v1/finance/wallet` | Dashboard, checkout va canh bao so du |
| BE-02 | Resolved | `GET /api/v1/orders`, `GET /api/v1/orders/{order}` | Order history va product da mua |
| BE-03 | Resolved | `GET /api/v1/services/my-services`, detail owner-scoped | Quan ly hosting/domain |
| BE-04 | Resolved | Wallet transaction list/detail co filter va reference | Dashboard va lich su tai chinh |
| BE-05 | Resolved | Admin order list/detail va admin service list/detail | Doi soat va service operations |
| BE-06 | Resolved | Admin user, role va permission APIs | IAM Admin |
| BE-07 | Resolved, can smoke test | Permission da enforce tren CRUD/action; frontend van xu ly 403 | Bao mat Admin |
| BE-08 | Resolved | Product co `thumbnail_url`, `demo_url`; `file_url` la write-only | Catalog/product detail |
| BE-09 | Resolved | Public hosting plan list/detail chi tra field an toan | Hosting storefront |
| BE-10 | Sandbox configured, public catalog active | VPS public catalog, buy-vps UUID, owner lifecycle/renew va Admin XVPS APIs da co contract ngay 2026-09-21 | Da dat gia test va local API success E2E; con browser/staging QA va doi soat provider expiry/rebuild credential |
| BE-11 | Resolved | `POST /api/v1/orders/domain/{service}/renew` co idempotency/manual flow | Domain renewal |
| BE-12 | Open/deferred | Settings va support ticket van chua co route/controller | Tach khoi MVP hoac doi contract |
| BE-13 | Resolved, migrated | JSON envelope thong nhat `success/data/message/error/meta/links` | Tat ca parser/service |
| BE-14 | Partial | Token 7 ngay va CORS allowlist da ro; production URL/cookie deployment van can chot | Release/deploy |
| BE-15 | Resolved | `GET /services/server-categories` va query `server_category` public, khong lo ha tang noi bo | Bo loc danh muc tai hosting storefront |
| BE-16 | Resolved | Hosting ho tro `automatic`/`manual`; buy response tach `success` va `pending_manual`, credential owner-scoped | Checkout hosting va customer center |

Quyet dinh scope: BE-12 khong duoc gia lap du lieu. BE-10 duoc trien khai theo contract VPS moi; cac contract da resolved van phai duoc frontend smoke test voi role/customer ownership that truoc khi dong dependency gate.

### Contract Refresh Gate

Tai lieu backend moi khong backward-compatible voi mot so gia dinh da dung trong Sprint 01-03. Thuc hien audit theo thu tu Sprint 01 -> Sprint 02 -> Sprint 03:

- [x] `CR-01`: Doi response type/parser sang envelope `success`, `data`, `message`, `error`, `meta`, `links` cho ca resource va pagination.
- [x] `CR-02`: Doi error mapper sang `error.code`, `error.message`, `error.details`, `request_id`; map validation 422 va hien retry cho 429.
- [x] `CR-03`: Them/giai truyen `X-Request-ID` de doi chieu log; khong hien request ID nhu business message.
- [x] `CR-04`: Tao `MoneyString` va dung `decimal.js` khi tinh tong/giam gia; khong dung binary float cho checkout/finance.
- [x] `CR-05`: Dong bo auth login moi `data.user`, `data.token`, `token_type`, `expires_in`; verify refresh/session expiry 7 ngay.
- [x] `CR-06`: Dong bo Product Resource: dung `thumbnail_url`, `demo_url`; loai `file_url` khoi public read type.
- [x] `CR-07`: Smoke test ownership 404, permission 403, rate limit 429 va binary download voi backend local moi.
- [x] `CR-08`: Cap nhat unit/integration fixtures sang contract moi, sau do chay lint, typecheck, test va build.

## 5. Kien truc muc tieu

```text
src/
|-- app/
|   |-- (client)/
|   |-- (auth)/
|   |-- admin/
|   |-- layout.tsx
|   `-- globals.css
|-- components/
|   |-- client/
|   |-- admin/
|   `-- shared/
|-- hooks/
|   |-- client/
|   `-- admin/
|-- services/
|   |-- client/
|   |-- admin/
|   |-- api.ts
|   `-- auth.service.ts
|-- stores/
|   |-- client/
|   |-- admin/
|   `-- authStore.ts
|-- types/
|   |-- api.ts
|   |-- identity.ts
|   |-- catalog.ts
|   |-- orders.ts
|   `-- finance.ts
|-- lib/
|   |-- format.ts
|   |-- validation.ts
|   `-- auth.ts
`-- middleware.ts
```

Quy tac:

- `page.tsx` chi dieu phoi route va render feature component.
- Service chiu trach nhiem HTTP va response mapping.
- Hook chiu loading, error, form action va refresh state.
- Component khong goi Axios truc tiep.
- Type dung chung khong khai bao lap lai trong component.
- Tien te luon format qua mot helper duy nhat.
- Binary download duoc xu ly tach voi JSON API.
- Moi list remote deu co loading, empty, error, filter va pagination state.

## 6. Definition of Ready

Mot task duoc dua vao sprint khi:

- Route, luong nguoi dung va acceptance criteria da ro.
- API endpoint, auth, request, response va error status da xac nhan.
- Asset/UI reference can thiet da co.
- Dependency backend duoc danh dau ro va co nguoi phu trach.
- Khong con quyet dinh nghiep vu lon chua duoc chot.

## 7. Definition of Done

Ap dung cho moi sprint:

- Hoan thanh UI responsive va cac trang thai loading, empty, error, success, disabled.
- Khong con mock data trong luong duoc nghiem thu.
- Khong dung `any` cho public service contract moi.
- Validation client phu hop backend; loi 422 duoc gan dung field khi co the.
- Response/error parser khop envelope hien hanh; 401/403/404/409/422/429 co state phu hop.
- Money decimal string khong bi tinh toan qua binary float o cac luong checkout/finance.
- Request ID duoc giu de doi chieu log khi can, khong ro ri secret/PII.
- Khong lam mat thay doi dang co cua nguoi dung trong repository.
- `npm run lint` dat.
- `npm run build` dat.
- Cac test trong pham vi sprint dat.
- Kiem tra thu cong desktop va mobile cho happy path va it nhat mot error path.
- Navigation, auth guard va quyen truy cap dung voi scope.
- Cap nhat checklist va ghi chu API gap trong tai lieu nay.

---

# PHASE A - CLIENT

## Sprint 00 - Audit, contract va nen tang ky thuat

**Trang thai:** Foundation da hoan thanh theo contract cu; response/error/type layer duoc mo lai tai Contract Refresh Gate ngay 2026-09-19.

### Muc tieu

Tao nen tang on dinh de cac sprint Client sau khong phai sua lai auth, response parsing va layout.

### Cong viec

- [x] `S00-01`: Chay baseline lint/build, ghi lai loi san co va phan loai blocker/non-blocker.
- [x] `S00-02`: Chuyen API URL sang `NEXT_PUBLIC_API_URL`, them `.env.example` va validate config.
- [x] `S00-03`: Dinh nghia `ApiResource<T>`, `PaginatedResponse<T>`, `BusinessResponse<T>`, `ValidationErrors`.
- [x] `S00-04`: Tao type cho User, Category, Product, HostingPlan, TldPricing, Coupon va Finance resource.
- [x] `S00-05`: Chuan hoa Axios error thanh mot model duy nhat; tranh toast trung lap khi form tu hien loi.
- [x] `S00-06`: Tach root/client/auth layout, giu root layout chi chua provider va toast.
- [x] `S00-07`: Tao route guard cho `/user`; thiet ke admin guard nhung chua mo Admin.
- [x] `S00-08`: Khoi phuc session bang `/auth/me`, xu ly persisted state het han va hydration.
- [x] `S00-09`: Tao helper format VND/date/status va component dung chung cho loading/error/empty/pagination.
- [x] `S00-10`: Da cap nhat trang thai BE-01 den BE-14; token expiry va CORS da co contract, production URL/cookie deployment carry-over sang S08/S15.

### API

- `GET /api/v1/auth/me`
- Tat ca endpoint de kiem tra envelope/error format, khong thay doi nghiep vu.

### Nghiem thu

- Refresh trang da dang nhap khong nhay sai auth state.
- Token het han dua user ve `/login`, xoa ca Zustand va cookie.
- Khach truy cap `/user/*` duoc redirect va co `returnUrl`.
- API base URL khong con hard-code.
- Client, auth va root shell khong anh huong layout cua nhau.

### Dependency

- Backend/CORS chay duoc o moi truong local.
- BE-13 migration da hoan thanh; Contract Refresh Gate chi con `CR-05` integration auth/session expiry.
- BE-14 con production URL/cookie deployment gate tai S08/S15.

## Sprint 01 - Identity va tai khoan co ban

**Trang thai:** Re-audit code contract hoan thanh ngay 2026-09-19; integration chain con cho tai khoan test rieng.

### Muc tieu

Hoan chinh vong doi dang ky, dang nhap, dang xuat va doi mat khau.

### Cong viec

- [x] `S01-01`: Type-safe payload/response cho auth service, bo `any`.
- [x] `S01-02`: Form dang ky hien loi theo field va kiem tra password confirmation.
- [x] `S01-03`: Form dang nhap xu ly account inactive, credential sai va network error.
- [x] `S01-04`: Redirect ve `returnUrl` sau dang nhap; neu khong co thi ve `/user`.
- [x] `S01-05`: Them `/user/change-password`, validation min 8, different current va confirmation.
- [x] `S01-06`: Sau doi mat khau giu session hien tai dung theo contract.
- [x] `S01-07`: Dong bo Header/UserSidebar sau login/logout; dong menu/dropdown dung cach.
- [x] `S01-08`: Loai bo link quen mat khau gia hoac hien ro “chua ho tro” neu backend chua co API.
- [x] `S01-09`: Test auth store, auth service mapping va cac form critical path.
- [x] `S01-R01`: Doi parser login sang `data.user`, `data.token`, `token_type`, `expires_in`; register/me theo envelope moi.
- [x] `S01-R02`: Map loi auth/422 theo `error.message`, `error.details`, `request_id`; xu ly 429 login/register.
- [ ] `S01-R03`: Integration test register -> login -> me -> change-password -> logout voi backend local va xac minh token hien tai duoc giu sau doi mat khau.

### API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/logout`

### Nghiem thu

- Toan bo loi validation hien tai field phu hop.
- Login/logout van dung sau reload va tren mobile.
- Doi mat khau thanh cong; token hien tai van su dung duoc.
- Khong con route/link auth dan den `#`.

## Sprint 02 - Catalog storefront va product detail

**Trang thai:** Hoan thanh va da re-audit theo contract moi ngay 2026-09-19.

### Muc tieu

Bien kho ma nguon thanh storefront co the tim, loc, chia se URL va xem chi tiet.

### Cong viec

- [x] `S02-01`: Type-safe category/product service, them `getProduct(idOrSlug)`.
- [x] `S02-02`: Dong bo `search`, `category_id`, `type`, `page` vao URL search params.
- [x] `S02-03`: Debounce search; huy request cu khi filter thay doi nhanh.
- [x] `S02-04`: Render category tree, khong chi category cap dau.
- [x] `S02-05`: Pagination gon cho tap trang lon, khong render tat ca so trang.
- [x] `S02-06`: Tao `/source-code/[slug]` voi title, mo ta, category, type, gia va CTA.
- [x] `S02-07`: Sua cach hien thi anh product theo BE-08; khong dung `file_url` lam image.
- [x] `S02-08`: Them metadata/SEO co ban va not-found state.
- [x] `S02-09`: Ket noi Featured Products tren home voi API active products.
- [x] `S02-10`: Cap nhat header/mobile navigation den route that.
- [x] `S02-11`: Smoke test runtime categories, products, search/category/type filter, detail theo slug va 404 voi backend local.
- [x] `S02-R01`: Doi Product type `price` sang decimal string, them `thumbnail_url`, `demo_url`, bo `file_url` khoi public read model.
- [x] `S02-R02`: Render thumbnail that co fallback va CTA demo an toan cho URL HTTP/HTTPS.
- [x] `S02-R03`: Doi catalog resource/pagination parser sang envelope moi; smoke test xac nhan public chi tra active product/category.

### API

- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{product}`

### Nghiem thu

- URL co the copy va khoi phuc dung filter/page.
- Product detail mo duoc bang slug va xu ly 404.
- Khong co anh bi vo do `file_url` la file zip.
- Loading, no result va API error co UI rieng.

### Dependency

- BE-08 da resolved; frontend da dung `thumbnail_url`/`demo_url` va da verify runtime voi backend local.

## Sprint 03 - Mua product, coupon va download

**Trang thai:** Hoan thanh va da re-audit theo contract moi ngay 2026-09-19.

### Muc tieu

Hoan thanh luong doanh thu dau tien: user xem product, ap ma, thanh toan bang vi va tai file da mua.

### Cong viec

- [x] `S03-01`: Tao order service cho preview coupon va buy product.
- [x] `S03-02`: CTA login-aware; khach duoc chuyen den login va quay lai product.
- [x] `S03-03`: Modal/xac nhan mua hien gia goc, giam gia va thanh tien.
- [x] `S03-04`: Preview coupon co loading, invalid/expired/exhausted state.
- [x] `S03-05`: Chan double submit va xu ly idempotency UX khi request cham.
- [x] `S03-06`: Xu ly du tien, da mua, product inactive va loi nghiep vu HTTP 400.
- [x] `S03-07`: Sau mua thanh cong chuyen CTA thanh tai xuong.
- [x] `S03-08`: Download binary stream, doc filename/content-type va xu ly 403/404/400.
- [x] `S03-09`: Dung `GET /api/v1/orders?item_type=product&status=completed` cho product da mua va `/user/orders`; them order detail owner-scoped.
- [x] `S03-10`: Integration test coupon -> buy -> repeat-buy guard -> download voi backend local va test data.
- [x] `S03-R01`: Doi order/coupon parser va error state sang envelope moi; tien coupon/final amount dung `MoneyString` va `decimal.js`.
- [x] `S03-R02`: Lay `GET /api/v1/finance/wallet` de hien so du truoc mua va refresh sau thanh toan.
- [x] `S03-R03`: Smoke test customer token bi 403 khi goi Coupon CRUD, ownership 404 va rate limit preview coupon 429.

### API

- `POST /api/v1/orders/preview-coupon`
- `POST /api/v1/orders/buy-product`
- `GET /api/v1/orders?item_type=product&status=completed`
- `GET /api/v1/orders/{order}`
- `GET /api/v1/finance/wallet`
- `GET /api/v1/catalog/products/{id}/download`

### Nghiem thu

- Gia hien thi truoc va sau coupon khop response backend.
- Mot click mua chi tao mot giao dich tu goc nhin UI.
- User da mua tai duoc file; user chua mua nhan thong bao dung.
- Reload hoac dang nhap lai van nhan biet product da mua tu order API.
- File download khong di qua JSON parser.

### Dependency

- BE-01, BE-02 va BE-07 da resolved, da re-integrate va runtime verify ngay 2026-09-19.

## Sprint 04 - Hosting storefront va checkout

**Trang thai:** Hoan thanh frontend theo contract provisioning automatic/manual ngay 2026-09-19; public plan, category filter va checkout precheck da runtime verify, success provisioning E2E con cho wallet/coupon test.

### Muc tieu

Cho user xem goi hosting thuc va mua hosting theo domain/thoi han.

### Cong viec

- [x] `S04-01`: Tao hosting plan service va type, chi hien plan/server active.
- [x] `S04-02`: Thay HostingPlans tinh tren home bang du lieu API.
- [x] `S04-03`: Tao `/hosting`, so sanh dung luong, gia/thang va chu ky.
- [x] `S04-04`: Checkout gom plan, domain, months va coupon.
- [x] `S04-05`: Hien tong tien tam tinh theo `price_per_month * months`; backend la nguon gia cuoi cung.
- [x] `S04-06`: Xu ly thanh cong 201, server provisioning failed/refund va insufficient balance.
- [x] `S04-07`: Khong doc credential tu response mua hosting; credential chi duoc tai owner-scoped khi user chu dong mo o Sprint 07.
- [x] `S04-08`: Test cac chu ky `1,3,6,12,24,36` va domain invalid.
- [x] `S04-09`: Tao type va service public cho danh muc server; chi nhan `id`, `slug`, `name`, khong nhan IP/token/package noi bo.
- [x] `S04-10`: Them bo loc danh muc server tai `/hosting`, co lua chon tat ca, empty state va reset filter.
- [x] `S04-11`: Dong bo danh muc da chon vao URL search params, reset ve trang 1 khi doi filter va giu deep link `?plan={id}`.
- [x] `S04-12`: Test query filter, URL state, pagination, danh muc khong hop le va ket qua rong.
- [x] `S04-13`: Tach ket qua checkout `success` (da active) va `pending_manual` (dang cho ky thuat vien kich hoat), khong bao thanh cong sai.
- [x] `S04-14`: Test ca provisioning automatic/manual va dam bao checkout khong render password.

### API

- `GET /api/v1/services/hosting-plans`
- `GET /api/v1/services/hosting-plans/{id}`
- `GET /api/v1/services/server-categories`
- `GET /api/v1/services/hosting-plans?server_category={slug|id}`
- `POST /api/v1/orders/preview-coupon`
- `POST /api/v1/orders/buy-hosting`

### Nghiem thu

- Khong con bang gia hosting hard-code.
- User chua login duoc xu ly theo quyet dinh BE-09.
- Thanh cong/that bai/refund co message ro, khong tu suy dien provisioning status.
- `success` hien da kich hoat; `pending_manual` hien dang xu ly thu cong va chua co thong tin dang nhap.
- User loc duoc plan theo danh muc server; filter co the chia se qua URL va ket hop dung voi pagination/deep link checkout.
- Frontend khong suy dien danh muc tu ten plan va khong goi API server quan tri de lap bo loc public.

### Dependency

- BE-09 va BE-01 da resolved; unified envelope va decimal-safe money layer da duoc ap dung cho Sprint 04.
- Public HostingPlan Resource khong co server ID/IP/token/package noi bo; UI chi dung `id`, `name`, `disk_quota`, `price_per_month`.
- Backend local da co public plan `id=1`; list/detail va checkout den nhanh insufficient balance da runtime verify. Success provisioning E2E con cho wallet/coupon test phu hop.
- BE-15 da resolved va runtime verify: category public chi co `id`, `slug`, `name`; filter chap nhan ID hoac slug va khong dung API server quan tri.
- BE-16 da resolved: checkout bam theo `data.status`; credential detail, change-password va renew thuoc pham vi Sprint 07.

## Sprint 05 - Domain search va checkout

**Trang thai:** Hoan thanh frontend ngay 2026-09-19; public check, auth gate va error contract da runtime verify. Success purchase E2E con cho TenTen credential hoac TLD manual test data.

### Muc tieu

Hoan thanh luong check domain, nhap contact va mua domain auto/manual.

### Cong viec

- [x] `S05-01`: Tao `/domains` voi form check domain public.
- [x] `S05-02`: Normalize domain input va hien gia register/renew tu backend.
- [x] `S05-03`: Form contact name/email/phone/CCCD va so nam 1-10.
- [x] `S05-04`: Tich hop coupon preview theo gia backend tra ve.
- [x] `S05-05`: Mua domain va tach ket qua `success`/`pending_manual`.
- [x] `S05-06`: Giai thich ro pending manual khong dong nghia voi giao dich that bai.
- [x] `S05-07`: Luu draft contact cuc bo khi user chu dong chon; chi luu name/email/phone va khong luu CCCD.
- [x] `S05-08`: Test TLD nhieu cap nhu `.edu.vn`, TLD khong ho tro va domain da dang ky.
- [x] `S05-09`: Dung decimal string cho register/renew price va khong tinh tien bang float.

### API

- `POST /api/v1/orders/check-domain`
- `POST /api/v1/orders/preview-coupon`
- `POST /api/v1/orders/buy-domain`

### Nghiem thu

- Check domain dung khi chua login.
- Checkout yeu cau login va quay lai dung context.
- Hai ket qua auto/manual co UI va next action khac nhau.
- Contact validation khop backend.

### Dependency

- Backend local nhan public check va auth gate dung contract; `.com` dang bi chan boi TenTen credential chua cau hinh, `.edu.vn` va TLD la chua co pricing active.
- Frontend hien nguyen business message tu backend; success/pending purchase duoc bao phu bang automated tests trong khi cho integration data phu hop.

## Sprint 06 - Vi, nap tien va rut tien

**Trang thai:** Hoan thanh frontend ngay 2026-09-19; wallet, transaction, bank va withdrawal ownership/validation da runtime verify voi customer integration rieng.

### Muc tieu

Hoan thien cac thao tac tai chinh ma backend hien co va bo UI gia khoi dashboard.

### Cong viec

- [x] `S06-01`: Type-safe bank/deposit/withdraw/wallet transaction service, normalize money ve decimal string.
- [x] `S06-02`: Form nap tien dung inline validation thay cho `alert`.
- [x] `S06-03`: Man hinh QR co copy account number, amount va transaction code.
- [x] `S06-04`: Canh bao bat buoc noi dung chuyen khoan va trang thai dang cho xu ly.
- [x] `S06-05`: Tao `/user/withdraw`, min 50.000d, kiem tra so du va xac nhan tru tien ngay.
- [x] `S06-06`: Tao `/user/withdrawals` voi pagination theo `per_page`; khong them filter backend chua ho tro.
- [x] `S06-07`: Dashboard lay so du va wallet history tu wallet APIs; hien loading/error/empty thay vi so lieu gia.
- [x] `S06-08`: Khong log request ngan hang; che so tai khoan tren withdrawal history.
- [x] `S06-09`: Test deposit min amount, QR/copy, withdraw insufficient balance, pending va pagination.

### API

- `GET /api/v1/finance/banks`
- `POST /api/v1/finance/deposit`
- `GET /api/v1/finance/withdraws`
- `POST /api/v1/finance/withdraw`
- `GET /api/v1/finance/wallet`
- `GET /api/v1/finance/wallet/transactions`
- `GET /api/v1/finance/wallet/transactions/{transaction}`

### Nghiem thu

- Tao deposit va QR dung thong tin response.
- Tao withdrawal thanh cong va hien pending.
- Reload van xem duoc danh sach withdrawal.
- Khong hien so du/thong ke gia khi API loading/error; co retry va state ro rang.

### Dependency

- BE-01 va BE-04 da resolved; Sprint 06 da runtime verify voi wallet `0.00`, transaction/withdrawal empty pagination va mot active bank.
- Wallet/order/service ownership do backend scope theo token; frontend khong gui `user_id`.
- Deposit duoi 10.000d tra 422; withdrawal 50.000d voi vi 0 tra 400 insufficient balance, khong tao giao dich trong audit.

## Sprint 07 - Customer center: don hang, hosting va domain

**Trang thai:** Hoan thanh frontend ngay 2026-09-20; service list/dashboard va owner-scoped read da runtime verify. Thanh cong change-password/renew can active service fixture co so du.

### Muc tieu

Bien `/user` thanh trung tam dich vu that, khong con mock data.

### Cong viec

- [x] `S07-01`: Dashboard tong hop wallet va dung `meta.total` tu order/service queries co filter de lay count, khong tai toan bo collection.
- [x] `S07-02`: `/user/orders` list/filter/pagination va order detail.
- [x] `S07-03`: Product order completed co nut download.
- [x] `S07-04`: `/user/hosting` list service, status, expiry, domain va plan.
- [x] `S07-05`: Doi hosting password; password moi chi hien mot lan va co copy action.
- [x] `S07-06`: Gia han hosting theo cac chu ky hop le, xac nhan chi phi.
- [x] `S07-07`: `/user/domains` list status/expiry va phan biet pending manual.
- [x] `S07-08`: Domain renewal 1-10 nam voi idempotency key on dinh; tach `success`, `pending_manual`, `failed` va provider conflict 409.
- [x] `S07-09`: Loai bo `/user/vps` khoi nav cho den khi BE-10 duoc trien khai.
- [x] `S07-10`: Test ownership error, inactive/expired/suspended service va renew failure.
- [x] `S07-11`: Dung `actions.can_renew`, `actions.can_change_password` va `pending_renewal` tu backend thay vi tu suy dien.
- [x] `S07-12`: Hosting renewal gui idempotency key va xu ly retry `idempotent=true` khong hien giao dich moi.

### API

- `GET /api/v1/finance/wallet`
- `GET /api/v1/finance/wallet/transactions`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order}`
- `GET /api/v1/services/my-services`
- `GET /api/v1/services/my-services/{service}`
- `POST /api/v1/orders/hosting/{id}/change-password`
- `POST /api/v1/orders/hosting/{id}/renew`
- `POST /api/v1/orders/domain/{service}/renew`
- `GET /api/v1/catalog/products/{id}/download`

### Nghiem thu

- Tat ca so lieu dashboard den tu API.
- User chi thay don hang/service cua chinh minh.
- Change password va renew chi active khi status cho phep.
- Khong con `MOCK_ORDERS` hoac menu dan den route 404.

### Dependency gate

- BE-01, BE-02, BE-03, BE-04 va BE-11 da resolved; Sprint 07 ready sau Contract Refresh Gate va cac sprint commerce lien quan.
- Ghi chu lich su: tai Sprint 07, BE-10 chua co contract nen menu VPS duoc an. Contract duoc bo sung 2026-09-21 va mo lai o Sprint 08V.
- Runtime voi customer integration moi: order/hosting/domain list tra 200 va `total=0`; service detail/credential ID khong thuoc user tra 404.
- Mutation ID hosting khong hop le bi backend tu choi 400, domain renew ID khong thuoc user tra 404; frontend hien business message va giu idempotency key khi retry.

## Sprint 08 - Client hardening va Client Release Gate

**Trang thai:** Hoan thanh phan frontend co the tu dong hoa, ra soat lai 2026-09-21. VPS success E2E qua API local/sandbox da dat; release gate con blocked boi browser/manual QA, staging URL va doi soat provider.

### Muc tieu

On dinh phan he Client truoc khi chuyen sang Admin.

### Cong viec

- [x] `S08-01`: Audit tat ca route/link/CTA; loai bo `href="#"` trong scope release.
- [x] `S08-02`: Accessibility: keyboard, focus, label, dialog, contrast va reduced motion.
- [B] `S08-03`: Responsive QA 360px, 768px, 1024px, 1440px. Static responsive audit dat; browser runner khong available de chup/duyet viewport, cho Product Owner manual QA.
- [x] `S08-04`: Toi uu image, request waterfall, dynamic import va loading boundary.
- [x] `S08-05`: Error boundary, not-found, offline/network timeout va retry.
- [x] `S08-06`: Security review: token exposure, XSS content, download filename, PII.
- [B] `S08-07`: Automated component/integration flow cho auth, catalog, purchase, hosting, domain, deposit, withdrawal dat; browser E2E runner chua co trong project/may hien tai.
- [B] `S08-08`: Production build va local backend smoke dat; chua co staging URL/credential de smoke staging.
- [x] `S08-09`: Chot release notes, known limitations va rollback checklist.
- [x] `S08-10`: Audit envelope/error/request ID/429 va decimal string tren tat ca luong client.
- [x] `S08-11`: Ownership negative test: order/service/transaction cua user khac phai tra 404.

### Client Release Gate

- [x] Contract Refresh Gate `CR-01` den `CR-08` dat.
- [x] Auth/session/guard dat.
- [x] Catalog/product detail dat.
- [x] Product buy/coupon/download dat.
- [x] Hosting buy dat.
- [x] Domain check/buy dat.
- [x] Deposit/withdraw dat.
- [B] VPS catalog, buy va owner management da trien khai; buy/renew/lifecycle success E2E qua API local/sandbox da dat. Con browser QA, xac minh provider expiry/rebuild credential va xu ly duplicate provider ID/order da tru vi nhung pending.
- [x] Customer center khong con mock va dat dependency gate.
- [x] Ownership 404, permission 403, conflict 409 va rate limit 429 dat tren critical paths (409 automated contract; 401/403/404/429 runtime local).
- [x] Khong co P0/P1 bug frontend da biet.
- [B] Lint, build va automated test dat; staging smoke blocked do chua co staging URL/credential.
- [ ] Product owner nghiem thu mobile va desktop.

Quyet dinh dieu chinh 2026-09-21: Product Owner cho phep bat dau Sprint 09 song song voi cac muc Client Release Gate con mo. Quyet dinh nay khong danh dau cac muc `[B]`/`[ ]` la dat; phai dong gate truoc production release.

## Sprint 08V - VPS client expansion truoc Admin

**Trang thai:** Frontend da trien khai; sandbox local co 2 plan/2 location/4 OS active va gia test. Success mutation/API E2E da xac minh 2026-09-21; browser QA, staging va provider reconciliation con mo.

### Muc tieu

Dua VPS vao catalog, checkout va customer center theo contract BE-10 moi, khong dung gia/plan/provider mock tren production.

### Cong viec

- [x] `S08V-01`: Type/service cho public VPS plan detail/list va OS images; normalize gia cycle/phu thu thanh decimal string.
- [x] `S08V-02`: `/vps` hien plan/spec/location/cycle tu API, loading/error/empty va checkout.
- [x] `S08V-03`: Buy VPS voi internal `location_id`, UUID thuan bat buoc va stable retry; khong thu root password.
- [x] `S08V-04`: UI tach active/creating/installing/reconciling; 409 giu UUID, khong tu poll dày hoac tao lenh mua moi.
- [x] `S08V-05`: `/user/vps` owner list/filter/pagination, provisioning/power/IP/OS/expiry va sync thu cong.
- [x] `S08V-06`: Credential chi owner active mo theo thao tac user; khong persist/log password, copy va xoa khoi state khi dong.
- [x] `S08V-07`: Power start/stop/restart/poweroff, rebuild xac nhan xoa du lieu, doi root password/hostname voi validation.
- [x] `S08V-08`: Renew VPS theo cycle/UUID, lay public plan qua `my-service.service.id`, cong phu thu location va xu ly idempotent/reconciling; khong cho thanh toan khi chua co gia. Plan khong con public can backend cung cap gia owner-scoped de renew.
- [x] `S08V-09`: Noi header/footer/sidebar/dashboard/order filter; bo CTA VPS gia cu.
- [B] `S08V-10`: Local/sandbox API E2E mot luong da dat: wallet fixture test, mua/provisioning, credentials, power, hostname, doi mat khau, rebuild, renewal va UUID retry khong tru tien hai lan. Browser E2E/staging chua dat; provider sandbox tra expiry qua khu, password sau rebuild khong khop va cac don khac gap duplicate provider ID/da tru vi nhung pending.

### API

- `GET /api/v1/services/vps-plans`, `GET /api/v1/services/vps-plans/{id}`, `GET /api/v1/services/vps-os-images`
- `POST /api/v1/orders/buy-vps`, `POST /api/v1/orders/vps/{service}/renew`
- `GET /api/v1/services/my-services?service_type=vps`, detail/credentials owner-scoped
- `POST /api/v1/services/my-services/{service}/vps-actions`, `/rebuild`, `/vps-password`, `/vps-hostname`, `/vps-sync`

### Dependency gate

- Local public catalog tra 200: 2 plan, 2 location va 4 OS active. Gia test Starter monthly/quarterly/annually = 80k/235k/940k, Pro = 145k/435k/1.73m; HCM 0, Singapore 20k. Wallet fixture 160k test qua deposit Admin approve local; mua 80k va gia han 80k, so du 0. Fixture bank da inactive.
- Backend migration doi `user_services.password_encrypted` sang TEXT de luu mat khau ma hoa toi da 64 ky tu; VPS regression tests 7/7, 120 assertions. Dong bo OS fallback tu catalog khi provider bo trong. Operation loi noi bo khong ghi SQL/ciphertext vao Admin response.
- Sandbox provider tra expiry 2026-05-27 du da renew thanh cong va trang thai active; password sau rebuild bi provider sync ghi de khac password yeu cau. Can xac minh provider contract/staging truoc production.
- Incident 2026-09-22: provider tra instance ID trung cho cac UUID khac nhau, order local da tru vi nhung con processing/pending. Backend can doi soat truoc khi retry/refund; xem `BACKEND_VPS_DUPLICATE_INCIDENT.md`. Frontend da che loi 5xx va giu UUID khi 5xx/network uncertainty. Frontend 125 tests, typecheck, lint, build pass; computer-use khong co browser.
- Backend tra 409 cho ca vi thieu tien va provider uncertain; frontend giu UUID khi retry nhung thong bao xung dot trung tinh. Nen bo sung business error code rieng de phan biet chinh xac.
- My-service resource tra `service` snapshot va `vps.location`, khong tra `vps_plan.pricing`; renewal hien lay gia public theo ID. Neu plan inactive, backend can endpoint gia renewal owner-scoped hoac contract tuong duong.
- 409 provider uncertain can giu operation `reconciling` va UUID; backend scheduler la nguon doi soat.
- Client Release Gate va Product Owner mobile/desktop QA van phai dat truoc production; Sprint 09 dang trien khai song song theo quyet dinh dieu chinh o tren.

---

# PHASE B - ADMIN

## Sprint 09 - Admin foundation, shell va authorization

**Contract readiness:** BE-06 va BE-07 da resolved theo tai lieu 2026-09-19; can runtime permission matrix smoke test.

**Trang thai:** Da trien khai foundation va kiem tra backend local 2026-09-21. Automated checks dat; browser responsive QA/staging van can nghiem thu truoc production.

### Muc tieu

Tao nen tang Admin tach biet, co route guard va permission-aware navigation.

### Cong viec

- [x] `S09-01`: Tao `app/admin/layout.tsx`, AdminSidebar, AdminTopbar va responsive shell.
- [x] `S09-02`: Guard `/admin/*` dua tren role/permission tu `/auth/me`; backend role `admin` la super-admin qua `Gate::before`, operator theo permission cu the.
- [x] `S09-03`: Trang 403, session expiry va redirect ve login co `returnUrl`.
- [x] `S09-04`: Permission utility `can(permission)` cho UI action.
- [x] `S09-05`: Tao data table, filter bar, pagination dung lai shared component, confirm dialog va form primitives dung chung.
- [x] `S09-06`: Tao admin service/hook conventions va query-state tren URL.
- [x] `S09-07`: Dashboard admin ban dau chi hien chi so co API that.
- [x] `S09-08`: Xac minh backend enforce BE-07; frontend guard chi phuc vu UX.
- [x] `S09-09`: Tao permission union/constant theo namespace `users.*`, `roles.manage`, `catalog.*`, `orders.*`, `services.*`, `domains.approve`, `finance.view`, `deposits.manage`, `withdrawals.manage`, `bank_accounts.manage`.

### API

- `GET /api/v1/auth/me`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/permissions`
- Cac admin endpoint theo permission de smoke test 200/403.

### Nghiem thu

- Customer khong vao duoc Admin UI.
- User admin thay menu/action theo permission.
- Goi API quan tri bang customer token bi backend tu choi.

### Dependency gate

- BE-06 va BE-07 da resolved; customer token bi 403, admin role duoc 200, operator `cskh` chi duoc 200 tren `orders.view`/`services.view` va bi 403 tren user/IAM endpoint. Browser QA va Client Release Gate con mo truoc production.

## Sprint 10 - Admin Catalog

**Trang thai:** Hoan thanh implementation va local API smoke 2026-09-26. Automated test/typecheck/lint/build dat; browser responsive QA tiep tuc thuoc release gate.

### Muc tieu

Quan ly category tree va product day du.

### Cong viec

- [x] `S10-01`: Category tree active/inactive, create/edit/delete.
- [x] `S10-02`: Parent selector ngan circular/self/descendant parent o UI; backend chan cycle truc tiep va gian tiep.
- [x] `S10-03`: Xu ly delete conflict 409 khi category con child/product.
- [x] `S10-04`: Product table voi search/category/type/is_active/pagination tren URL.
- [x] `S10-05`: Product create/edit voi price, description, file path va active state.
- [x] `S10-06`: Them `thumbnail_url`, `demo_url`; `file_url` chi co trong write form, UI dung `has_download_file` va khong ky vong backend tra path.
- [x] `S10-07`: Hien slug backend tao, khong cho UI tu suy dien slug cuoi.
- [x] `S10-08`: Soft delete confirmation va refresh list.
- [x] `S10-09`: Preview storefront product sau khi save.
- [x] `S10-10`: Test validation 422 va API conflict 409; local CRUD smoke dat va fixture da don.

### API

- Admin list category: `GET /api/v1/admin/catalog/categories` (`catalog.view`).
- Admin list product: `GET /api/v1/admin/catalog/products` (`catalog.view`).
- Category/Product create-update-delete duoi `/api/v1/catalog/*` (`catalog.manage`).

### Nghiem thu

- CRUD cap nhat table/tree khong can reload toan trang.
- Filter duoc phan anh tren URL.
- Khong xoa nham category dang co dependency.

### Bo sung Header/Backend truoc Sprint 10

- `GET /api/v1/auth/me` nhung wallet snapshot chi cho chinh chu; Header desktop/mobile hien so du va refresh bang `/finance/wallet` theo session/route.
- Backend category tree tra de quy day du; parent cycle va dependency delete tra 409.
- Runtime smoke tao/update/list/soft-delete product dat: slug do backend tao, money decimal string, `has_download_file=true`, khong lo `file_url`. Frontend 51 files/129 tests; backend 53 tests/423 assertions; typecheck, lint va build dat.
- Browser runner khong available trong phien kiem tra; khong dung API smoke thay cho responsive/manual QA.

## Sprint 11 - Admin Services: server, hosting plan, TLD

**Trang thai:** Hoan thanh implementation, automated verification, local API CRUD smoke va nang cap UI WHM/cPanel 2026-09-26. Browser/manual responsive QA do user thuc hien; backend da tra 409 khi xoa server con hosting plan.

### Muc tieu

Quan ly ha tang va bang gia dich vu ma Client dang su dung.

### Cong viec

- [x] `S11-01`: Server list/filter/type/status va CRUD.
- [x] `S11-02`: API token/password field write-only; khong dua secret vao log, list hoac toast.
- [x] `S11-03`: Chan delete server dang co hosting plan va goi y disable.
- [x] `S11-04`: Hosting plan list/filter/server/status va CRUD.
- [x] `S11-05`: Validate quota, price va WHM package name; WHM automatic chon package tu provider thay vi nhap tu do.
- [x] `S11-06`: TLD pricing list/filter/auto/status va CRUD.
- [x] `S11-07`: Normalize hien thi dau cham TLD va ba loai gia.
- [x] `S11-08`: Canh bao tac dong storefront khi disable plan/TLD.
- [x] `S11-09`: Smoke test `mock`, `whm`, `cyberpanel` config form.
- [x] `S11-10`: Cau hinh username, token/password auth, hostname/IP, port, TLS verify va timeout cho server provider.
- [x] `S11-11`: Test connection va xem package provider ngay tren danh sach server.
- [x] `S11-12`: Hien provider availability/sync time rieng voi trang thai dang ban; package mat tren WHM khong bi nham la loi gia ban.
- [x] `S11-13`: Customer hosting active automatic co nut dang nhap cPanel qua SSO URL ngan han, khong persist URL/credential.
- [x] `S11-14`: Backend CRUD package truc tiep qua WHM `addpkg/editpkg/killpkg`, tu nhan ten canonical co prefix reseller.
- [x] `S11-15`: Mo rong plan voi bandwidth, RAM metadata, FTP/email/database/domain limits va custom features.
- [x] `S11-16`: Frontend Admin tao/sua/xoa package WHM, form resource nang cao va canh bao xoa provider.
- [x] `S11-17`: Doc capability reseller tu WHM, hien chu thich tung thong so, checkbox unlimited/khong cau hinh va khoa lua chon WHM khong cap quyen.
- [x] `S11-18`: Tach tai nguyen hosting plan local khoi package WHM, cho phep vuot package, quick unlimited va bao toan override qua cron sync.

### API

- `/api/v1/services/servers` CRUD voi permission quan tri service.
- `/api/v1/services/servers/{id}/provider-capabilities` doc account limit va quyen package tu WHM.
- `/api/v1/admin/services/hosting-plans` CRUD (`services.manage`); route cu chi la compatibility alias.
- `/api/v1/services/tld-pricing` CRUD voi permission quan tri service.

### Nghiem thu

- Secret khong bi lo trong list UI/dev log.
- CRUD va filter hoat dong voi pagination.
- Constraint delete hien message co hanh dong thay the.

## Sprint 11H - Backend WHM/cPanel va hosting automation

**Trang thai:** Backend, frontend integration, migration, automated tests, local dry-run va live WHM lifecycle smoke hoan thanh 2026-09-26.

### Pham vi da chot

- Chi tich hop WHM/cPanel truc tiep qua WHM API v1; khong tich hop upstream/web me.
- Credential server gom username, auth type token/password, secret ma hoa, port, TLS verify va timeout.
- Admin co API test connection, doc package WHM va user co command tao cPanel SSO session owner-scoped.
- Hosting buy dung idempotency key; loi provider tam thoi giu pending de reconcile, khong refund va khong tru tien lan hai.
- Cron suspend hosting het han, terminate sau grace 72 gio, retry pending, reconcile trang thai va dong bo package moi gio.
- Package mat tren WHM bi tat local; package moi duoc import inactive voi gia 0; gia ban va tai nguyen local admin da dat luon duoc giu nguyen.
- Lifecycle co lease lock, scheduler overlap lock, audit log, safe error va `--dry-run`.

### API backend bo sung

- `POST /api/v1/services/servers/{id}/test-connection`.
- `GET /api/v1/services/servers/{id}/provider-plans`.
- `GET /api/v1/services/servers/{id}/provider-capabilities`.
- `POST /api/v1/services/my-services/{service}/login-session`.
- Server CRUD nhan `api_username`, `api_auth_type`, `api_token`, `api_port`, `verify_tls`, `connect_timeout`, `request_timeout`; response khong bao gio tra secret.
- `ip_address` nhan ca IPv4/IPv6 va hostname hop le, toi da 253 ky tu.

### Frontend integration

- Admin server co form day du cho WHM/CyberPanel, test ket noi va dialog xem package provider.
- Admin hosting plan lay package truc tiep tu WHM khi server automatic, dung quota provider lam goi y nhung cho phep local override/unlimited va hien `provider_available`/`provider_synced_at`.
- Backend provider package mutation API va frontend CRUD nang cao tai `S11-16` da hoan thanh.
- Frontend package manager da merge du lieu `listpkgs` voi metadata local, ho tro disk/bandwidth/RAM/FTP/email/database/domain limits, custom feature va extension options.
- Form package co icon giai thich, checkbox unlimited/khong cau hinh va trang thai quyen lay truc tiep tu WHM `myprivs`/`acctcounts`; khong suy dien tran MB khi provider khong cong bo.
- Gia ban la du lieu local do admin quyet dinh; dong bo provider khong ghi de `price_per_month`.
- Customer co cPanel one-click SSO cho hosting automatic dang active; popup duoc dong va hien loi an toan neu backend/provider tu choi.

### Release gate

- [x] Migration local va credential encryption at rest.
- [x] Full backend suite sau capability package: 67 tests, 511 assertions.
- [x] Frontend typecheck, lint, production build va full suite sau local hosting override: 56 files, 150 tests; ba route hosting/admin local tra HTTP 200.
- [x] Local cron dry-run va scheduler registration.
- [x] Live WHM: TLS/version, listpkgs, add/kill package test, accountsummary, createacct, suspendacct, unsuspendacct, passwd, create_user_session va removeacct. Account/package tam da duoc xoa va xac minh khong con tren WHM.
- [ ] Cai process `php artisan schedule:work` local hoac cron `schedule:run` moi phut tren staging/production.

## Sprint 12 - Admin Orders, coupon va service operations

### Muc tieu

Quan ly khuyen mai, don hang va cac dich vu can thao tac thu cong.

**Trang thai:** Hoan thanh implementation va automated release gate ngay 2026-09-27.

### Cong viec

- [x] `S12-01`: Coupon list/search/status va CRUD.
- [x] `S12-02`: Form bat buoc dung mot loai discount, normalize uppercase.
- [x] `S12-03`: Hien usage/limit/expiry va trang thai het han/het luot.
- [x] `S12-04`: Order list/detail/filter theo search, user, type, status, date va amount.
- [x] `S12-05`: User service list/detail theo search, user, type, status va expiry.
- [x] `S12-06`: Queue domain `pending` va action approve co confirm.
- [x] `S12-07`: Phan biet manual registration/renewal; approve renewal cong han tu `max(expires_at, now)`.
- [x] `S12-08`: Audit status mapping, tranh dung legacy `paid/cancelled` sai contract.
- [x] `S12-09`: Test duplicate action va stale pending state.

### API

- Coupon CRUD `/api/v1/orders/coupons`.
- Coupon CRUD yeu cau `orders.manage`; customer token phai bi 403.
- `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/{order}`.
- `GET /api/v1/admin/services`, `GET /api/v1/admin/services/{service}`.
- `POST /api/v1/admin/services/{service}/approve-domain` (`domains.approve`).

### Nghiem thu

- Coupon invalid combination khong gui len API.
- Chi domain pending co the approve.
- Double approve duoc ngan o UI va backend tu choi neu state da doi.

### Dependency gate

- BE-05 da resolved; Sprint 12 ready sau Admin foundation.
- Khong tao PATCH order status tong quat; chi dung command nghiep vu duoc contract cung cap.

### Bang chung hoan thanh

- Frontend full suite: 60 test files, 155 tests; TypeScript, ESLint va production build deu pass.
- Backend full suite: 70 tests, 522 assertions; Pint pass tren cac file Coupon thay doi.
- Runtime smoke: `/admin/coupons`, `/admin/orders`, `/admin/services` deu tra HTTP 200.
- Coupon backend normalize code truoc unique validation va ho tro chuyen discount type ma xoa dung gia tri cu.
- Domain approve da co backend idempotency/audit test va UI khoa action trong luc request dang xu ly.
- Bao cao chi tiet: `SPRINT_12_REPORT.md`.

## Sprint 13 - Admin Finance

### Muc tieu

Quan ly tai khoan nhan tien, duyet nap va xu ly rut tien an toan.

**Trang thai:** Hoan thanh implementation va automated release gate ngay 2026-09-27.

### Cong viec

- [x] `S13-01`: Bank account list/filter va CRUD.
- [x] `S13-02`: Mask account number hop ly tren list, hien day du trong detail can quyen.
- [x] `S13-03`: Xu ly delete conflict, de xuat disable `is_active`.
- [x] `S13-04`: Deposit queue/search/status/detail.
- [x] `S13-05`: Approve deposit voi `actual_amount`, xac nhan chenh lech amount.
- [x] `S13-06`: Cancel chi khi pending; refresh state sau action.
- [x] `S13-07`: Withdrawal queue/search/status.
- [x] `S13-08`: Approve withdrawal voi confirm da chuyen khoan.
- [x] `S13-09`: Reject bat buoc `admin_note`, hien ro tien se hoan vi.
- [x] `S13-10`: Chan double click/concurrent action va xu ly 409/400 state conflict.
- [x] `S13-11`: Test permission, pending-only rule va actual amount = 0 edge case.

### API

- `/api/v1/finance/admin/bank-accounts` CRUD (`bank_accounts.manage`).
- `/api/v1/finance/admin/deposits` list/detail/approve/cancel (`deposits.manage`).
- `/api/v1/finance/admin/withdraws` list/approve/reject (`withdrawals.manage`).

### Nghiem thu

- Action tai chinh luon co confirm va state moi duoc fetch lai.
- UI phan biet expected amount va actual amount.
- Reject withdrawal bat buoc note va hien ket qua refund.

### Bang chung hoan thanh

- Frontend full suite: 64 test files, 160 tests; TypeScript, ESLint va production build deu pass.
- Backend full suite: 73 tests, 540 assertions; Finance feature test va Pint pass.
- Runtime smoke: ba route `/admin/finance/*` deu tra HTTP 200.
- Permission test xac nhan `finance.view` chi duoc doc, khong duoc approve; customer bi 403.
- Backend test xac nhan approve deposit `actual_amount = 0`, pending-only va refund withdrawal chi chay mot lan.
- Bao cao chi tiet: `SPRINT_13_REPORT.md`.

## Sprint 14 - Admin Users, settings va support expansion

**Contract readiness:** IAM va VPS Admin XVPS da co contract; settings/support van deferred theo BE-12.

**Trang thai:** Hoan thanh toan bo scope co contract ngay 2026-09-27; Settings va Support duoc deferred co chu dich den BE-12.

### Muc tieu

Hoan thanh IAM Admin theo contract that; tach settings, support va VPS thanh deferred scope neu API van chua co.

### Cong viec

- [x] `S14-01`: User list/detail/search/status/role voi pagination.
- [x] `S14-02`: Activate/deactivate user voi impact warning.
- [x] `S14-03`: User create/edit/delete; xu ly self-action va last-active-admin conflict 409.
- [x] `S14-04`: Role/permission assignment va audit thay doi quyen.
- [x] `S14-05`: Role CRUD/sync permission; bao ve system role va role dang duoc gan.
- [ ] `S14-06` **Deferred BE-12**: Settings cho SePay pattern/token va TenTen credential khi backend co route/controller.
- [x] `S14-07`: Mask secret; update khong bat buoc frontend doc lai secret day du. Da ap dung cho XVPS provider config.
- [ ] `S14-08` **Deferred BE-12**: Support ticket list/detail/reply khi backend co route/controller va release scope.
- [x] `S14-09`: VPS Admin provider config, sync catalog, plan/location gia ban, instance list/detail/sync/retry va provider health theo BE-10; khong lo secret/gia von cho client.
- [x] `S14-10`: Settings/Support duoc ghi ro deferred backlog; khong tao UI mock.
- [x] `S14-11`: User wallet history ngay tren tung row, co filter/pagination va so du truoc/sau.
- [x] `S14-12`: Cong/tru so du co permission `wallets.manage`, note bat buoc, confirm, row lock, audit va UUID idempotency.
- [x] `S14-13-BE`: Backend presentation slides: public schedule API, Admin CRUD/upload/reorder, preset giao dien va audit.
- [x] `S14-13-FE`: Them menu Cai dat > Trinh dien anh va thay hero hard-code bang API co fallback.
- [x] `S14-14`: Live hero preview, menu dong Header/Footer tu Backend den Frontend va sidebar Admin gom nhom dropdown.
- [x] `S14-15`: Site branding settings: favicon, logo tung khu vuc, SEO, lien he, copyright va wiring storefront/Admin.

### API

- `/api/v1/admin/users` va user status/roles commands.
- `/api/v1/admin/permissions`, `/api/v1/admin/roles`.
- `/api/v1/admin/users/{user}/wallet-transactions` va `/wallet-adjustments`.
- VPS Admin endpoints `/api/v1/admin/vps/*` theo BE-10; settings/support BE-12 chua co contract, khong tao UI mock.
- Public `/api/v1/presentation-slides`; Admin CRUD/upload/reorder tai `/api/v1/admin/presentation-slides`.
- Public `/api/v1/navigation-menus`; Admin CRUD/reorder tai `/api/v1/admin/navigation-items`.
- Public `/api/v1/site-settings`; Admin read/update/upload tai `/api/v1/admin/site-settings`.

### Nghiem thu

- Khong co trang admin “hoan thanh” nao chi dung mock.
- Role/permission thay doi duoc backend enforce.
- Secret khong bao gio hien lai neu backend khong chu dong tra ve.

### Dependency gate

- IAM scope ready theo BE-06/BE-07.
- Settings/support tach deferred backlog cho den khi BE-12 co route/controller.
- VPS client offering duoc trien khai o Sprint 08V; Admin VPS van thuoc Sprint 14 va can runtime permission matrix.

### Bang chung hoan thanh

- Frontend full suite: 82 test files, 192 tests; TypeScript, ESLint va production build deu pass.
- Backend full suite: 95 tests, 685 assertions; IAM, wallet, VPS, slide, navigation va site settings security tests pass.
- HTTP frontend: `/admin/users`, `/admin/permissions`, `/admin/vps` tra 200.
- API local voi admin: users, permissions, roles, VPS provider config/plans/locations/instances deu tra 200.
- Da sua runtime bug `/admin/roles` do Spatie khong resolve `Role::users()`; controller dem pivot theo `User::class` va co regression test.
- XVPS credential chi hien masked/boolean; input secret luon rong va de trong khi update se giu secret cu.
- Migration presentation slides da chay local, public storage link da tao; public va Admin slide API smoke deu tra 200.
- Frontend Admin presentation route va homepage HTTP smoke tra 200; browser connector khong co browser kha dung nen visual responsive QA chua duoc tu dong xac minh.
- Navigation migration da chay local; public API tra 5 header root, 2 footer group va Admin API tra 15 record mac dinh.
- Site settings migration da chay local; public/Admin read va Admin update smoke pass, secret settings khong xuat hien trong public payload.
- Bao cao chi tiet: `SPRINT_14_REPORT.md`.

## Sprint 15 - Admin hardening va Production Release Gate

### Muc tieu

Kiem thu tong the, bao mat va san sang phat hanh toan he thong.

### Cong viec

- `S15-01`: Audit permission cho moi route, menu, button va API action.
- `S15-02`: E2E Catalog, Services, Coupons, Domain approval va Finance approvals.
- `S15-03`: Test concurrent/stale state cho cac action tai chinh va phe duyet.
- `S15-04`: Responsive va accessibility QA cho data table/form/dialog.
- `S15-05`: Kiem tra secret/PII khong xuat hien trong log, error, analytics.
- `S15-06`: Performance voi list lon va pagination.
- `S15-07`: Production build, staging smoke test va rollback rehearsal.
- `S15-08`: Chot tai lieu van hanh, known limitations va release notes.

### Production Release Gate

- [ ] Client Release Gate van dat sau cac thay doi Admin.
- [ ] Backend enforce role/permission cho admin endpoint.
- [ ] Customer token bi 403 tren Catalog/Services/Coupon/Finance/IAM admin actions.
- [ ] Catalog/Services/Coupon/Finance Admin dat E2E.
- [ ] Khong con mock data trong scope production.
- [ ] Khong co P0/P1 bug va khong co secret/PII leak.
- [ ] Lint, build, tests va staging smoke test dat.
- [ ] Ke hoach backup/rollback va nguoi phe duyet release da ro.

## 8. Chien luoc test

### Unit test

- Formatter tien/ngay/status.
- Response/error mapper.
- Permission helper.
- Zustand auth actions.
- Validation va tinh tong tien UI.

### Component/integration test

- Auth forms va 422 field errors.
- Catalog filter/pagination URL state.
- Coupon preview va checkout states.
- Deposit/withdraw forms.
- Admin CRUD forms va confirm dialog.

### E2E critical paths

1. Register -> login -> refresh session -> logout.
2. Search product -> detail -> coupon -> buy -> download.
3. Select hosting -> checkout -> success/failure.
4. Check domain -> buy auto/manual.
5. Deposit -> QR; withdraw -> pending/history.
6. Admin CRUD category/product/plan/TLD/coupon.
7. Admin approve/cancel deposit; approve/reject withdrawal.
8. Admin approve pending domain.

## 9. Quy tac theo doi tien do

Trang thai task:

- `[ ]` Chua lam.
- `[-]` Dang lam.
- `[x]` Hoan thanh va da verify.
- `[B]` Blocked; phai ghi dependency ID va ngay cap nhat.

Moi sprint can ghi:

- Ngay bat dau/ket thuc thuc te.
- Task da hoan thanh.
- API gap moi phat hien.
- Test da chay va ket qua.
- Bug con lai theo muc P0/P1/P2/P3.
- Quyet dinh carry-over kem ly do.

## 10. Thu tu thuc thi de xuat

```text
S00 -> S01 -> S02 -> S03 -> Contract Refresh Gate -> S04 -> S05 -> S06 -> S07 -> S08
                                                        |
                                              Client Release Gate
                                                        |
S09 -> S10 -> S11 -> S12 -> S13 -> S14 -> S15
                                      Production Release Gate
```

Critical backend path:

```text
BE-13 + envelope/error/decimal migration -> CR-01..CR-08 -> re-audit S01/S02/S03
BE-01/02/03/04/08/09/11 resolved         -> S04/S05/S06/S07 -> Client Release Gate
BE-06/07 resolved, runtime verify         -> S09 -> Admin deployment
BE-05 resolved                            -> S12
BE-06/07 resolved                         -> S14 IAM
BE-10 resolved                            -> S08V Client VPS -> Client Release Gate
BE-12 deferred                            -> settings/support ngoai release scope neu chua co contract
BE-14 partial                             -> S08/S15 deployment gate
```

## 11. Moc hoan thanh

- `M1 - Foundation Ready`: Sprint 00.
- `M2 - Client Commerce Ready`: Re-audit Sprint 01-03, Contract Refresh Gate va Sprint 04-06.
- `M3 - Client Complete`: Sprint 07-08 va Client Release Gate.
- `M4 - Admin Core Ready`: Sprint 09-13.
- `M5 - Full Platform Ready`: Sprint 14-15 va Production Release Gate.
