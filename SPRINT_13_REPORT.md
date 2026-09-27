# Sprint 13 - Admin Finance

Ngay hoan thanh: 2026-09-27

## Da trien khai

- Them sidebar va ba route `/admin/finance/bank-accounts`, `/admin/finance/deposits`, `/admin/finance/withdrawals` theo permission.
- Bank account co list, search, filter active/auto, pagination va CRUD. So tai khoan duoc mask tren list, chi hien day du trong dialog detail co quyen.
- Khi backend chan xoa tai khoan da co giao dich, UI de xuat tat `is_active` de bao toan du lieu doi soat.
- Deposit co queue, search ma giao dich, filter status va detail. Approve phan biet amount du kien/thuc nhan, cho phep `0`, canh bao chenh lech va cancel chi hien khi pending.
- Withdrawal co queue, search/status; approve bat buoc confirm da chuyen khoan. Reject bat buoc note va thong bao ro so tien duoc hoan vi.
- Moi write action co busy guard, dong dialog va fetch lai state sau thanh cong hoac conflict.

## Bao mat va nghiep vu

- Trang bank account can `bank_accounts.manage`; queue tai chinh can `finance.view`.
- Nut xu ly deposit/withdrawal chi hien voi `deposits.manage`/`withdrawals.manage` va item pending.
- Backend van la authority cho pending-only va lock transaction; request lap lai bi tu choi, khong cong/hoan vi lan hai.

## Kiem thu

- Frontend: 64 test files, 160 tests pass.
- Backend: 73 tests, 540 assertions pass.
- Feature test moi bao phu permission read/write, customer 403, approve deposit `actual_amount = 0`, stale duplicate action, reject note va refund mot lan.
- TypeScript, ESLint, Pint va production build: pass.
- HTTP local: ca ba route Admin Finance tra 200.

## Ghi chu release

- Browser responsive QA tiep tuc nam trong Sprint 15 theo thoa thuan nguoi dung tu kiem thu giao dien.
