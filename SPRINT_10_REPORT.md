# Sprint 10 - Admin Catalog

Ngay hoan thanh implementation: 2026-09-26

## Da trien khai

- Header client desktop/mobile hien so du vi. Dung snapshot owner-only tu `auth/me`, sau do refresh qua `GET /finance/wallet`; khong hien so lieu gia khi API chua san sang.
- Backend `UserResource` chi nhung wallet cho chinh user dang xac thuc. Admin category tree tra day du nhieu tang, chan parent cycle truc tiep/gian tiep va tra 409 khi delete category co dependency.
- Sidebar Admin co Danh muc va San pham theo `catalog.view`; action write chi hien voi `catalog.manage` hoac super-admin.
- `/admin/catalog/categories`: tree active/inactive, create/edit/delete, parent selector loai self va toan bo descendants, field validation, conflict 409 giu nguyen du lieu.
- `/admin/catalog/products`: search/category/type/status tren URL, pagination, create/edit media/price/file/status, soft-delete confirmation. `file_url` chi gui khi write; edit de trong se giu file cu.
- Sau save hien slug backend va link preview `/source-code/{slug}`. UI dung `has_download_file`, khong doc/ky vong backend tra duong dan file noi bo.

## Backend/runtime smoke

- Tao category tam, tao product co thumbnail/demo/file, update title/price, list bang Admin filter: dat.
- Backend sinh slug moi tu title, tra price `125000.00`, `has_download_file=true`, khong tra `file_url`.
- Product soft-delete giu FK/lich su, category lien quan tra 409 khi xoa. Fixture QA da force-delete va don sach sau smoke.
- Backend full suite: 53 tests, 423 assertions pass, gom wallet owner snapshot, category recursive/cycle/delete conflict va product validation 422.

## Frontend verification

- Frontend full suite: 51 test files, 129 tests pass; test moi bao phu Header wallet refresh, Admin Catalog service va category delete conflict.
- TypeScript, ESLint va production build pass; build co `/admin/catalog/categories` va `/admin/catalog/products`.
- Browser computer-use chua co browser kha dung, nen responsive/manual QA van nam trong release gate, khong duoc coi la da nghiem thu bang API smoke.
