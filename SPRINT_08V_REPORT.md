# Sprint 08V - VPS client expansion

Ngay ra soat: 2026-09-21

## Da trien khai

- Public VPS catalog, plan detail API va OS image API; gia chu ky va phu thu khu vuc duoc tinh bang decimal string.
- Checkout lay `location_id` noi bo, UUID idempotency va trang thai active/creating/installing/reconciling. 409 giu UUID khi thu lai trong cung phien checkout.
- Customer center VPS co danh sach, loc, phan trang, provisioning/power/IP/OS/expiry, credential owner on-demand, power/rebuild/password/hostname/sync va renewal.
- Renewal lay plan public bang `my-service.service.id`, dung `vps.location.id` de cong phu thu. Neu gia khong kha dung thi khoa thanh toan. Credential response den muon sau khi dong panel bi bo qua.
- Header/footer/sidebar/dashboard/order filter da noi luong VPS. Khong dung plan/provider mock cho production.

## Xac minh

- 43 test files, 112 tests pass; TypeScript, lint va production build pass.
- Truoc khi cau hinh sandbox, backend local public plan va OS endpoint deu tra 200 voi `data=[]`. Chua co active fixture de thuc hien giao dich thuc va lifecycle E2E.

## Cap nhat sandbox 2026-09-21

- Dang nhap Admin local va luu cau hinh XVPS sandbox qua API quyen `services.manage`; khong dung production credential, khong ghi token/secret vao repo. Goi sync catalog tra thanh cong.
- Backend local hien co 2 plan (0 active), 2 location (0 active), 4 OS (4 active). Public API tra 0 plan va 4 OS.
- Plan ho tro `monthly`, `quarterly`, `annually`. Frontend da bo sung nhan chu ky va regex hostname dung backend; 43 test files, 113 tests pass.
- Chua cap nhat sale_pricing/sale_surcharge hoac bat active vi gia ban la quyet dinh kinh doanh; khong thuc hien giao dich wallet/XVPS.

## Con lai truoc release (cap nhat truoc khi co fixture)

- Wallet fixture co so du hop le de kiem thu mua, cap phat, credential, lifecycle, gia han va doi soat. Muc nay da duoc thuc hien trong dot QA ben duoi.
- Plan da inactive se tra 404 o public detail; backend chua cung cap gia renewal owner-scoped. Frontend khoa thanh toan thay vi doan gia.
- Browser responsive/E2E, staging smoke va Product Owner mobile/desktop sign-off. Client Release Gate Sprint 08 chua dat; Sprint 09 da bat dau song song theo quyet dinh Product Owner.

## Gia test va smoke bo sung

Product Owner giao quyet dinh gia test tren sandbox local. Da dat gia ban cao hon gia von sandbox khoang 20%, lam tron len boi so 5.000 VND:

| Plan | Thang | Quy | Nam |
| --- | ---: | ---: | ---: |
| VPS Starter 1C / 1GB | 80.000 | 235.000 | 940.000 |
| VPS Pro 2C / 2GB | 145.000 | 435.000 | 1.730.000 |

Phu thu HCM 0 VND, Singapore 20.000 VND. Hai plan va hai location da active; public API tra 2 plan, 4 OS va gia dung bang tren. Starter co hai location, Pro chi ho tro HCM theo mapping provider. Khong dung production credential.

- Card va checkout VPS mac dinh location co gia thap nhat, khong phu thuoc thu tu provider tra ve.
- Customer QA moi voi vi 0 VND goi buy-vps hop le bi backend chan 409; vi khong doi, khong co VPS duoc tao. Tai khoan QA da duoc soft-delete.
- Backend cung dung 409 cho thieu tien va provider uncertain; UI hien thong bao xung dot trung tinh va giu UUID. Nen bo sung error code rieng o backend de phan loai chinh xac.
- 48 test files, 123 tests pass tai thoi diem gia test. Success E2E duoc thuc hien trong dot QA ben duoi.

## Local/sandbox API E2E 2026-09-21

- Product Owner cho phep tao fixture tren local/sandbox. Tao tai khoan QA, bank gia lap chi dung cho QA, deposit 160.000 VND qua luong Admin approve; bank da duoc tat sau khi nap. Khong dung tien/chuyen khoan that hoac production key.
- Mua Starter HCM/Ubuntu monthly 80.000 VND: order #9, service #7, instance #1 active/running, co IP va credential owner on-demand. Gui lai cung UUID tra order #9 voi `idempotent=true`, vi giu 80.000 VND.
- Stop/start/restart/poweroff/start, doi hostname va mat khau deu thanh cong. Rebuild sang Debian 12 tra completed; sync dua service ve active va OS hien Debian 12.
- Gia han monthly 80.000 VND: order #10/operation #11 completed, vi 80.000 -> 0 VND. Gui lai cung UUID tra order #10 voi `idempotent=true`, vi van 0 VND.
- Lan doi mat khau dau gap loi schema: cot `user_services.password_encrypted` VARCHAR(255) khong du cho Laravel ciphertext. Da them migration chuyen sang TEXT, migrate local, doi mat khau 64 ky tu thanh cong. Da ngan loi noi bo ghi SQL/ciphertext vao operation/Admin response va xoa thong bao nhay cam cua operation QA cu. Backend VPS tests 7/7, 120 assertions; test moi bao phu ciphertext >255 byte, OS fallback va redaction loi noi bo.
- Sandbox `getVpsInfo` khong tra OS; backend sync lay ten OS tu catalog. Provider tra ngay het han 2026-05-27 (qua khu so voi 2026-09-21) du bao active va renewal completed. Sau rebuild, password do provider tra ve luc sync khong khop password yeu cau. Hai sai khac can doi soat voi provider tren staging, khong coi la da xac nhan production.
- QA account/service VPS sandbox duoc giu lai de tiep tuc nghiem thu; bank fixture inactive, wallet 0 VND. Khong luu password/token trong repo.
- Browser responsive/E2E khong chay duoc vi computer-use khong co browser; staging URL va Product Owner sign-off chua co. `S08V-10` va Client Release Gate tiep tuc `[B]` cho cac muc nay.

## Incident bo sung 2026-09-22

- User gap unique constraint voi provider instance ID da thuoc VPS khac. Doc local DB xac nhan instance #4 da giu ID do; instance #3 khong gan duoc. Order #12 da tru 145.000 VND nhung van processing/pending; order #11 va #14 cung da tru vi nhung dang pending, can doi soat rieng. Bon operation co bon UUID khac nhau.
- Backend handoff va buoc doi soat an toan: `BACKEND_VPS_DUPLICATE_INCIDENT.md`. Khong retry/refund thu cong bang tay khi chua xac minh phia provider.
- Frontend generic hoa 5xx (ca field errors), giu UUID va khoa cau hinh khi loi 409/5xx/network; test moi bao phu SQL 500 va retry UUID. 48 test files/125 tests, TypeScript, lint va production build dat.
- Thu mo browser `iab` va `chrome` bang computer-use deu khong kha dung; staging/manual QA van blocked.
