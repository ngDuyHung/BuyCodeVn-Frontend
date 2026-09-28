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

## Presentation Slides Backend

- Them public API lay slide dang active theo lich, thu tu hien thi va placement `home_hero`.
- Them Admin CRUD, upload anh desktop/mobile, xoa anh mobile va bulk reorder; ho tro URL anh hoac file JPG/PNG/WebP.
- CTA chi chap nhan HTTP(S) hoac relative path an toan; layout, alignment, theme va overlay dung preset co kiem soat.
- Tao/sua/xoa/sap xep deu ghi activity log; file cu va file orphan duoc don dep khi thay the hoac request that bai.
- Migration local da chay; public storage link da tao. Public va Admin API smoke deu tra 200.

## Presentation Slides Frontend

- Them menu `/admin/settings/presentation` theo quyen `settings.view`; action tao/sua/xoa/sap xep chi hien voi `settings.manage`.
- Form ho tro upload hoac URL anh desktop/mobile, CTA, split/cover, can noi dung, theme, overlay, lich va trang thai.
- Hero trang chu doc public API voi cache 60 giay, carousel co nut/dot dieu huong va anh mobile responsive.
- Khi backend loi hoac chua co slide, hero tu dong dung banner BUYCODE.VN mac dinh de trang chu khong bi trong.
- Form editor hien hero that o cot preview va cap nhat truc tiep khi doi noi dung, anh, CTA, layout, theme hoac overlay.

## Dynamic Navigation

- Backend them menu hai cap cho `header` va `footer`, public resource toi gian, Admin CRUD/reorder va activity log.
- Migration tao san menu hien tai; validation chan URL nguy hiem, parent khac placement, cay qua hai cap va xoa nhom con du lieu.
- Frontend them `/admin/settings/navigation`, tab Header/Footer, xem nhanh cau truc, CRUD, bat/tat va sap xep theo cung cap.
- Header ho tro dropdown desktop va danh sach nhom mobile; footer tao cot lien ket dong. Ca hai dung fallback neu public API loi.
- Sidebar Admin duoc gom thanh cac nhom Nguoi dung, Noi dung, Ban hang, Dich vu va Tai chinh co the thu gon.

## Site Branding Settings

- Them `/admin/settings/general` quan ly favicon, logo header, logo footer, logo admin va preview tung anh.
- Cau hinh ten website, ten rut gon, keywords, description, dia chi, hotline, Facebook, email, Telegram va copyright co `{year}`.
- Public API chi tra whitelist an toan, khong lo key SePay/TenTen trong cung bang `settings`.
- Root metadata/favicon, header, auth layout, footer, topbar va sidebar Admin doc cau hinh moi; co fallback khi chua upload anh.
- File moi duoc don khi DB fail, file cu duoc xoa sau replace/remove; moi lan cap nhat ghi activity log.

## Deferred Theo BE-12

- Settings SePay/TenTen chua co route/controller nen khong tao UI mock.
- Support ticket chua co route/controller nen khong tao UI mock.
- Hai scope nay chi mo lai khi backend cap contract, permission va secret-write semantics day du.

## Kiem Thu

- Frontend: 82 test files, 192 tests pass.
- Backend: 95 tests, 685 assertions pass.
- TypeScript, ESLint, Pint va production build: pass.
- Frontend smoke: `/admin/users`, `/admin/permissions`, `/admin/vps` tra 200.
- API smoke bang admin local: Users, Permissions, Roles va toan bo read endpoint VPS Admin tra 200.
- Browser responsive QA tiep tuc nam trong Sprint 15 theo thoa thuan nguoi dung tu kiem thu giao dien.
- Browser connector khong co browser kha dung trong phien 2026-09-28; HTTP smoke va production build da pass, visual QA van can thuc hien thu cong.
