
# Tài liệu Bối cảnh & Kiến trúc Frontend - BuyCodeVN

**Mục đích của file này:** Cấp bối cảnh (context) cho AI để tiếp tục phát triển, sửa lỗi hoặc nâng cấp dự án.

## 1. Thông tin Dự án & Tech Stack
*   **Dự án:** BuyCodeVN (Bán mã nguồn, thuê website, hosting, VPS).
*   **Framework chính:** Next.js (App Router, thư mục `src/`).
*   **Styling:** Tailwind CSS v4 (Cấu hình trực tiếp trong `src/app/globals.css` qua `@theme`, không dùng `tailwind.config.ts`).
*   **Quản lý State:** Zustand (kết hợp `persist` middleware lưu state vào localStorage).
*   **Gọi API:** Axios (có Interceptors xử lý token và báo lỗi global).
*   **Quản lý Cookie:** `js-cookie` (dùng để đồng bộ token cho Next.js Middleware).
*   **Thông báo (Toast):** `react-toastify`.
*   **Kiến trúc:** Tinh gọn, phân tách ranh giới rõ ràng giữa Client, Admin và Auth nhưng hạn chế chia thư mục quá nhỏ để đẩy nhanh tốc độ code.

## 2. Cấu trúc Thư mục Hệ thống

```text
src/
├── app/                      # TẦNG ROUTING (Chỉ chứa layout.tsx định tuyến và page.tsx)
│   ├── (client)/             # 1. PHÂN HỆ CLIENT (Route Group - Không ảnh hưởng URL)
│   │   ├── layout.tsx        # Layout Client (Nhúng ClientHeader, ClientFooter)
│   │   ├── page.tsx          # URL: / (Trang chủ)
│   │   └── source-code/      
│   │       └── page.tsx      # URL: /source-code 
│   │
│   ├── admin/                # 2. PHÂN HỆ ADMIN (Bắt buộc URL có /admin)
│   │   ├── layout.tsx        # Layout Admin (Nhúng AdminSidebar, AdminTopbar)
│   │   ├── page.tsx          # URL: /admin
│   │   └── products/         
│   │       └── page.tsx      # URL: /admin/products
│   │
│   ├── (auth)/               # 3. PHÂN HỆ XÁC THỰC
│   │   ├── login/page.tsx    # URL: /login
│   │   └── register/page.tsx # URL: /register
│   │
│   ├── globals.css           
│   └── layout.tsx            # Root Layout (Chỉ chứa <html>, <body>, ToastContainer)
│
├── components/               # TẦNG GIAO DIỆN (Làm phẳng - Chứa nội dung chính của thân trang)
│   ├── client/               # Thành phần giao diện của Khách hàng
│   │   ├── layout/           # Chứa các khối layout (ClientHeader.tsx, ClientFooter.tsx)
│   │   └── HomeContent.tsx   # Nội dung import vào app/(client)/page.tsx
│   └── admin/                # Thành phần giao diện của Quản trị viên
│       ├── layout/           # Chứa các khối layout (AdminSidebar.tsx, AdminTopbar.tsx)
│       └── ProductManager.tsx# Nội dung import vào app/admin/products/page.tsx
│
├── services/                 # TẦNG GỌI API (Định nghĩa luôn Type/Interface trực tiếp trong file)
│   ├── api.ts                # Cấu hình Axios chung (Interceptors)
│   ├── auth.service.ts       # Service login/register/logout 
│   ├── client/               # Gọi API cho Client (catalog.client.ts, order.client.ts...)
│   └── admin/                # Gọi API cho Admin (product.admin.ts, user.admin.ts...)
│
├── hooks/                    # TẦNG LOGIC (Custom Hooks tách biệt khỏi UI)
│   ├── useAuthLogic.ts       # Logic Đăng nhập/Đăng ký dùng chung
│   ├── client/               # Ví dụ: useCartLogic.ts
│   └── admin/                # Ví dụ: useTablePagination.ts
│
├── stores/                   # TẦNG QUẢN LÝ TRẠNG THÁI (Zustand)
│   ├── authStore.ts          # Dùng chung (Lưu token, thông tin user)
│   ├── client/               # Store riêng cho Client (cartStore)
│   └── admin/                # Store riêng cho Admin
│
└── middleware.ts             # Route Guard (Bảo vệ /admin và /(user) dựa vào cookie auth_token)

```

## 3. Luồng hoạt động Module Xác thực (Auth)

Module Auth được thiết lập chặt chẽ theo sơ đồ sau:

1. **Người dùng nhập Form:** Dữ liệu từ `/login` hoặc `/register` được gửi vào Custom Hook `useAuthLogic.ts`.
2. **Gọi API (Service):** Custom Hook gọi hàm từ `auth.service.ts` (Sử dụng Axios instance từ `api.ts`).
3. **Lưu trữ Trạng thái (Zustand & Cookie):** Nếu thành công, token và dữ liệu user được lưu vào `useAuthStore` (localStorage). Đồng thời, token được ghi vào Cookie (`js-cookie` với key `auth_token`).
4. **Bảo vệ Tuyến đường (Middleware):** Mỗi khi chuyển trang, `src/middleware.ts` chạy trên Server. Nó đọc Cookie `auth_token`. Nếu user cố vào route bảo mật mà không có cookie, hệ thống chặn lại và redirect về `/login`.
5. **Xử lý Lỗi Toàn cục:** Bất kỳ lỗi nào (sai mật khẩu, hết hạn token) đều bị bắt tại Axios Interceptors (`api.ts`) và hiển thị thông báo qua `react-toastify`. Nếu nhận mã 401, hệ thống tự động gọi hàm `logout()`.

## 4. Hướng dẫn Giao tiếp với AI trong tương lai

Khi cần tạo mới tính năng, sửa lỗi hoặc nâng cấp module, hãy đưa cho AI câu lệnh (Prompt) theo định dạng sau:

> **[Bối cảnh]:**
> Tham khảo file `FRONTEND_CONTEXT.md` để hiểu cấu trúc dự án hiện tại.
> **[Yêu cầu]:**
> Tôi muốn làm tính năng [Tên tính năng, ví dụ: Chức năng Mua ngay sản phẩm].
> **[Tài liệu Backend / Mã nguồn liên quan]:**
> Dưới đây là mã code của các file liên quan cần sửa:
> * File A (ví dụ `app/admin/products/page.tsx`):
> 
> 
> ```tsx
> [Dán code vào đây]
> 
> ```
> 
> 
> * File B (ví dụ `components/admin/ProductManager.tsx`):
> 
> 
> ```tsx
> [Dán code vào đây]
> 
> ```
> 
> 
> **[Hành động mong đợi]:**
> Dựa trên nguyên tắc cấu trúc hiện tại, hãy viết code cho tính năng này (chia rõ Service, Store, Custom Hook, Component theo phân hệ Client/Admin) theo từng bước nhỏ.

```

```