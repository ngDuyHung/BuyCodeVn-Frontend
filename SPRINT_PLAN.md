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
| BE-10 | Open/deferred | Chua co VPS offering contract cho client | Khong dua VPS vao release client |
| BE-11 | Resolved | `POST /api/v1/orders/domain/{service}/renew` co idempotency/manual flow | Domain renewal |
| BE-12 | Open/deferred | Settings va support ticket van chua co route/controller | Tach khoi MVP hoac doi contract |
| BE-13 | Resolved, migrated | JSON envelope thong nhat `success/data/message/error/meta/links` | Tat ca parser/service |
| BE-14 | Partial | Token 7 ngay va CORS allowlist da ro; production URL/cookie deployment van can chot | Release/deploy |
| BE-15 | Resolved | `GET /services/server-categories` va query `server_category` public, khong lo ha tang noi bo | Bo loc danh muc tai hosting storefront |
| BE-16 | Resolved | Hosting ho tro `automatic`/`manual`; buy response tach `success` va `pending_manual`, credential owner-scoped | Checkout hosting va customer center |

Quyet dinh scope: BE-10 va BE-12 khong duoc gia lap du lieu. Cac contract da resolved van phai duoc frontend smoke test voi role/customer ownership that truoc khi dong dependency gate.

### Contract Refresh Gate

Tai lieu backend moi khong backward-compatible voi mot so gia dinh da dung trong Sprint 01-03. Thuc hien audit theo thu tu Sprint 01 -> Sprint 02 -> Sprint 03:

- [x] `CR-01`: Doi response type/parser sang envelope `success`, `data`, `message`, `error`, `meta`, `links` cho ca resource va pagination.
- [x] `CR-02`: Doi error mapper sang `error.code`, `error.message`, `error.details`, `request_id`; map validation 422 va hien retry cho 429.
- [x] `CR-03`: Them/giai truyen `X-Request-ID` de doi chieu log; khong hien request ID nhu business message.
- [x] `CR-04`: Tao `MoneyString` va dung `decimal.js` khi tinh tong/giam gia; khong dung binary float cho checkout/finance.
- [ ] `CR-05`: Dong bo auth login moi `data.user`, `data.token`, `token_type`, `expires_in`; verify refresh/session expiry 7 ngay.
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

### Muc tieu

Hoan thanh luong check domain, nhap contact va mua domain auto/manual.

### Cong viec

- `S05-01`: Tao `/domains` voi form check domain public.
- `S05-02`: Normalize domain input va hien gia register/renew tu backend.
- `S05-03`: Form contact name/email/phone/CCCD va so nam 1-10.
- `S05-04`: Tich hop coupon preview theo gia backend tra ve.
- `S05-05`: Mua domain va tach ket qua `success`/`pending_manual`.
- `S05-06`: Giai thich ro pending manual khong dong nghia voi giao dich that bai.
- `S05-07`: Luu draft contact cuc bo theo lua chon bao mat phu hop, khong luu CCCD mac dinh.
- `S05-08`: Test TLD nhieu cap nhu `.edu.vn`, TLD khong ho tro va domain da dang ky.
- `S05-09`: Dung decimal string cho register/renew price va khong tinh tien bang float.

### API

- `POST /api/v1/orders/check-domain`
- `POST /api/v1/orders/preview-coupon`
- `POST /api/v1/orders/buy-domain`

### Nghiem thu

- Check domain dung khi chua login.
- Checkout yeu cau login va quay lai dung context.
- Hai ket qua auto/manual co UI va next action khac nhau.
- Contact validation khop backend.

## Sprint 06 - Vi, nap tien va rut tien

### Muc tieu

Hoan thien cac thao tac tai chinh ma backend hien co va bo UI gia khoi dashboard.

### Cong viec

- `S06-01`: Type-safe bank/deposit/withdraw service.
- `S06-02`: Form nap tien dung inline validation thay cho `alert`.
- `S06-03`: Man hinh QR co copy account number, amount va transaction code.
- `S06-04`: Canh bao bat buoc noi dung chuyen khoan va trang thai dang cho xu ly.
- `S06-05`: Tao `/user/withdraw`, min 50.000d va xac nhan tru tien ngay.
- `S06-06`: Tao `/user/withdrawals` voi pagination theo `per_page`; chi them filter khi backend contract bo sung.
- `S06-07`: Dashboard lay so du va wallet history tu wallet APIs; hien loading/error/empty thay vi con so `0d` gia.
- `S06-08`: Bao ve thong tin tai khoan ngan hang trong log/error.
- `S06-09`: Test deposit min amount, withdraw insufficient balance va pagination.

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

- BE-01 va BE-04 da resolved; Sprint 06 ready sau khi dat Contract Refresh Gate.
- Wallet/order/service ownership do backend scope theo token; frontend khong gui `user_id`.

## Sprint 07 - Customer center: don hang, hosting va domain

### Muc tieu

Bien `/user` thanh trung tam dich vu that, khong con mock data.

### Cong viec

- `S07-01`: Dashboard tong hop wallet va dung `meta.total` tu order/service queries co filter de lay count, khong tai toan bo collection.
- `S07-02`: `/user/orders` list/filter/pagination va order detail.
- `S07-03`: Product order completed co nut download.
- `S07-04`: `/user/hosting` list service, status, expiry, domain va plan.
- `S07-05`: Doi hosting password; password moi chi hien mot lan va co copy action.
- `S07-06`: Gia han hosting theo cac chu ky hop le, xac nhan chi phi.
- `S07-07`: `/user/domains` list status/expiry va phan biet pending manual.
- `S07-08`: Domain renewal 1-10 nam voi idempotency key on dinh; tach `success`, `pending_manual`, `failed` va provider conflict 409.
- `S07-09`: Loai bo `/user/vps` khoi nav cho den khi BE-10 duoc trien khai.
- `S07-10`: Test ownership error, inactive/expired/suspended service va renew failure.
- `S07-11`: Dung `actions.can_renew`, `actions.can_change_password` va `pending_renewal` tu backend thay vi tu suy dien.
- `S07-12`: Hosting renewal gui idempotency key va xu ly retry `idempotent=true` khong hien giao dich moi.

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
- BE-10 van deferred; khong dua VPS vao navigation/release.

## Sprint 08 - Client hardening va Client Release Gate

### Muc tieu

On dinh phan he Client truoc khi chuyen sang Admin.

### Cong viec

- `S08-01`: Audit tat ca route/link/CTA; loai bo `href="#"` trong scope release.
- `S08-02`: Accessibility: keyboard, focus, label, dialog, contrast va reduced motion.
- `S08-03`: Responsive QA 360px, 768px, 1024px, 1440px.
- `S08-04`: Toi uu image, request waterfall, dynamic import va loading boundary.
- `S08-05`: Error boundary, not-found, offline/network timeout va retry.
- `S08-06`: Security review: token exposure, XSS content, download filename, PII.
- `S08-07`: E2E cho auth, catalog, product purchase, hosting, domain, deposit, withdrawal.
- `S08-08`: Production build va smoke test voi backend staging.
- `S08-09`: Chot release notes, known limitations va rollback checklist.
- `S08-10`: Audit envelope/error/request ID/429 va decimal string tren tat ca luong client.
- `S08-11`: Ownership negative test: order/service/transaction cua user khac phai tra 404.

### Client Release Gate

- [ ] Contract Refresh Gate `CR-01` den `CR-08` dat.
- [ ] Auth/session/guard dat.
- [ ] Catalog/product detail dat.
- [ ] Product buy/coupon/download dat.
- [ ] Hosting buy dat.
- [ ] Domain check/buy dat.
- [ ] Deposit/withdraw dat.
- [ ] Customer center khong con mock va dat dependency gate.
- [ ] Ownership 404, permission 403, conflict 409 va rate limit 429 dat tren critical paths.
- [ ] Khong co P0/P1 bug.
- [ ] Lint, build, automated test va staging smoke test dat.
- [ ] Product owner nghiem thu mobile va desktop.

Chi khi checklist nay dat moi bat dau Sprint 09.

---

# PHASE B - ADMIN

## Sprint 09 - Admin foundation, shell va authorization

**Contract readiness:** BE-06 va BE-07 da resolved theo tai lieu 2026-09-19; can runtime permission matrix smoke test.

### Muc tieu

Tao nen tang Admin tach biet, co route guard va permission-aware navigation.

### Cong viec

- `S09-01`: Tao `app/admin/layout.tsx`, AdminSidebar, AdminTopbar va responsive shell.
- `S09-02`: Guard `/admin/*` dua tren role/permission tu `/auth/me`.
- `S09-03`: Trang 403, session expiry va redirect ve login co `returnUrl`.
- `S09-04`: Permission utility `can(permission)` cho UI action.
- `S09-05`: Tao data table, filter bar, pagination, confirm dialog va form primitives dung chung.
- `S09-06`: Tao admin service/hook conventions va query-state tren URL.
- `S09-07`: Dashboard admin ban dau chi hien chi so co API that.
- `S09-08`: Xac minh backend enforce BE-07; frontend guard chi phuc vu UX.
- `S09-09`: Tao permission union/constant theo namespace `users.*`, `roles.manage`, `catalog.*`, `orders.*`, `services.*`, `domains.approve`, `finance.view`, `deposits.manage`, `withdrawals.manage`, `bank_accounts.manage`.

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

- BE-06 va BE-07 da resolved; gate dong khi customer token bi 403 va tung operator chi thay/goi duoc action theo permission.

## Sprint 10 - Admin Catalog

### Muc tieu

Quan ly category tree va product day du.

### Cong viec

- `S10-01`: Category tree active/inactive, create/edit/delete.
- `S10-02`: Parent selector ngan circular/self parent o UI.
- `S10-03`: Xu ly delete conflict khi category con product.
- `S10-04`: Product table voi search/category/type/is_active/pagination.
- `S10-05`: Product create/edit voi price, description, file path va active state.
- `S10-06`: Them `thumbnail_url`, `demo_url`; `file_url` chi co trong write form va khong ky vong backend tra lai.
- `S10-07`: Hien slug backend tao, khong cho UI tu suy dien slug cuoi.
- `S10-08`: Soft delete confirmation va refresh list.
- `S10-09`: Preview storefront product sau khi save.
- `S10-10`: Test validation 422 va API conflict paths.

### API

- Admin list category: `GET /api/v1/admin/catalog/categories` (`catalog.view`).
- Admin list product: `GET /api/v1/admin/catalog/products` (`catalog.view`).
- Category/Product create-update-delete duoi `/api/v1/catalog/*` (`catalog.manage`).

### Nghiem thu

- CRUD cap nhat table/tree khong can reload toan trang.
- Filter duoc phan anh tren URL.
- Khong xoa nham category dang co dependency.

## Sprint 11 - Admin Services: server, hosting plan, TLD

### Muc tieu

Quan ly ha tang va bang gia dich vu ma Client dang su dung.

### Cong viec

- `S11-01`: Server list/filter/type/status va CRUD.
- `S11-02`: API token field masked; khong dua secret vao log, list hoac toast.
- `S11-03`: Chan delete server dang co hosting plan va goi y disable.
- `S11-04`: Hosting plan list/filter/server/status va CRUD.
- `S11-05`: Validate quota, price va WHM package name.
- `S11-06`: TLD pricing list/filter/auto/status va CRUD.
- `S11-07`: Normalize hien thi dau cham TLD va ba loai gia.
- `S11-08`: Canh bao tac dong storefront khi disable plan/TLD.
- `S11-09`: Smoke test `mock`, `whm`, `cyberpanel` config form.

### API

- `/api/v1/services/servers` CRUD voi permission quan tri service.
- `/api/v1/admin/services/hosting-plans` CRUD (`services.manage`); route cu chi la compatibility alias.
- `/api/v1/services/tld-pricing` CRUD voi permission quan tri service.

### Nghiem thu

- Secret khong bi lo trong list UI/dev log.
- CRUD va filter hoat dong voi pagination.
- Constraint delete hien message co hanh dong thay the.

## Sprint 12 - Admin Orders, coupon va service operations

### Muc tieu

Quan ly khuyen mai, don hang va cac dich vu can thao tac thu cong.

### Cong viec

- `S12-01`: Coupon list/search/status va CRUD.
- `S12-02`: Form bat buoc dung mot loai discount, normalize uppercase.
- `S12-03`: Hien usage/limit/expiry va trang thai het han/het luot.
- `S12-04`: Order list/detail/filter theo search, user, type, status, date va amount.
- `S12-05`: User service list/detail theo search, user, type, status va expiry.
- `S12-06`: Queue domain `pending` va action approve co confirm.
- `S12-07`: Phan biet manual registration/renewal; approve renewal cong han tu `max(expires_at, now)`.
- `S12-08`: Audit status mapping, tranh dung legacy `paid/cancelled` sai contract.
- `S12-09`: Test duplicate action va stale pending state.

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

## Sprint 13 - Admin Finance

### Muc tieu

Quan ly tai khoan nhan tien, duyet nap va xu ly rut tien an toan.

### Cong viec

- `S13-01`: Bank account list/filter va CRUD.
- `S13-02`: Mask account number hop ly tren list, hien day du trong detail can quyen.
- `S13-03`: Xu ly delete conflict, de xuat disable `is_active`.
- `S13-04`: Deposit queue/search/status/detail.
- `S13-05`: Approve deposit voi `actual_amount`, xac nhan chenh lech amount.
- `S13-06`: Cancel chi khi pending; refresh state sau action.
- `S13-07`: Withdrawal queue/search/status.
- `S13-08`: Approve withdrawal voi confirm da chuyen khoan.
- `S13-09`: Reject bat buoc `admin_note`, hien ro tien se hoan vi.
- `S13-10`: Chan double click/concurrent action va xu ly 409/400 state conflict.
- `S13-11`: Test permission, pending-only rule va actual amount = 0 edge case.

### API

- `/api/v1/finance/admin/bank-accounts` CRUD (`bank_accounts.manage`).
- `/api/v1/finance/admin/deposits` list/detail/approve/cancel (`deposits.manage`).
- `/api/v1/finance/admin/withdraws` list/approve/reject (`withdrawals.manage`).

### Nghiem thu

- Action tai chinh luon co confirm va state moi duoc fetch lai.
- UI phan biet expected amount va actual amount.
- Reject withdrawal bat buoc note va hien ket qua refund.

## Sprint 14 - Admin Users, settings va support expansion

**Contract readiness:** IAM da san sang; settings/support van deferred theo BE-12; VPS van deferred theo BE-10.

### Muc tieu

Hoan thanh IAM Admin theo contract that; tach settings, support va VPS thanh deferred scope neu API van chua co.

### Cong viec

- `S14-01`: User list/detail/search/status/role voi pagination.
- `S14-02`: Activate/deactivate user voi impact warning.
- `S14-03`: User create/edit/delete; xu ly self-action va last-active-admin conflict 409.
- `S14-04`: Role/permission assignment va audit thay doi quyen.
- `S14-05`: Role CRUD/sync permission; bao ve system role va role dang duoc gan.
- `S14-06`: Settings cho SePay pattern/token va TenTen credential khi BE-12 san sang.
- `S14-07`: Mask secret; update khong bat buoc frontend doc lai secret day du.
- `S14-08`: Support ticket list/detail/reply theo permissions neu nam trong release scope.
- `S14-09`: VPS/server client offering chi trien khai sau BE-10 va mot contract rieng duoc phe duyet.
- `S14-10`: Neu cac module nay chua thuoc MVP, ghi ro deferred backlog thay vi tao UI mock.

### API

- `/api/v1/admin/users` va user status/roles commands.
- `/api/v1/admin/permissions`, `/api/v1/admin/roles`.
- BE-10 va BE-12 chua co contract; khong tao UI mock.

### Nghiem thu

- Khong co trang admin “hoan thanh” nao chi dung mock.
- Role/permission thay doi duoc backend enforce.
- Secret khong bao gio hien lai neu backend khong chu dong tra ve.

### Dependency gate

- IAM scope ready theo BE-06/BE-07.
- Settings/support tach deferred backlog cho den khi BE-12 co route/controller.
- VPS client offering tach deferred backlog cho den khi BE-10 co contract.

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
BE-10/12 deferred                         -> khong chan MVP neu VPS/settings/support ngoai release scope
BE-14 partial                             -> S08/S15 deployment gate
```

## 11. Moc hoan thanh

- `M1 - Foundation Ready`: Sprint 00.
- `M2 - Client Commerce Ready`: Re-audit Sprint 01-03, Contract Refresh Gate va Sprint 04-06.
- `M3 - Client Complete`: Sprint 07-08 va Client Release Gate.
- `M4 - Admin Core Ready`: Sprint 09-13.
- `M5 - Full Platform Ready`: Sprint 14-15 va Production Release Gate.
