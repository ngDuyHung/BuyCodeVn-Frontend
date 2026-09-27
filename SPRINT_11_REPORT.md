# Sprint 11 - Admin Services

Ngay hoan thanh implementation va WHM package manager: 2026-09-27

## Da trien khai

- Sidebar Admin co ba route theo `services.view`: `/admin/services/servers`, `/admin/services/hosting-plans`, `/admin/services/tld-pricing`. Action write chi hien voi `services.manage` hoac super-admin.
- Server: search/type/status tren URL, pagination, create/edit/delete, type `mock`/`whm`/`cyberpanel`, provisioning mode, login URL va status.
- API token dung input password, khong nap lai gia tri cu, chi gui khi admin nhap token moi. List/detail chi dung `has_api_token`; frontend khong co secret trong resource, table, toast hay log.
- Khi server con hosting plan, delete dialog chuyen sang hanh dong tat server de an cac plan lien quan khoi storefront.
- Hosting plan: search/server/status tren URL, pagination, create/edit/delete; validate server, quota nguyen khong am, gia khong am va package name khong co khoang trang.
- TLD pricing: search/auto-register/status tren URL, pagination, create/edit/delete, ba loai gia rieng. TLD duoc chuan hoa chu thuong va mot dau cham dau.
- Form canh bao tac dong storefront truoc khi tat server, hosting plan hoac TLD.
- Dialog package WHM ho tro tao/sua/xoa truc tiep, tu nhan ten canonical co prefix reseller va xac nhan truoc khi xoa provider.
- Form package co disk, bandwidth, RAM metadata, FTP, email, database, subdomain, parked/addon domain, custom storefront feature va WHM extension/provider options.
- Hosting plan local merge package provider voi RAM/custom metadata; gia ban va trang thai storefront van tach rieng, khong bi cron ghi de.
- Card storefront hien thong so disk, bandwidth, RAM, database, addon domain va custom feature that tu API.

## Backend/runtime smoke

- Admin login va list server/hosting plan/TLD: dat; response field khop contract.
- Server resource co `has_api_token`, khong co property `api_token` trong list va create response.
- Vong CRUD tam server Mock, hosting plan va TLD: create, update, delete va cleanup dat; khong con fixture QA.
- Xoa server khi con hosting plan duoc backend chan bang HTTP 409; frontend de xuat tat server thay vi xoa.
- Live WHM package CRUD dat: addpkg, editpkg, killpkg; package va local fixture tam da duoc don sach.

## Frontend verification

- TypeScript va ESLint: pass.
- Frontend full suite: 56 test files, 146 tests pass; test moi bao phu endpoint/filter, token masking, provider package CRUD, resource form, delete confirmation va storefront specs.
- Production build: pass; co du ba route Admin Services.
- HTTP local: `/admin/services/servers`, `/admin/services/hosting-plans`, `/hosting` deu tra 200.
- Browser/manual responsive QA do user tu thuc hien theo thong nhat; khong tinh API smoke la browser QA.
