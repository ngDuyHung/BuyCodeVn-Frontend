# BuyCodeVN Backend Contract cho Frontend

> Cập nhật đến Sprint 4 ngày 2026-09-19: backend đã hoàn thành contract/security, customer/admin APIs, lifecycle gia hạn và hosting provisioning manual/automatic với credential owner-scoped.

Tài liệu này tổng hợp từ source code hiện tại của Laravel API để frontend có thể tích hợp mà không cần đọc lại backend.

## Quy ước chung

- Base API mặc định: `/api`
- Version prefix nằm trong từng module: `/v1/...`
- Auth dùng Laravel Sanctum Bearer token: gửi header `Authorization: Bearer {token}`.
- Token mặc định hết hạn sau `10080` phút (7 ngày), cấu hình bằng `SANCTUM_EXPIRATION`.
- Request body dùng JSON, trừ endpoint download file.
- Mọi JSON response dưới `/api/v1` có envelope thống nhất. Endpoint download thành công vẫn là binary stream.
- Response thành công:

```json
{
  "success": true,
  "message": null,
  "data": {}
}
```

- Collection phân trang bổ sung `meta` và `links`.
- Response lỗi:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {}
  },
  "request_id": "uuid"
}
```

- Header `X-Request-ID` có trên JSON response và có thể được gửi từ frontend để đối chiếu log.
- Tiền trong Resource được serialize thành string decimal, ví dụ `"150000.00"`.

## Module Và Prefix

| Module | Prefix | Auth |
| --- | --- | --- |
| Identity | `/api/v1/auth` | Một số public, một số cần token |
| Catalog | `/api/v1/catalog` | GET active public; CRUD cần `catalog.manage`; download cần owner |
| Services | `/api/v1/services` | Hosting plan GET public; hạ tầng cần permission; my-services cần token |
| Orders | `/api/v1/orders` | `check-domain` public, còn lại cần token |
| Finance | `/api/v1/finance` | Cần token |

Module `System` hiện có model `Setting`, được load trong `routes/api.php` nhưng chưa có route riêng.

## Enum Và Status Chung

Server type:

- `mock`
- `cyberpanel`
- `whm`

Product type:

- `source_code`
- `template`
- `script`
- `plugin`
- `other`

Order status:

- `processing`
- `completed`
- `failed`
- Một số migration/comment cũ có nhắc `draft`, `paid`, `cancelled`, nhưng code mua hàng hiện dùng chủ yếu 3 status trên.

User service:

- `pending`
- `active`
- `suspended`
- `expired`
- `failed`
- `terminated`

Payment transaction:

- `pending`
- `completed`
- `failed`
- `cancelled`

Withdrawal:

- `pending`
- `completed`
- `rejected`

Wallet transaction type đang dùng:

- `deposit`
- `payment`
- `refund`
- `withdraw_pending`
- `withdraw`
- `refund_withdraw`

## Identity

Quản lý đăng ký, đăng nhập, profile hiện tại, đổi mật khẩu và đăng xuất. User mới được tạo mặc định `is_active = true`, role `customer`, ví `balance = 0`.

### Resource `User`

```json
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "is_active": true,
  "roles": ["customer"],
  "permissions": [],
  "wallet": {
    "balance": "125000.00",
    "currency": "VND",
    "is_active": true,
    "updated_at": "2026-09-26T10:00:00+00:00"
  },
  "created_at": "2026-09-08T06:16:54+00:00",
  "updated_at": "2026-09-08T06:16:54+00:00"
}
```

`wallet` chỉ được nhúng khi resource đại diện cho chính user đang xác thực (đặc biệt `GET /auth/me`). Header có thể dùng snapshot này để render ngay, sau đó đồng bộ bằng `GET /finance/wallet`. Danh sách user Admin không được dùng field này để đọc ví của user khác.

### `POST /api/v1/auth/register`

Public.

Body:

```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Validation:

- `name`: required, string, max 255
- `email`: required, email, max 255, unique `users`
- `password`: required, string, min 8, confirmed

Response `201`: envelope với `data` là `UserResource`.

### `POST /api/v1/auth/login`

Public.

Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": null,
  "data": {
    "user": {},
    "token": "1|plain-text-token",
    "token_type": "Bearer",
    "expires_in": 604800
  }
}
```

Rule: tài khoản phải tồn tại, password đúng, `is_active = true`.

### `GET /api/v1/auth/me`

Cần token. Response: `UserResource`.

### `POST /api/v1/auth/change-password`

Cần token.

Body:

```json
{
  "current_password": "password123",
  "new_password": "newpassword123",
  "new_password_confirmation": "newpassword123"
}
```

Validation:

- `current_password`: required, phải đúng password hiện tại
- `new_password`: required, string, min 8, confirmed, different current password

Response:

```json
{
  "message": "Đổi mật khẩu thành công."
}
```

Rule: đổi xong xóa các token khác, giữ token hiện tại.

### `POST /api/v1/auth/logout`

Cần token. Xóa token hiện tại.

Response:

```json
{
  "message": "Đăng xuất thành công."
}
```

### Admin User API

Tất cả endpoint cần Bearer token và permission ghi ở cột tương ứng.

| Method | Endpoint | Permission | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/users` | `users.view` | Filter `search`, `is_active`, `role`, `per_page` |
| POST | `/api/v1/admin/users` | `users.create` | Tạo user, wallet số dư 0 và gán role `customer` |
| GET | `/api/v1/admin/users/{user}` | `users.view` | Chi tiết role/permission |
| PATCH | `/api/v1/admin/users/{user}` | `users.update` | Chỉ cập nhật `name`, `email` |
| PATCH | `/api/v1/admin/users/{user}/status` | `users.update` | Body `{ "is_active": false }` |
| PUT | `/api/v1/admin/users/{user}/roles` | `roles.manage` | Body `{ "roles": ["cskh"] }` |
| DELETE | `/api/v1/admin/users/{user}` | `users.delete` | Soft delete |
| GET | `/api/v1/admin/users/{user}/wallet-transactions` | `finance.view` hoặc `wallets.manage` | Lịch sử ví; filter `type`, `date_from`, `date_to`, `per_page` |
| POST | `/api/v1/admin/users/{user}/wallet-adjustments` | `wallets.manage` | Cộng/trừ số dư có audit và idempotency |

Body điều chỉnh ví:

```json
{
  "direction": "credit",
  "amount": "100000.00",
  "note": "Bù số dư theo phiếu hỗ trợ",
  "idempotency_key": "f4ad579d-2fff-4f6f-9757-547fce61f099"
}
```

- `direction`: `credit` hoặc `debit`; `amount` phải lớn hơn `0`; `note` bắt buộc, tối đa 255 ký tự; `idempotency_key` bắt buộc là UUID.
- Mỗi key chỉ có hiệu lực trong một ví. Gửi lại cùng key trả giao dịch đã tạo với `idempotent=true`, không đổi số dư và không ghi audit lần hai.
- Backend lock row ví trong transaction; lệnh trừ khiến số dư âm hoặc ví đang khóa trả `409`.
- Lịch sử trả `wallet` và user summary trong `meta`; transaction có `balance_before`, `balance_after`, `reference`, `description` và `created_at`.
- Hai loại giao dịch mới là `admin_credit` và `admin_debit`. Mọi điều chỉnh thành công ghi activity action `wallet.admin_adjusted`.

Rule bảo mật:

- Admin/operator không được vô hiệu hóa, xóa hoặc đổi role của chính mình qua các endpoint này.
- Không được vô hiệu hóa, xóa hoặc gỡ role của admin đang hoạt động cuối cùng; backend trả `409 CONFLICT`.
- Vô hiệu hóa, xóa hoặc đổi role sẽ revoke toàn bộ token của target user.
- Tạo user yêu cầu `name`, email unique, `password` tối thiểu 8 ký tự và `password_confirmation`.

### Admin Role Và Permission API

Tất cả endpoint cần `roles.manage`.

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| GET | `/api/v1/admin/permissions` | Danh sách permission theo tên |
| GET/POST | `/api/v1/admin/roles` | List hoặc tạo custom role |
| GET | `/api/v1/admin/roles/{role}` | Chi tiết role và permissions |
| PUT/PATCH | `/api/v1/admin/roles/{role}` | Đổi tên custom role và/hoặc sync permissions |
| DELETE | `/api/v1/admin/roles/{role}` | Chỉ xóa custom role chưa được gán |

Tên role chỉ nhận chữ thường, số, `.`, `_`, `-`. Các system role `admin`, `customer`, `cskh`, `marketing`, `technical` không được đổi tên hoặc xóa. Role đang được gán cho user cũng không thể xóa (`409`).

## Catalog

Quản lý category dạng cây và sản phẩm số. GET active public để hiển thị storefront; CRUD cần `catalog.manage`.

### Resource `Category`

```json
{
  "id": 1,
  "parent_id": null,
  "name": "Source Code",
  "slug": "source-code",
  "is_active": true,
  "children": [],
  "created_at": "2026-09-08T06:16:54+00:00",
  "updated_at": "2026-09-08T06:16:54+00:00"
}
```

### Resource `Product`

```json
{
  "id": 1,
  "category_id": 1,
  "type": "source_code",
  "title": "Laravel Shop",
  "slug": "laravel-shop",
  "description": "Mô tả",
  "thumbnail_url": "https://cdn.example.com/laravel-shop.jpg",
  "demo_url": "https://demo.example.com/laravel-shop",
  "price": "150000.00",
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00",
  "updated_at": "2026-09-08T06:16:54+00:00",
  "category": {}
}
```

### Category API

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/catalog/categories` | Public | Trả category tree active |
| GET | `/api/v1/catalog/categories/{category}` | Public | Route model binding theo id |
| GET | `/api/v1/admin/catalog/categories` | `catalog.view` | Lấy cả active/inactive cho admin |
| POST | `/api/v1/catalog/categories` | `catalog.manage` | Tạo category |
| PUT | `/api/v1/catalog/categories/{category}` | `catalog.manage` | Cập nhật |
| DELETE | `/api/v1/catalog/categories/{category}` | `catalog.manage` | Xóa nếu không có child/product |

Create body:

```json
{
  "name": "Template",
  "slug": "template",
  "parent_id": null,
  "is_active": true
}
```

Validation:

- `name`: required, string, max 255
- `slug`: nullable, string, max 255, unique `categories.slug`
- `parent_id`: nullable, exists `categories.id`
- `is_active`: nullable boolean

Rule:

- Nếu không gửi `slug`, backend tự sinh từ `name`.
- Nếu không gửi `is_active`, mặc định `true`.
- Không xóa category nếu còn category con hoặc product.
- Admin category tree trả đủ các tầng con. Update parent bị từ chối `409` nếu tạo vòng trực tiếp hoặc gián tiếp; delete có dependency trả `409`.

### Product API

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/catalog/products` | Public | Có phân trang/filter |
| GET | `/api/v1/catalog/products/{product}` | Public | `{product}` có thể là id hoặc slug |
| GET | `/api/v1/admin/catalog/products` | `catalog.view` | List quản trị, cho phép filter inactive |
| POST | `/api/v1/catalog/products` | `catalog.manage` | Tạo product |
| PUT | `/api/v1/catalog/products/{product}` | `catalog.manage` | `{product}` có thể là id hoặc slug |
| DELETE | `/api/v1/catalog/products/{product}` | `catalog.manage` | Soft delete |
| GET | `/api/v1/catalog/products/{id}/download` | Token | Stream file, user phải đã mua |

Query list:

- `per_page`: default 15
- `search`: tìm theo title
- `category_id`
- `type`: một trong Product type enum
- `is_active`: boolean, chỉ áp dụng ở list quản trị; public luôn chỉ trả product/category active

Create body:

```json
{
  "category_id": 1,
  "type": "source_code",
  "title": "Laravel Shop",
  "description": "Mô tả",
  "thumbnail_url": "https://cdn.example.com/laravel-shop.jpg",
  "demo_url": "https://demo.example.com/laravel-shop",
  "price": 150000,
  "file_url": "products/laravel-shop.zip",
  "is_active": true
}
```

Validation:

- `category_id`: required, integer, exists `categories.id`
- `type`: required, in `source_code`, `template`, `script`, `plugin`, `other`
- `title`: required, string, max 255
- `description`: nullable string
- `thumbnail_url`: nullable, URL HTTP/HTTPS, max 2048
- `demo_url`: nullable, URL HTTP/HTTPS, max 2048
- `price`: required, numeric, min 0
- `file_url`: nullable, string, max 255
- `is_active`: nullable boolean

Rule:

- Backend tự sinh slug từ `title`; nếu trùng sẽ thêm hậu tố unique.
- `file_url` chỉ là dữ liệu nội bộ để download và không được trả trong Product Resource public/admin.
- Download chỉ thành công khi có order `completed` của chính user với `item_type = product`.
- Download lỗi có thể trả `403`, `404` hoặc `400`.

## Services

Quản lý server, hosting plan, dịch vụ của user và bảng giá TLD. Server/TLD cần permission quản trị; hosting plan storefront là public.

### Resource `Server`

```json
{
  "id": 1,
  "name": "WHM 01",
  "slug": "whm-01",
  "ip_address": "whm.example.com",
  "type": "whm",
  "provisioning_mode": "automatic",
  "login_url": "https://panel.example.com:2083",
  "api_username": "reseller-user",
  "api_auth_type": "token",
  "api_port": 2087,
  "verify_tls": true,
  "connect_timeout": 10,
  "request_timeout": 30,
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00",
  "has_api_token": true
}
```

`api_token` không bao giờ được trả qua Resource.

### Server API

| Method | Endpoint |
| --- | --- |
| GET | `/api/v1/services/servers` |
| GET | `/api/v1/services/servers/{id}` |
| POST | `/api/v1/services/servers` |
| PUT | `/api/v1/services/servers/{id}` |
| DELETE | `/api/v1/services/servers/{id}` |
| POST | `/api/v1/services/servers/{id}/test-connection` |
| GET | `/api/v1/services/servers/{id}/provider-plans` |
| GET | `/api/v1/services/servers/{id}/provider-capabilities` |
| POST | `/api/v1/services/servers/{id}/provider-plans` |
| PUT/PATCH | `/api/v1/services/servers/{id}/provider-plans/{package}` |
| DELETE | `/api/v1/services/servers/{id}/provider-plans/{package}` |

Query list:

- `per_page`, `search`, `type`, `is_active`

Create body:

```json
{
  "name": "WHM 01",
  "ip_address": "whm.example.com",
  "type": "whm",
  "provisioning_mode": "automatic",
  "login_url": "https://panel.example.com:2083",
  "api_username": "reseller-user",
  "api_auth_type": "token",
  "api_token": "secret",
  "api_port": 2087,
  "verify_tls": true,
  "connect_timeout": 10,
  "request_timeout": 30,
  "is_active": true
}
```

Validation:

- `name`: required, string, max 255
- `ip_address`: required, IPv4/IPv6 hoac hostname hop le, max 253
- `type`: required, in `mock`, `cyberpanel`, `whm`
- `provisioning_mode`: nullable, in `automatic`, `manual`; mặc định `automatic`
- `login_url`: nullable, HTTP/HTTPS URL, max 2048; automatic sẽ fallback theo server IP/port nếu bỏ trống
- `api_token`: nullable, string, max 4096; write-only, de trong khi update de giu secret hien tai
- `api_username`: nullable, string, max 100; mac dinh `root`
- `api_auth_type`: nullable, in `token`, `password`; mac dinh `token`
- `api_port`: nullable, integer, 1-65535; mac dinh `2087`
- `verify_tls`: nullable boolean; mac dinh `true`
- `connect_timeout`, `request_timeout`: nullable integer timeout theo giay
- `is_active`: nullable boolean

Rule: không xóa server nếu còn hosting plan thuộc server đó.

### Resource `HostingPlan`

```json
{
  "id": 1,
  "server_id": 1,
  "name": "Basic",
  "whm_package_name": "basic",
  "disk_quota": 1024,
  "bandwidth_limit_mb": 10240,
  "memory_limit_mb": 1024,
  "max_ftp_accounts": 5,
  "max_email_accounts": 10,
  "max_databases": 10,
  "max_subdomains": 5,
  "max_parked_domains": 2,
  "max_addon_domains": 2,
  "custom_features": {
    "backup": "Hang ngay",
    "support": "24/7"
  },
  "price_per_month": "50000.00",
  "is_active": true,
  "provider_available": true,
  "provider_synced_at": "2026-09-26T10:00:00+00:00",
  "created_at": "2026-09-08T06:16:54+00:00",
  "server": {}
}
```

`provider_available` va `provider_synced_at` chi thuoc Admin resource. `provider_available=false` cho biet package khong con tren WHM; cron se tat plan local nhung khong ghi de `price_per_month` hoac cac gioi han tai nguyen local ma admin da cau hinh.

Public HostingPlan, order item hosting va snapshot my-service cung tra cac field tai nguyen tu `disk_quota` den `custom_features`, nhung khong tra provider raw data, extension hay custom provider options.

### Quan ly package truc tiep tren WHM

Ba endpoint mutation provider can `services.manage` va chi ho tro server `whm`. Package tao boi reseller co the duoc WHM them prefix; response va local plan luon dung ten canonical WHM tra ve.

`GET /api/v1/services/servers/{id}/provider-capabilities` doc quyen reseller tu WHM `myprivs` va han muc account tu `acctcounts`:

```json
{
  "provider": "whm",
  "username": "reseller-user",
  "account_limit": { "used": 0, "maximum": null, "remaining": null, "is_unlimited": true },
  "permissions": {
    "unlimited_features": true,
    "unlimited_disk": false,
    "unlimited_bandwidth": false,
    "custom_email_limits": true,
    "addon_domains": true,
    "parked_domains": true
  },
  "field_limits": {
    "disk_quota": { "maximum": null, "allow_unlimited": false },
    "max_ftp_accounts": { "maximum": null, "allow_unlimited": true }
  },
  "warnings": ["WHM khong cung cap tran MB huu han cua reseller qua quyen API hien tai."],
  "source": ["myprivs", "acctcounts"]
}
```

`maximum=null` khong dong nghia voi duoc phep unlimited. Frontend phai doc `allow_unlimited`: `true` cho phep gui `0`, `false` khoa lua chon, `null` la WHM khong cong bo quyen va se kiem tra luc luu.

Create body:

```json
{
  "name": "starter",
  "disk_quota": 2048,
  "bandwidth_limit_mb": 20480,
  "memory_limit_mb": 1024,
  "max_ftp_accounts": 5,
  "max_email_accounts": 10,
  "max_databases": 10,
  "max_subdomains": 5,
  "max_parked_domains": 2,
  "max_addon_domains": 2,
  "custom_features": { "backup": "Hang ngay" },
  "package_extensions": ["cloudlinux"],
  "provider_options": { "LVEPMEM": "1024M" }
}
```

`disk_quota` va `bandwidth_limit_mb` la bat buoc khi tao; `0` nghia la unlimited theo WHM va chi hop le khi capability tuong ung cho phep. Cac gioi han con lai mac dinh `0`. `memory_limit_mb` va `custom_features` la thong so local/storefront. WHM chuan khong co RAM package field; de enforce RAM tren CloudLinux/LVE, can dung dung `package_extensions` va key trong `provider_options` ma extension tren server cong bo.

`provider_options` toi da 25 key va khong duoc ghi de `name`, `quota`, `bwlimit`, cac `max*`, `_PACKAGE_EXTENSIONS` hoac `api.version`. Frontend khong tu suy dien extension key. Update khong cho doi ten package; muon doi ten can tao package moi, chuyen account theo quy trinh rieng roi xoa package cu.

Delete body bat buoc xac nhan:

```json
{ "confirm_name": "napvipvn_starter" }
```

Sau khi xoa tren WHM, backend giu local plan de bao toan gia va lich su, dat `provider_available=false`, `is_active=false`. Frontend phai canh bao day la thao tac provider va gui chinh ten canonical.

### Public Hosting Plan API

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/services/server-categories` | Public | Danh mục storefront từ server active có ít nhất một plan active |
| GET | `/api/v1/services/hosting-plans` | Public | Chỉ plan active thuộc server active |
| GET | `/api/v1/services/hosting-plans/{id}` | Public | Không trả server ID, IP, token hoặc package nội bộ |

Public resource chỉ có `id`, `name`, `disk_quota`, `price_per_month`.

`GET /api/v1/services/hosting-plans` hỗ trợ query:

- `server_category`: ID hoặc slug trả về từ endpoint `server-categories`
- `search`: tìm theo tên plan
- `per_page`: 1-100, mặc định 15

Ví dụ: `GET /api/v1/services/hosting-plans?server_category=vietnam-premium`.

### Public Server Category Resource

```json
{
  "id": 1,
  "slug": "vietnam-premium",
  "name": "Vietnam Premium"
}
```

Resource public này chỉ có `id`, `slug`, `name`. Đây là projection storefront; không trả `ip_address`, `api_token`, `has_api_token`, `type` hay package nội bộ. Category không có plan active hoặc server đã inactive sẽ không xuất hiện.

### Admin Hosting Plan API

Prefix `/api/v1/admin/services/hosting-plans`, cần `services.manage`. Hỗ trợ GET list/detail, POST, PUT/PATCH và DELETE. Route ghi cũ dưới `/api/v1/services/hosting-plans` vẫn được giữ tạm để tương thích và cũng yêu cầu `services.manage`.

Query list:

- `per_page`, `search`, `server_id`, `is_active`

Create body:

```json
{
  "server_id": 1,
  "name": "Basic",
  "whm_package_name": "basic",
  "disk_quota": 1024,
  "bandwidth_limit_mb": 10240,
  "memory_limit_mb": 1024,
  "max_ftp_accounts": 5,
  "max_email_accounts": 10,
  "max_databases": 10,
  "max_subdomains": 5,
  "max_parked_domains": 2,
  "max_addon_domains": 2,
  "custom_features": { "backup": "Hang ngay" },
  "price_per_month": 50000,
  "is_active": true
}
```

Validation:

- `server_id`: required, integer, exists `servers.id`
- `name`: required, string, max 255
- `whm_package_name`: required, string, max 100
- `disk_quota`: required, integer, min 0
- `bandwidth_limit_mb`, `memory_limit_mb` va cac field `max_*`: nullable/sometimes integer, min 0
- `custom_features`: nullable object, toi da 25 key, moi value toi da 255 ky tu
- `price_per_month`: required, numeric, min 0
- `is_active`: nullable boolean

Voi server WHM automatic, frontend nen goi `provider-plans`, cho admin chon package provider va co the dung quota tra ve lam gia tri goi y. Gia ban va cac gioi han tai nguyen cua hosting plan la cau hinh local doc lap, co the cao hon package WHM; `0` nghia la unlimited. Cron chi dung tai nguyen provider khi import plan moi, khong ghi de local override cua plan da ton tai.

### Dịch vụ của user

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/services/my-services` | Token | Filter `service_type`, `status`, `expiring_before`, `per_page` |
| GET | `/api/v1/services/my-services/{service}` | Token/Owner | ID của user khác trả `404` |
| GET | `/api/v1/services/my-services/{service}/credentials` | Token/Owner | Hosting/VPS active; response không được cache |
| POST | `/api/v1/services/my-services/{service}/login-session` | Token/Owner | Tao cPanel SSO URL ngan han; response `no-store` |

Resource trả thông tin hosting/domain/VPS, order liên quan, `provisioning_mode`, `provisioned_at`, `pending_renewal` và các action. `actions.can_view_credentials=true` khi hosting hoặc VPS active đã có đủ credential. Không trả password trong list/detail, `password_encrypted`, server, API token hoặc contact config.

Credential response:

```json
{
  "success": true,
  "message": null,
  "data": {
    "service_id": 10,
    "domain": "example.com",
    "login_url": "https://panel.example.com:2083",
    "username": "exampleuser",
    "password": "plain-text-password"
  }
}
```

Với VPS, response credential có thêm `service_type=vps`, `ip_address` và `login_url=null`. Frontend chỉ gọi endpoint này khi người dùng chủ động mở thông tin đăng nhập; không lưu password vào localStorage, analytics hoặc log. Dịch vụ chưa active/chưa đủ credential trả `409`; service của user khác trả `404`.

### Admin User Service API

| Method | Endpoint | Permission | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/services` | `services.view` | Filter `search`, `user_id`, `service_type`, `status`, `expiring_before`, `per_page` |
| GET | `/api/v1/admin/services/{service}` | `services.view` | Chi tiết user, plan/TLD, order và registration config an toàn |
| POST | `/api/v1/admin/services/{service}/approve-domain` | `domains.approve` | Command duyệt domain thủ công |
| POST | `/api/v1/admin/services/{service}/activate-hosting` | `services.manage` | Kích hoạt hosting manual đang pending |

Body kích hoạt hosting manual:

```json
{
  "username": "exampleuser",
  "password": "strong-password",
  "login_url": "https://panel.example.com:2083"
}
```

Command chỉ nhận hosting có `provisioning_mode=manual` và `status=pending`. Khi thành công, backend chuyển service sang `active`, order sang `completed`, tính hạn từ thời điểm kích hoạt, lưu người/thời điểm xử lý và audit không chứa credential. Gọi lại trả `idempotent=true`.

`search` tìm theo domain, tên hoặc email user. Status nhận `pending`, `active`, `suspended`, `expired`, `failed`, `terminated`; `status=pending` gồm hosting manual, đăng ký domain mới và renewal manual đang chờ. Resource không trả `password_encrypted`, password/token/secret/file URL trong config. Dùng `actions.can_activate_hosting` và `actions.can_approve_domain` để hiển thị đúng command.

### VPS Public Catalog

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/services/vps-plans` | Public | Chỉ plan active và giá bán |
| GET | `/api/v1/services/vps-plans/{id}` | Public | Plan inactive trả `404` |
| GET | `/api/v1/services/vps-os-images` | Public | Chỉ OS active |

Resource plan public:

```json
{
  "id": 1,
  "slug": "kvm-2gb-a1b2c3d4",
  "name": "KVM 2GB",
  "group_name": "KVM Vietnam",
  "cpu": 2,
  "ram_mb": 2048,
  "disk_gb": 40,
  "bandwidth": "Unlimited",
  "ip_description": "1 IPv4",
  "pricing": {
    "1_month": { "amount": 90000 }
  },
  "locations": [
    {
      "id": 2,
      "slug": "ho-chi-minh-a1b2c3d4",
      "code": "HCM",
      "name": "Ho Chi Minh",
      "surcharge": "10000.00"
    }
  ]
}
```

Resource OS chỉ có `id`, `name`, `icon_url`. Location dùng ID nội bộ và giá phụ thu bán do admin cấu hình; không dùng provider location ID. Các resource public không trả `provider_product_id`, `provider_os_id`, `provider_location_id`, giá vốn, raw payload, IP node, JWT hoặc provider secret.

### Mua và quản lý VPS

`POST /api/v1/orders/buy-vps`

```json
{
  "vps_plan_id": 1,
  "os_image_id": 3,
  "billing_cycle": "1_month",
  "hostname": "web-01",
  "location_id": 2,
  "idempotency_key": "1cf54b6a-82cb-4e35-98dd-427752f666da"
}
```

`location_id` là ID nội bộ lấy từ `plan.locations`, không phải ID XVPS; giá thanh toán bằng giá cycle cộng `location.surcharge`. `idempotency_key` là UUID bắt buộc. Gửi lại cùng key trả cùng `order_id/service_id/instance_id`, không trừ ví và không tạo VPS lần hai. Backend không nhận root password khi mua; XVPS tự sinh password và backend lấy sau qua sync.

Response `201`:

```json
{
  "success": true,
  "message": "Đơn VPS đã được tiếp nhận.",
  "data": {
    "order_id": 100,
    "service_id": 55,
    "instance_id": 8,
    "status": "active",
    "hostname": "web-01",
    "idempotent": false
  }
}
```

Trong lúc provider đang tạo máy, `status` có thể là `creating`, `installing` hoặc `reconciling`. Backend có scheduler `vps:reconcile` mỗi 5 phút; frontend vẫn có thể gọi `POST /api/v1/services/my-services/{service}/vps-sync` khi người dùng bấm làm mới, nhưng không poll dày và không tự gửi lại lệnh mua bằng UUID mới.

Khối VPS trong my-service:

```json
{
  "vps": {
    "instance_id": 8,
    "hostname": "web-01",
    "ip_address": "203.0.113.10",
    "provisioning_status": "active",
    "power_status": "running",
    "os_name": "Ubuntu 24.04",
    "last_synced_at": "2026-09-21T10:00:00+07:00"
  },
  "actions": {
    "can_renew": true,
    "can_view_credentials": true,
    "can_manage_vps": true
  }
}
```

Lifecycle client, tất cả cần token và owner:

| Method | Endpoint | Body |
| --- | --- | --- |
| POST | `/api/v1/services/my-services/{service}/vps-actions` | `{ "action": "start|stop|restart|poweroff" }` |
| POST | `/api/v1/services/my-services/{service}/rebuild` | `{ "os_image_id": 3, "new_password": "optional" }` |
| POST | `/api/v1/services/my-services/{service}/vps-password` | `{ "new_password": "..." }` |
| POST | `/api/v1/services/my-services/{service}/vps-hostname` | `{ "hostname": "web-02" }` |
| POST | `/api/v1/services/my-services/{service}/vps-sync` | Không có body |
| POST | `/api/v1/orders/vps/{service}/renew` | `{ "billing_cycle": "1_month", "idempotency_key": "UUID" }` |

Password dài 10–64 ký tự, không có khoảng trắng và phải đạt ít nhất hai trong ba nhóm chữ thường/chữ hoa/chữ số. Rebuild là thao tác phá hủy dữ liệu; UI phải yêu cầu xác nhận rõ ràng. State transition không hợp lệ trả `409`, cross-owner trả `404`, validation trả `422`.

Gia hạn luôn tạo order và wallet transaction local, đồng thời truyền UUID thành `Idempotency-Key` cho XVPS. Nếu provider timeout/không rõ kết quả, backend trả `409`, giữ operation ở `reconciling` và scheduler retry bằng đúng UUID; UI hiển thị “đang đối soát” và không phát sinh UUID mới. Nhóm lỗi chắc chắn được hoàn ví đúng một lần.

### VPS Admin API

| Method | Endpoint | Permission | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/vps/provider-config` | `services.view` | Masked credential và trạng thái cấu hình |
| PUT | `/api/v1/admin/vps/provider-config` | `services.manage` | Tạo/cập nhật cấu hình XVPS động |
| POST | `/api/v1/admin/vps/sync-catalog` | `services.manage` | Đồng bộ plan/OS; plan mới mặc định inactive |
| GET | `/api/v1/admin/vps/plans` | `services.view` | Có provider mapping và giá vốn |
| PUT | `/api/v1/admin/vps/plans/{plan}` | `services.manage` | Cập nhật `name`, `sale_pricing`, `is_active` |
| GET | `/api/v1/admin/vps/locations` | `services.view` | Location, provider surcharge và giá phụ thu bán |
| PUT | `/api/v1/admin/vps/locations/{location}` | `services.manage` | Cập nhật `name`, `sale_surcharge`, `is_active` |
| GET | `/api/v1/admin/vps/instances` | `services.view` | Filter `status`, `user_id`, `search`, `per_page` |
| GET | `/api/v1/admin/vps/instances/{instance}` | `services.view` | Chi tiết và operation history, không có credential |
| POST | `/api/v1/admin/vps/instances/{instance}/sync` | `services.manage` | Đồng bộ từ provider |
| POST | `/api/v1/admin/vps/instances/{instance}/retry-provision` | `services.manage` | Chỉ retry create bằng idempotency key cũ |
| GET | `/api/v1/admin/vps/provider-health` | `services.view` | Balance/scope/thống kê allowlist |

Trước khi bật plan, admin phải cấu hình `sale_pricing` theo key cycle mà provider trả về. Location mới sync về mặc định inactive và chưa có `sale_surcharge`; admin phải cấu hình phụ thu bán rồi bật location. Không sao chép trực tiếp `provider_pricing/provider_surcharge` ra storefront. Endpoint admin instance trả `provider_instance_id/order_code/error` phục vụ đối soát nhưng không trả root password, JWT, API secret hay raw provider payload.

Body cấu hình provider:

```json
{
  "environment": "sandbox",
  "base_url": "https://api-sandbox.xvps.vn",
  "api_username": "...",
  "api_app": "...",
  "api_secret": "...",
  "max_retries": 2,
  "timeout_seconds": 30,
  "is_active": true
}
```

Lần cấu hình đầu bắt buộc đủ ba credential. Những lần cập nhật sau có thể bỏ `api_username`, `api_app`, `api_secret` để giữ nguyên giá trị cũ. `environment=sandbox` chỉ nhận `https://api-sandbox.xvps.vn`; `production` chỉ nhận `https://api.xvps.vn`. Response chỉ có `api_username_masked`, `api_app_masked`, `has_api_secret`; frontend không được kỳ vọng backend trả lại secret. Sau khi lưu, token cache cũ bị xóa và request tiếp theo tự lấy JWT mới.

### Resource `TldPricing`

```json
{
  "id": 1,
  "tld": ".com",
  "register_price": "250000.00",
  "renew_price": "280000.00",
  "transfer_price": "250000.00",
  "is_auto_register": true,
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00"
}
```

### TLD Pricing API

| Method | Endpoint |
| --- | --- |
| GET | `/api/v1/services/tld-pricing` |
| GET | `/api/v1/services/tld-pricing/{id}` |
| POST | `/api/v1/services/tld-pricing` |
| PUT | `/api/v1/services/tld-pricing/{id}` |
| DELETE | `/api/v1/services/tld-pricing/{id}` |

Query list:

- `per_page`, `search`, `is_active`, `is_auto_register`

Create body:

```json
{
  "tld": ".com",
  "register_price": 250000,
  "renew_price": 280000,
  "transfer_price": 250000,
  "is_auto_register": true,
  "is_active": true
}
```

Validation:

- `tld`: required, string, max 20, unique `tld_pricing.tld`
- `register_price`, `renew_price`, `transfer_price`: required, numeric, min 0
- `is_auto_register`, `is_active`: nullable boolean

Rule: nếu gửi `tld` không có dấu chấm đầu, backend tự thêm, ví dụ `com` thành `.com`.

## Orders

Xử lý mua product, hosting, domain, coupon và quản lý hosting cá nhân. Các luồng trừ tiền đều lock ví bằng `lockForUpdate()`.

### Đơn hàng của user

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/orders` | Token | Filter `status`, `item_type`, `date_from`, `date_to`, `per_page` |
| GET | `/api/v1/orders/{order}` | Token/Owner | ID của user khác trả `404` |

- `status`: `processing`, `completed`, `failed`.
- `item_type`: `product`, `hosting`, `domain`; dùng `item_type=product&status=completed` cho trang sản phẩm đã mua.
- Order item trả snapshot an toàn của product/hosting/TLD và service liên quan.
- Không trả `file_url`, `order_items.config` hoặc contact info; tải product qua endpoint download.

### Đơn hàng cho admin

| Method | Endpoint | Permission | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/orders` | `orders.view` | List đối soát và queue vận hành |
| GET | `/api/v1/admin/orders/{order}` | `orders.view` | Chi tiết user, coupon, items và service liên quan |

Query list: `search` (tên/email), `user_id`, `status`, `item_type`, `date_from`, `date_to`, `min_amount`, `max_amount`, `per_page` (1–100). List không load items; gọi detail khi cần. Detail trả `order_items.config` đã loại `password`, `password_encrypted`, `api_token`, `token`, `secret`, `file_url`.

Không có endpoint PATCH status tổng quát. Frontend phải gọi command nghiệp vụ cụ thể để tránh chuyển trạng thái tùy ý.

### Mua Product

`POST /api/v1/orders/buy-product`

Cần token.

Body:

```json
{
  "product_id": 1,
  "coupon_code": "SALE10"
}
```

Validation:

- `product_id`: required, integer, product tồn tại và `is_active = 1`
- `coupon_code`: nullable, string, max 50

Response:

```json
{
  "success": true,
  "message": "Thanh toán thành công. Bạn có thể tải mã nguồn ngay bây giờ.",
  "data": {
    "order_id": 10
  }
}
```

Rule:

- Không cho mua lại product đã có order `completed`.
- Áp coupon nếu có, lưu `total_amount`, `discount_amount`, `final_amount`.
- Nếu `final_amount = 0`, không ghi log trừ tiền ví.

### Mua Hosting

`POST /api/v1/orders/buy-hosting`

Cần token.

Body:

```json
{
  "hosting_plan_id": 1,
  "domain": "example.com",
  "months": 12,
  "coupon_code": "SALE10"
}
```

Validation:

- `hosting_plan_id`: required, integer, exists `hosting_plans.id`
- `domain`: required, domain regex
- `months`: required, integer, in `1,3,6,12,24,36`
- `coupon_code`: nullable, string, max 50

Response `201`:

```json
{
  "success": true,
  "message": "Tạo hosting thành công.",
  "data": {
    "status": "success",
    "order_id": 20,
    "service_id": 10,
    "domain": "example.com"
  }
}
```

Rule:

- Hosting plan và server phải active.
- `provisioning_mode=automatic`: backend tạo username/password, gọi adapter; thành công thì order `completed`, service `active`, response có `status=success`.
- `provisioning_mode=manual`: order giữ `processing`, service giữ `pending`, chưa có credential/hạn dùng; response có `status=pending_manual`. Admin phải gọi command `activate-hosting`.
- Nếu API server lỗi, hoàn đúng `final_amount`, order/service chuyển `failed`.

### Đổi Mật Khẩu Hosting

`POST /api/v1/orders/hosting/{id}/change-password`

Cần token. `{id}` là `user_services.id` của hosting thuộc user hiện tại.

Body:

```json
{
  "new_password": "newStrongPassword"
}
```

Validation:

- `new_password`: nullable, string, min 8, max 50

Response:

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công.",
  "data": {
    "new_password": "newStrongPassword"
  }
}
```

Rule:

- Chỉ đổi khi service thuộc user, `service_type = hosting`, `status = active`, `provisioning_mode = automatic`.
- Hosting manual cần liên hệ kỹ thuật viên; `actions.can_change_password=false`.
- Nếu không gửi `new_password`, backend random password.
- Password clear-text chỉ trả một lần trong response này; DB lưu `encrypt()`.

### Gia Hạn Hosting

`POST /api/v1/orders/hosting/{id}/renew`

Cần token.

Body:

```json
{
  "months": 12,
  "idempotency_key": "hosting-renew-2026-001"
}
```

Validation:

- `months`: required, integer, in `1,3,6,12,24,36`
- `idempotency_key`: optional, tối đa 100 ký tự; chỉ gồm chữ, số, `.`, `_`, `:`, `-`

Response:

```json
{
  "success": true,
  "message": "Gia hạn thành công thêm 12 tháng.",
  "data": {
    "order_id": 20,
    "expires_at": "2027-09-14T10:00:00+00:00",
    "idempotent": false
  }
}
```

Rule:

- Trừ tiền theo `price_per_month * months`.
- Mỗi lần thu tiền tạo order/order item và wallet transaction reference tới order để đối soát.
- Gửi lại cùng `idempotency_key` trả order cũ, `idempotent=true` và không trừ tiền lần nữa.
- Nếu chưa hết hạn, cộng tháng vào ngày hết hạn cũ.
- Nếu đã hết hạn, tính từ hiện tại.
- Nếu trước đó `suspended` hoặc `expired`, backend cố gọi `unsuspendAccount`; lỗi unsuspend không rollback tiền/DB.

### Check Domain

`POST /api/v1/orders/check-domain`

Public.

Body:

```json
{
  "domain": "example.com"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "is_available": true,
    "register_price": "250000.00",
    "renew_price": "280000.00",
    "message": "Tên miền còn trống, có thể đăng ký!"
  }
}
```

Rule:

- Backend tách TLD bằng phần sau dấu chấm đầu tiên, ví dụ `example.com` -> `.com`, `test.edu.vn` -> `.edu.vn`.
- TLD phải có trong `tld_pricing` và `is_active = 1`.
- Nếu `is_auto_register = true`, dùng TenTen adapter; nếu false, manual adapter luôn trả available true.

### Mua Domain

`POST /api/v1/orders/buy-domain`

Cần token.

Body:

```json
{
  "domain": "example.com",
  "years": 1,
  "contact_info": {
    "name": "Nguyen Van A",
    "email": "owner@example.com",
    "phone": "0900000000",
    "cccd": "012345678901"
  },
  "coupon_code": "SALE10"
}
```

Validation:

- `domain`: required, domain regex
- `years`: required, integer, min 1, max 10
- `contact_info`: required array
- `contact_info.name`: required, string, max 255
- `contact_info.email`: required, email
- `contact_info.phone`: required, string, max 20
- `contact_info.cccd`: nullable, string, max 20
- `coupon_code`: nullable, string, max 50

Response `201`:

```json
{
  "success": true,
  "message": "Đơn hàng đã được tiếp nhận...",
  "data": {
    "domain": "example.com",
    "status": "success"
  }
}
```

`data.status` có thể là:

- `success`: đăng ký tự động thành công, service `active`
- `pending_manual`: đã trừ tiền, chờ admin xử lý, service vẫn `pending`

Rule:

- Giá = `register_price * years`.
- `contact_info` được lưu JSON trong `order_items.config`.
- Nếu TenTen/API lỗi, backend hoàn tiền theo `final_amount`, order/service `failed`.
- Với manual domain, tiền vẫn bị trừ nhưng chờ duyệt thủ công.

### Gia Hạn Domain

`POST /api/v1/orders/domain/{service}/renew`

Cần token; `{service}` phải là domain service thuộc user hiện tại. Service của user khác hoặc sai loại trả `404`.

Body:

```json
{
  "years": 2,
  "idempotency_key": "domain-renew-2026-001"
}
```

- `years`: required, integer, từ 1 đến 10.
- `idempotency_key`: optional, tối đa 100 ký tự; khuyến nghị frontend luôn sinh một key ổn định cho mỗi thao tác thanh toán.

Response:

```json
{
  "success": true,
  "message": "Yêu cầu gia hạn đang chờ Admin xử lý thủ công.",
  "data": {
    "renewal_id": 5,
    "order_id": 21,
    "domain": "example.com",
    "status": "pending_manual",
    "expires_at": "2027-09-14T10:00:00+00:00",
    "idempotent": false
  }
}
```

`data.status`:

- `success`: registrar tự động thành công, order completed và hạn mới được cộng từ `max(expires_at, now)`.
- `pending_manual`: đã trừ tiền, order processing và chờ admin; service hiện hữu vẫn giữ trạng thái/hạn cũ.
- `failed`: chỉ xuất hiện khi retry cùng key của lần provider lỗi trước; tiền đã được hoàn và không bị trừ lại.

Provider lỗi ở lần gọi đầu trả `409`, refund đúng số tiền đã trừ và tạo wallet transaction `refund` cùng order reference. Một domain chỉ có tối đa một renewal `processing/pending`; request lặp khi đang chờ sẽ trả renewal hiện tại với `idempotent=true` kể cả khi không gửi key.

### Duyệt Domain Thủ Công

`POST /api/v1/admin/services/{id}/approve-domain`

Cần token và `domains.approve`. `{id}` là `user_services.id` của domain. Alias cũ `POST /api/v1/orders/domain/{id}/approve` vẫn được giữ trong release hiện tại.

Response:

```json
{
  "success": true,
  "message": "Đã duyệt và kích hoạt tên miền example.com thành công.",
  "data": {
    "domain": "example.com",
    "expires_at": "2027-09-14T10:00:00+00:00",
    "idempotent": false,
    "service_id": 12,
    "renewal_id": null,
    "operation": "registration",
    "order_id": 10
  }
}
```

Rule: command duyệt cả đăng ký mới (`operation=registration`) và renewal manual (`operation=renewal`). Renewal cộng hạn từ `max(expires_at, now)`, complete order/renewal và ghi audit `domain.renewal_approved`. Gọi lại trả `idempotent=true`, giữ nguyên hạn và không tạo audit trùng. Trạng thái không hợp lệ trả `409 CONFLICT`.

### Coupon Resource

```json
{
  "id": 1,
  "code": "SALE10",
  "discount_percent": 10,
  "discount_amount": null,
  "usage_limit": 100,
  "used_count": 0,
  "expires_at": "2026-12-31T00:00:00+00:00",
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00"
}
```

### Coupon CRUD

Prefix: `/api/v1/orders/coupons`, cần `orders.manage`.

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| GET | `/api/v1/orders/coupons` | Query `per_page`, `search`, `is_active` |
| GET | `/api/v1/orders/coupons/{id}` | Chi tiết |
| POST | `/api/v1/orders/coupons` | Tạo |
| PUT | `/api/v1/orders/coupons/{id}` | Cập nhật |
| DELETE | `/api/v1/orders/coupons/{id}` | Xóa |

Create body:

```json
{
  "code": "SALE10",
  "discount_percent": 10,
  "discount_amount": null,
  "usage_limit": 100,
  "expires_at": "2026-12-31",
  "is_active": true
}
```

Validation:

- `code`: required, string, max 50, unique
- `discount_percent`: nullable, numeric, min 0, max 100
- `discount_amount`: nullable, numeric, min 0
- `usage_limit`: nullable, integer, min 1
- `expires_at`: nullable, date, `after_or_equal:today` khi create
- `is_active`: nullable/sometimes boolean

Rule:

- Code được chuẩn hóa uppercase và bỏ khoảng trắng.
- Phải có đúng một kiểu giảm giá: phần trăm hoặc số tiền cố định. Không được để cả hai cùng > 0.
- Coupon hết hạn, inactive, hết lượt sẽ bị từ chối.
- Khi checkout thật, coupon row được lock và `used_count` tăng.
- Giảm cố định không làm đơn âm: `final_amount` thấp nhất là 0.

### Preview Coupon

`POST /api/v1/orders/preview-coupon`

Cần token.

Body:

```json
{
  "coupon_code": "SALE10",
  "total_amount": 500000
}
```

Response:

```json
{
  "success": true,
  "message": "Áp dụng mã thành công. Giảm 50,000đ",
  "data": {
    "discount_amount": 50000,
    "final_amount": 450000
  }
}
```

Rule: preview không lock database và không tăng `used_count`.

## Finance

Quản lý tài khoản ngân hàng nhận tiền, lệnh nạp, SePay webhook và rút tiền. Tất cả endpoint Finance cần token, trừ webhook SePay do package xử lý ở `/api/sepay/webhook`.

### Ví và lịch sử giao dịch

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/finance/wallet` | Token/Owner | Trả `balance`, `currency=VND`, trạng thái ví |
| GET | `/api/v1/finance/wallet/transactions` | Token/Owner | Filter `type`, `reference_type`, `date_from`, `date_to`, `per_page` |
| GET | `/api/v1/finance/wallet/transactions/{transaction}` | Token/Owner | ID của user khác trả `404` |

`reference` có dạng `{ "type": "orders", "id": 10 }` hoặc `null` với dữ liệu legacy. Các giao dịch mới liên kết tới `orders`, `user_services`, `payment_transactions` hoặc `withdrawal_requests`.

### Bank Account Resource

```json
{
  "id": 1,
  "bank_name": "MBBank",
  "bank_code": "970422",
  "account_number": "123456789",
  "account_name": "NGUYEN VAN A",
  "is_auto": true,
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00"
}
```

### Active Bank Resource

`GET /api/v1/finance/banks` chỉ trả field cần cho user nạp tiền:

```json
{
  "id": 1,
  "bank_name": "MBBank",
  "account_number": "123456789",
  "account_name": "NGUYEN VAN A"
}
```

### Admin Bank Account API

Prefix: `/api/v1/finance/admin/bank-accounts`, cần `bank_accounts.manage`.

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| GET | `/api/v1/finance/admin/bank-accounts` | Query `per_page`, `search`, `is_active`, `is_auto` |
| GET | `/api/v1/finance/admin/bank-accounts/{id}` | Chi tiết |
| POST | `/api/v1/finance/admin/bank-accounts` | Tạo |
| PUT | `/api/v1/finance/admin/bank-accounts/{id}` | Cập nhật |
| DELETE | `/api/v1/finance/admin/bank-accounts/{id}` | Xóa nếu chưa có payment transaction |

Create body:

```json
{
  "bank_name": "MBBank",
  "bank_code": "970422",
  "account_number": "123456789",
  "account_name": "NGUYEN VAN A",
  "is_auto": true,
  "is_active": true
}
```

Validation:

- `bank_name`: required, string, max 100
- `bank_code`: required, string, max 20
- `account_number`: required, string, max 50
- `account_name`: required, string, max 100
- `is_auto`, `is_active`: nullable/sometimes boolean

Rule:

- `account_name` được uppercase khi create/update.
- Không xóa bank account nếu đã có `payment_transactions`; hãy tắt `is_active`.

### User Deposit

`GET /api/v1/finance/banks`

Cần token. Trả danh sách bank active.

`POST /api/v1/finance/deposit`

Cần token.

Body:

```json
{
  "bank_account_id": 1,
  "amount": 100000
}
```

Validation:

- `bank_account_id`: required, integer, exists `bank_accounts.id`
- `amount`: required, numeric, min 10000

Response `201`:

```json
{
  "success": true,
  "message": "Tạo lệnh nạp tiền thành công.",
  "data": {
    "transaction_id": 10,
    "transaction_code": "SE10",
    "amount": 100000,
    "bank_name": "MBBank",
    "account_number": "123456789",
    "account_name": "NGUYEN VAN A",
    "qr_url": "https://img.vietqr.io/image/970422-123456789-compact2.jpg?amount=100000&addInfo=SE10&accountName=NGUYEN%20VAN%20A"
  }
}
```

Rule:

- Chỉ chọn bank `is_active = true`.
- `transaction_code = {sepay.pattern}{payment_transactions.id}`, default pattern `SE`.
- QR dùng `img.vietqr.io`.

### Payment Transaction Resource

```json
{
  "id": 10,
  "user_id": 1,
  "bank_account_id": 1,
  "transaction_code": "SE10",
  "amount": 100000,
  "actual_amount": 100000,
  "status": "completed",
  "paid_at": "2026-09-08T06:16:54+00:00",
  "created_at": "2026-09-08T06:16:54+00:00",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "user@example.com"
  },
  "bank_account": {
    "id": 1,
    "bank_name": "MBBank",
    "account_number": "123456789"
  }
}
```

### Admin Deposit API

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| GET | `/api/v1/finance/admin/deposits` | Query `per_page`, `search`, `status` |
| GET | `/api/v1/finance/admin/deposits/{id}` | Có load user và bank |
| POST | `/api/v1/finance/admin/deposits/{id}/approve` | Duyệt thủ công |
| POST | `/api/v1/finance/admin/deposits/{id}/cancel` | Hủy lệnh pending |

Approve body:

```json
{
  "actual_amount": 100000
}
```

Validation:

- `actual_amount`: required, numeric, min 0

Rule:

- Chỉ approve/cancel transaction `pending`.
- Khi approve, cộng `actual_amount` vào ví và ghi wallet transaction `deposit`.
- `amount` là số khách định nạp; `actual_amount` là số thực nhận.

### SePay Webhook

Endpoint do package SePay xử lý:

`POST /api/sepay/webhook`

Header:

```http
Authorization: Bearer {sepay_webhook_token}
```

Setting liên quan:

- `settings.sepay_webhook_token`: ghi đè config token runtime
- `settings.sepay_match_pattern`: ghi đè pattern, default `SE`

Rule:

- Chỉ xử lý dòng tiền vào `transferType = in`.
- Package bóc transaction id từ nội dung chuyển khoản theo pattern, ví dụ `SE10` -> id `10`.
- Nếu payment không tồn tại hoặc không `pending`, bỏ qua để chống webhook duplicate.
- Nếu bank account của payment không bật `is_auto`, không tự cộng tiền; admin duyệt thủ công.
- Nếu auto, cộng đúng `transferAmount` nhận từ SePay vào ví, update payment `completed`, lưu payload.

### Withdrawal Resource

```json
{
  "id": 1,
  "user_id": 1,
  "amount": 50000,
  "bank_name": "MBBank",
  "account_number": "123456789",
  "account_name": "NGUYEN VAN A",
  "status": "pending",
  "admin_note": null,
  "created_at": "2026-09-08T06:16:54+00:00",
  "updated_at": "2026-09-08T06:16:54+00:00",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "user@example.com"
  }
}
```

### User Withdrawal

`GET /api/v1/finance/withdraws`

Cần token. Query: `per_page`. Chỉ trả lệnh rút của user hiện tại.

`POST /api/v1/finance/withdraw`

Cần token.

Body:

```json
{
  "amount": 50000,
  "bank_name": "MBBank",
  "account_number": "123456789",
  "account_name": "Nguyen Van A"
}
```

Validation:

- `amount`: required, numeric, min 50000
- `bank_name`: required, string, max 100
- `account_number`: required, string, max 50
- `account_name`: required, string, max 100

Response `201`:

```json
{
  "success": true,
  "message": "Tạo lệnh rút tiền thành công. Vui lòng chờ quản trị viên phê duyệt.",
  "data": {}
}
```

Rule:

- Trừ tiền ví ngay khi tạo lệnh.
- `account_name` được uppercase.
- Ghi wallet transaction `withdraw_pending`.

### Admin Withdrawal API

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| GET | `/api/v1/finance/admin/withdraws` | Query `per_page`, `search`, `status` |
| POST | `/api/v1/finance/admin/withdraws/{id}/approve` | Đánh dấu đã chuyển khoản |
| POST | `/api/v1/finance/admin/withdraws/{id}/reject` | Từ chối và hoàn tiền |

Reject body:

```json
{
  "admin_note": "Sai số tài khoản"
}
```

Validation:

- `admin_note`: required, string, max 255

Rule:

- Chỉ xử lý withdrawal `pending`.
- Approve đổi withdrawal `completed`, wallet log từ `withdraw_pending` thành `withdraw`.
- Reject cộng tiền lại vào ví, ghi wallet transaction `refund_withdraw`, update status `rejected` và lưu `admin_note`.

## Shared Integrations

### Hosting Server Factory

Update 2026-09-27: runtime dung `HostingServerFactory::forServer(server)` de doc credential da decrypt tu Eloquent. WHM username khong hard-code `root`; ho tro token hoac password auth, port rieng, TLS verification va timeout. Interface hien co `testConnection`, `listPlans`, `getPlanCapabilities`, `getAccount`, `createAccount`, `suspendAccount`, `unsuspendAccount`, `terminateAccount`, `changePassword` va `createLoginSession`.

Cron backend: `hosting:suspend-expired`, `hosting:terminate-overdue`, `hosting:recover-pending`, `hosting:reconcile`, `hosting:sync-packages`. Package sync giu nguyen gia ban admin; package moi inactive/gia 0; package mat tren WHM bi disable local.

`HostingServerFactory::forServer(server)` ho tro:

- `mock`: không gọi API thật, dùng local/test.
- `whm`: goi WHM API qua `https://{hostname_or_ip}:{api_port}/json-api`, dung username va token/password auth trong server config.
- `cyberpanel`: goi `https://{hostname_or_ip}:{api_port}/api`, dung username/secret trong server config.

Interface chung:

- `createAccount(domain, username, password, planName, email)`
- `suspendAccount(username)`
- `unsuspendAccount(username)`
- `terminateAccount(username)`
- `changePassword(username, newPassword)`

### Domain Registrar Factory

`DomainRegistrarFactory::make(driver, apiUser, apiKey)` hỗ trợ:

- `manual`: check luôn available, register trả `pending_manual`.
- `tenten`: gọi `https://domainapi.tenten.vn`.

TenTen setting lấy từ DB:

- `tenten_api_user`
- `tenten_api_key`

## Roles Và Permissions Seed

Permissions:

- User/IAM: `users.view`, `users.create`, `users.update`, `users.delete`, `roles.manage`
- Catalog: `catalog.view`, `catalog.manage`
- Orders: `orders.view`, `orders.manage`
- Services: `services.view`, `services.manage`, `domains.approve`
- Finance: `finance.view`, `wallets.manage`, `deposits.manage`, `withdrawals.manage`, `bank_accounts.manage`
- Support: `tickets.view`, `tickets.reply`, `tickets.manage`
- System: `settings.view`, `settings.manage`

Roles:

- `customer`: role mặc định cho user đăng ký mới.
- `cskh`: xem order/service và xem/trả lời ticket.
- `marketing`: xem user, quản lý catalog và order.
- `technical`: xem order, quản lý service/domain và hỗ trợ ticket.
- `admin`: quản trị tối cao, được `Gate::before` cho phép toàn bộ permission.

## Ghi Chú Cho Frontend

- Backend đã enforce permission trên CRUD catalog/services/coupon, finance admin, admin order/service và IAM; frontend vẫn phải xử lý `403` thay vì chỉ dựa vào ẩn/hiện nút.
- JSON response `/api/v1` đã dùng envelope thống nhất; parser frontend nên đọc `success`, `data`, `message`, `error`, `meta`, `links`.
- Tiền tệ trả về dưới dạng string decimal; frontend không parse qua float trước khi tính toán.
- Login/register bị giới hạn 5 request/phút theo email + IP; check-domain và preview-coupon bị giới hạn 30 request/phút.
- CORS production lấy allowlist từ `CORS_ALLOWED_ORIGINS`; Bearer-token mode không bật credentials mặc định.
- Với endpoint download product, response thành công là binary stream, không phải JSON.
- Wallet, orders và my-services đều yêu cầu Bearer token và tự scope theo user hiện tại; frontend không gửi `user_id`.
- Admin user/role/domain/finance action nhạy cảm được ghi `activity_logs`; khóa/xóa/đổi role sẽ revoke token theo rule ở phần Identity.
- `settings` và `support_tickets` vẫn chưa có route/module controller; đây là scope gate BE-12.
