# Sprint 14 - Admin IAM va VPS Operations

Ngay hoan thanh scope co contract: 2026-09-27

## IAM Admin

- User list/detail/search/status/role co pagination va permission-aware actions.
- Create/edit/soft-delete, activate/deactivate co confirm tac dong va canh bao revoke token.
- UI an status/delete/role action tren chinh tai khoan dang dang nhap; backend van enforce self-action va last-active-admin conflict.
- Gan nhieu role cho user; role CRUD va sync permission theo danh sach backend.
- System role bi khoa doi ten/xoa; custom role dang duoc gan khong the xoa.

## VPS Admin

- Them `/admin/vps` voi bon view: provider, plan, location va instance.
- Provider config ho tro sandbox/production, timeout/retry/active va rotate credential. Resource chi dung username/app masked va `has_api_secret`; input credential khong bao gio hydrate secret cu.
- Provider health doc balance/scope/statistics an toan.
- Sync catalog co confirm; plan moi van theo backend inactive/gia 0. Admin cau hinh ten, gia ban tung cycle va trang thai storefront.
- Location hien phu thu von va cho cau hinh phu thu ban/trang thai.
- Instance co filter, detail operation history, sync va retry provision bang idempotency key cu.

## Backend Fix

- Sua `/api/v1/admin/roles` bi 500 tren runtime MySQL do Spatie khong resolve duoc model cho `Role::users()`.
- User count va assigned-role guard nay doc truc tiep pivot `model_has_roles` theo `User::class`; them regression assertion cho role list.

## User Wallet Admin

- Moi row user co nut mo lich su vi, hien so du hien tai, giao dich, so du truoc/sau, filter loai va pagination.
- Admin co `wallets.manage` duoc cong/tru so du sau buoc xac nhan; `finance.view` chi duoc xem neu khong co quyen dieu chinh.
- Backend lock vi khi ghi, chan so du am/vi bi khoa, bat buoc note va ghi `wallet.admin_adjusted` vao activity log.
- UUID idempotency duoc rang buoc theo tung vi; retry cung key khong doi so du hoac audit lan hai.

## Deferred Theo BE-12

- Settings SePay/TenTen chua co route/controller nen khong tao UI mock.
- Support ticket chua co route/controller nen khong tao UI mock.
- Hai scope nay chi mo lai khi backend cap contract, permission va secret-write semantics day du.

## Kiem Thu

- Frontend: 69 test files, 168 tests pass.
- Backend: 80 tests, 585 assertions pass.
- TypeScript, ESLint, Pint va production build: pass.
- Frontend smoke: `/admin/users`, `/admin/permissions`, `/admin/vps` tra 200.
- API smoke bang admin local: Users, Permissions, Roles va toan bo read endpoint VPS Admin tra 200.
- Browser responsive QA tiep tuc nam trong Sprint 15 theo thoa thuan nguoi dung tu kiem thu giao dien.
