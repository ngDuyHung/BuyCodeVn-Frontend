# Backend VPS duplicate provider instance incident

Ngay kiem tra: 2026-09-22. Moi truong: local MySQL `buycodevn_api`, XVPS sandbox. Day la ghi chu ban giao backend; khong tu dong retry/refund/xoa cac don dang doi soat.

## Hien tuong

- Khi tao VPS, provider tra `instance_id` da gan cho VPS khac. MySQL bao unique constraint `vps_instances_provider_provider_instance_id_unique` voi provider ID ket thuc `1001`.
- Local DB: `vps_instances.id=4` da active voi provider ID do; lan ghi cho `vps_instances.id=3` bi trung. Bon provision operations #12-#15 co bon idempotency UUID khac nhau, nen khong phai client gui lai cung UUID.
- Order #12 (145.000 VND) van `processing`, user service #9 va VPS instance #3 van `pending`, provision operation #13 van `processing`, provider ID local null. Wallet transaction payment da ghi va so du da bi tru. Order #11 (80.000 VND) va #14 (80.000 VND) cung dang `processing`/service `pending`/wallet da tru; can doi soat rieng, chua ket luan cung nguyen nhan.
- Khong tiep tuc goi `vps:reconcile`/retry bang tay cho cac don nay truoc khi xac minh provider order/instance va idempotency; retry co the gap lai unique conflict hoac tao side effect moi.

## Duong code can xem

- `app/Modules/Orders/Actions/Vps/BuyVpsAction.php`: sau `createOrder`, code cap nhat `provider_instance_id` ma chua kiem tra ID da thuoc local instance khac. `catch (Throwable)` tiep tuc ghi nguyen `getMessage()` vao `provider_last_error`/operation. Neu lan update nay cung nem exception, response co the thanh 500 kem SQL khi `APP_DEBUG=true`; DB de lai operation `processing` va service `pending` du wallet da tru.
- `app/Modules/Services/Actions/Vps/RetryVpsProvisionAction.php`: retry tu UUID cu nhung cung gan truc tiep provider ID va luu/throw raw exception; can chan conflict tuong tu.
- `app/Console/Commands/ReconcileVpsCommand.php`: quet instance pending khong co provider ID roi goi retry; nhieu lan thu co the lap lai conflict. `report($exception)` va `provider_last_error` co the luu raw SQL.
- `SDK-Virtualizor/XVPSVirtualizor.php::createOrder` gui `Idempotency-Key` header; can doi chieu provider response va giao dich theo tung UUID voi XVPS sandbox. Provider order code `VIRT-API-20260427-001` cung xuat hien o nhieu local instance, nen khong the dung rieng order code de phan biet.

## De nghi backend

1. Doi soat tung UUID/order local voi provider history: ID trung la response sandbox co dinh, replay sai key, hay instance that duoc cap trung. Khong refund khi chua ro provider da tru tien/cap may hay chua.
2. Kiem tra trung provider ID truoc khi cap nhat va xu ly `QueryException` unique mot cach atomic: khong gan ID cho don moi, giu trang thai `reconciling` co ma loi an toan, khong lam `catch` nem tiep. Khong bao gio de response/Admin resource/log nguoi dung chua raw SQL/ciphertext.
3. Reconcile operation/order/service/wallet #11, #12, #14 thu cong hoac refund dung mot lan sau khi xac minh provider. Bo sung integration test cho hai UUID khac nhau duoc provider tra cung `instance_id`, ke ca loi trong catch va scheduler retry.
4. Tach business error code cho insufficient-wallet, provider-uncertain va provider-ID-conflict; client dang giu cung UUID cho HTTP 409/5xx/network uncertainty.

## Frontend da phong ve

- HTTP 5xx duoc hien thi bang loi chung, khong render raw SQL trong form.
- Checkout/gia han VPS giu UUID va khoa cau hinh khi gap 409, 5xx hoac network error cho den khi retry cung yeu cau.
- Browser QA chua thuc hien duoc: computer-use inventory khong co browser, thu mo `iab`/`chrome` deu tra `Browser is not available`.
