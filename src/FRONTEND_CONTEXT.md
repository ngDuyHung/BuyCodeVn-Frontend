
# Tài liệu Bối cảnh & Kiến trúc Frontend - BuyCodeVN

**Mục đích của file này:** Cấp bối cảnh (context) cho AI để tiếp tục phát triển, sửa lỗi hoặc nâng cấp dự án.

## 1. Thông tin Dự án & Tech Stack
*   **Dự án:** BuyCodeVN (Bán mã nguồn, thuê website, hosting, VPS).
*   **Framework chính:** Next.js (App Router, thư mục `src/`).
*   **Styling:** Tailwind CSS v4 (Cấu hình trực tiếp trong `src/app/globals.css` qua `@theme`, không dùng `tailwind.config.ts`).
*   **Quản lý State:** Zustand (kết hợp `persist` middleware lưu state vào localStorage).
*   **Gọi API:** Axios (có Interceptors xử lý token và báo lỗi global).
*   **Quản lý Cookie:** `js-cookie` (dùng để đồng bộ token cho Next.js Middleware/Proxy).
*   **Thông báo (Toast):** `react-toastify`.
*   **Kiến trúc:** Phân mảnh theo Domain-Driven Design (DDD) phân tách ranh giới rõ ràng giữa Client, Admin và Auth.

## 2. Cấu trúc Thư mục Hệ thống (DDD)

```text
src/
├── app/                      # TẦNG ROUTING (URL)
│   ├── (client)/             # 1. PHÂN HỆ CLIENT (Route Group - Không ảnh hưởng URL)
│   │   ├── layout.tsx        # Layout Client (Có Header, Footer, Menu khách)
│   │   ├── page.tsx          # URL: / (Trang chủ)
│   │   ├── source-code/      # URL: /source-code 
│   │   └── (user)/           # Route group cho khách đã đăng nhập (/user, /user/orders)
│   │
│   ├── admin/                # 2. PHÂN HỆ ADMIN (Bắt buộc URL có /admin)
│   │   ├── layout.tsx        # Layout Admin (Sidebar, Topbar)
│   │   └── page.tsx          # URL: /admin
│   │
│   ├── (auth)/               # 3. PHÂN HỆ XÁC THỰC
│   │   ├── login/            # URL: /login
│   │   └── register/         # URL: /register
│   │
│   ├── globals.css           
│   └── layout.tsx            # Root Layout (Chỉ chứa <html>, <body>, ToastContainer)
│
├── components/               # TẦNG GIAO DIỆN
│   ├── ui/                   # Các UI cơ bản dùng chung (Button, Input, Modal, Table...)
│   ├── client/               # Chỉ chứa Component của Client (layout/, features/)
│   └── admin/                # Chỉ chứa Component của Admin (layout/, features/)
│
├── services/                 # TẦNG GỌI API
│   ├── api.ts                # Cấu hình Axios chung (Interceptors)
│   ├── auth.service.ts       # Service login/register/logout (Dùng chung)
│   ├── client/               # Gọi API cho Client (catalog, finance...)
│   └── admin/                # Gọi API cho Admin
│
├── stores/                   # TẦNG QUẢN LÝ TRẠNG THÁI (Zustand)
│   ├── authStore.ts          # Dùng chung (Lưu token, thông tin user)
│   ├── client/               # Store riêng cho Client
│   └── admin/                # Store riêng cho Admin
│
├── hooks/                    # TẦNG LOGIC (Custom Hooks)
│   ├── useAuthLogic.ts       # Logic Đăng nhập/Đăng ký dùng chung
│   ├── client/               # Chứa useCatalog, useFinanceLogic...
│   └── admin/                
│
├── types/                    # TẦNG ĐỊNH NGHĨA KIỂU (TypeScript)
│
└── proxy.ts                  # Route Guard (Bảo vệ /admin và /(user) dựa vào cookie)

```

## 3. Luồng hoạt động Module Xác thực (Auth)

Module Auth được thiết lập chặt chẽ theo sơ đồ sau:

1. **Người dùng nhập Form:** Dữ liệu từ `/login` hoặc `/register` được gửi vào Custom Hook `useAuthLogic.ts`.
2. **Gọi API (Service):** Custom Hook gọi hàm từ `auth.service.ts` (Sử dụng Axios instance từ `api.ts`).
3. **Lưu trữ Trạng thái (Zustand & Cookie):** Nếu thành công, token và dữ liệu user được lưu vào `useAuthStore` (localStorage). Đồng thời, token được ghi vào Cookie (`js-cookie` với key `auth_token`).
4. **Bảo vệ Tuyến đường (Proxy/Middleware):** Mỗi khi chuyển trang, `src/proxy.ts` chạy trên Server. Nó đọc Cookie `auth_token`. Nếu user cố vào route bảo mật mà không có cookie, hệ thống chặn lại và redirect về `/login`.
5. **Xử lý Lỗi Toàn cục:** Bất kỳ lỗi nào (sai mật khẩu, hết hạn token) đều bị bắt tại Axios Interceptors (`api.ts`) và hiển thị thông báo qua `react-toastify`. Nếu nhận mã 401, hệ thống tự động gọi hàm `logout()`.

## 4. Hướng dẫn Giao tiếp với AI trong tương lai

Khi cần tạo mới tính năng, sửa lỗi hoặc nâng cấp module, hãy đưa cho AI câu lệnh (Prompt) theo định dạng sau:

> **[Bối cảnh]:**
> Tham khảo file `FRONTEND_CONTEXT.md` để hiểu cấu trúc dự án hiện tại.
> **[Yêu cầu]:**
> Tôi muốn làm tính năng [Tên tính năng, ví dụ: Chức năng Mua ngay sản phẩm].
> **[Tài liệu Backend / Mã nguồn liên quan]:**
> Dưới đây là mã code của các file liên quan cần sửa:
> * File A:
> 
> 
> ```typescript
> [Dán code vào đây]
> 
> ```
> 
> 
> **[Hành động mong đợi]:**
> Dựa trên nguyên tắc cấu trúc DDD hiện tại, hãy viết code cho tính năng này (chia rõ Service, Store, Custom Hook, Component theo phân hệ Client/Admin) theo từng bước nhỏ.

```
