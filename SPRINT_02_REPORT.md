# Sprint 02 - Bao cao thuc thi

Ngay hoan thanh: 2026-09-19

## Ket qua

- Catalog khoi phuc `search`, `category_id`, `type`, `page` tu URL va dong bo lai URL khi filter thay doi.
- Search debounce 350ms; Axios huy request cu bang `AbortSignal` khi filter doi nhanh.
- Category tree render de quy voi selected state cho tung cap.
- Pagination co first/last/current neighbors va ellipsis cho tap trang lon.
- Them product detail route `/source-code/[slug]` voi metadata dong, breadcrumb, title, category, type, price va description.
- Them not-found va error boundary rieng cho product detail.
- Product card/list/detail chi dung `/images/demo_product.png`; khong dung `file_url` lam anh.
- Featured Products tren home dung API active products va chung `ProductCard` voi catalog.
- SearchBar tren home dieu huong den catalog bang query backend ho tro; da bo price filter gia khong co API.
- Header desktop/mobile tro den `/source-code` va hien active state dung route.

## Thay doi ky thuat

- Them parser/serializer query type-safe cho catalog.
- Tach `SourceCodeCatalog`, `CategoryTree`, `ProductCard`.
- Them client `getProduct(idOrSlug)` va server public product service cho metadata/SSR.
- Axios timeout 15 giay; server product fetch timeout 10 giay.
- Public catalog request tu hien thi error state, khong tao toast trung lap.

## Kiem thu

- `npm test`: 9 files, 21 tests dat.
- Test query parse/serialize, pagination compaction, service list/detail, 200/404 server response va anh fallback.
- `npm run lint`: 0 errors, 10 warnings anh cu ngoai catalog.
- `npx tsc --noEmit`: dat.
- `npm run build`: dat; `/source-code` va `/source-code/[slug]` duoc server-render on demand.
- Smoke test `/source-code?search=Laravel&category_id=2&type=template&page=3`: HTTP 200.
- Metadata catalog da render dung title va description.
- Backend local tra HTTP 200 cho categories, products va product detail theo slug.
- Da xac minh du lieu that `ma-nguon-pro`; filter `search`, `category_id=1`, `type=source_code` deu tra ket qua dung.
- Frontend `/source-code/ma-nguon-pro` tra HTTP 200, render metadata va noi dung product that; slug khong ton tai tra HTTP 404.
- Response catalog co dung envelope `data`, `links`, `meta`; CORS cho phep frontend truy cap API local.

## Re-audit contract - 2026-09-19

- `Product.price` da doi sang decimal string; public read model co `thumbnail_url`, `demo_url` va khong con `file_url`.
- Category, product list va product detail da parse unified envelope; pagination giu `links` va `meta`.
- Card/detail render thumbnail HTTP/HTTPS that, tu fallback ve `/images/demo_product.png` khi URL thieu, sai protocol hoac tai loi.
- Product detail chi render CTA demo voi URL HTTP/HTTPS va mo tab moi bang `noopener noreferrer`.
- Them test URL media an toan, thumbnail that/fallback va fixture envelope moi.
- Xac minh sau re-audit: 15 files, 34 tests dat; typecheck/build dat; lint 0 errors, 9 warnings anh cu ngoai catalog.

## Gioi han con lai

- Logic checkout tam chuyen `Product.price` sang number tai ranh gioi coupon API; decimal-safe arithmetic thuoc `S03-R01`/`CR-04` va chua duoc xem la hoan tat o Sprint 02.

## Runtime re-audit backend - 2026-09-19

- Backend local `http://127.0.0.1:8000` phan hoi thanh cong cho categories, product list va product detail.
- Public categories/products hien chi tra ban ghi `is_active: true`; product list co du `links` va `meta`.
- Search `PRO`, `category_id=1` va `type=source_code` deu tra dung product `ma-nguon-pro`.
- Detail tra `price` kieu string, khong co `file_url`; `X-Request-ID` duoc echo trong response header.
- Slug khong ton tai tra HTTP 404 voi `success: false`, code `NOT_FOUND` va request ID.
- Frontend `/source-code/ma-nguon-pro` tra HTTP 200, render title/gia that va anh fallback do `thumbnail_url` hien la `null`.
- Frontend khong render CTA demo khi `demo_url` la `null`; slug khong ton tai tra HTTP 404.
