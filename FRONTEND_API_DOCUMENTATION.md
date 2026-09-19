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
  "created_at": "2026-09-08T06:16:54+00:00",
  "updated_at": "2026-09-08T06:16:54+00:00"
}
```

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
  "ip_address": "1.2.3.4",
  "type": "whm",
  "provisioning_mode": "automatic",
  "login_url": "https://panel.example.com:2083",
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

Query list:

- `per_page`, `search`, `type`, `is_active`

Create body:

```json
{
  "name": "WHM 01",
  "ip_address": "1.2.3.4",
  "type": "whm",
  "provisioning_mode": "automatic",
  "login_url": "https://panel.example.com:2083",
  "api_token": "secret",
  "is_active": true
}
```

Validation:

- `name`: required, string, max 255
- `ip_address`: required, valid IP, max 50
- `type`: required, in `mock`, `cyberpanel`, `whm`
- `provisioning_mode`: nullable, in `automatic`, `manual`; mặc định `automatic`
- `login_url`: nullable, HTTP/HTTPS URL, max 2048; automatic sẽ fallback theo server IP/port nếu bỏ trống
- `api_token`: nullable, string, max 255
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
  "price_per_month": "50000.00",
  "is_active": true,
  "created_at": "2026-09-08T06:16:54+00:00",
  "server": {}
}
```

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
  "price_per_month": 50000,
  "is_active": true
}
```

Validation:

- `server_id`: required, integer, exists `servers.id`
- `name`: required, string, max 255
- `whm_package_name`: required, string, max 100
- `disk_quota`: required, integer, min 0
- `price_per_month`: required, numeric, min 0
- `is_active`: nullable boolean

### Dịch vụ của user

| Method | Endpoint | Auth | Ghi chú |
| --- | --- | --- | --- |
| GET | `/api/v1/services/my-services` | Token | Filter `service_type`, `status`, `expiring_before`, `per_page` |
| GET | `/api/v1/services/my-services/{service}` | Token/Owner | ID của user khác trả `404` |
| GET | `/api/v1/services/my-services/{service}/credentials` | Token/Owner | Chỉ hosting active; response không được cache |

Resource trả thông tin hosting/domain, order liên quan, `provisioning_mode`, `provisioned_at`, `pending_renewal` và các action. `actions.can_view_credentials=true` khi hosting active đã có đủ credential. Không trả password trong list/detail, `password_encrypted`, server, API token hoặc contact config.

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

Frontend chỉ gọi endpoint credential khi người dùng chủ động mở thông tin đăng nhập; không lưu password vào localStorage, analytics hoặc log. Hosting chưa active/chưa đủ credential trả `409`; service của user khác trả `404`.

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

`HostingServerFactory::make(type, ip_address, api_token)` hỗ trợ:

- `mock`: không gọi API thật, dùng local/test.
- `whm`: gọi WHM API qua `https://{ip}:2087/json-api`, header `Authorization: whm root:{api_token}`.
- `cyberpanel`: gọi `https://{ip}:8090/api`, dùng `adminUser=admin`, `adminPass={api_token}`.

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
- Finance: `finance.view`, `deposits.manage`, `withdrawals.manage`, `bank_accounts.manage`
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
