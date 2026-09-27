# Sprint 06 - Bao cao thuc thi

Ngay hoan thanh frontend: 2026-09-19

## Ket qua

- Mo rong finance type/service cho wallet, active bank, deposit, wallet transaction va withdrawal voi unified envelope/pagination.
- Normalize tat ca amount/balance doc tu API ve decimal string truoc khi render hoac so sanh.
- Form nap tien dung inline validation, retry bank list va khong con `alert`.
- Man hinh ket qua nap hien VietQR, account number, amount, transaction code va nut copy rieng cho tung gia tri.
- Canh bao ro transaction code la bat buoc va payment dang cho bank/Admin xac nhan.
- Tao `/user/withdraw` voi min 50.000d, validation field, kiem tra wallet va canh bao tien bi tru ngay.
- Tao `/user/withdrawals` voi pagination dung `per_page`, status/admin note va che phan lon account number.
- Dashboard `/user` lay wallet va 5 transaction gan nhat tu API; bo toan bo so du/order/hosting/VPS gia.
- Them navigation cho rut tien va lich su rut tien, khong de `/user/withdrawals` bi active nham menu `/user/withdraw`.

## Kiem thu

- `npm test`: 31 files, 83 tests dat.
- Bao phu service envelope/money normalization, deposit inline validation, QR/copy/warning, withdrawal minimum/insufficient/pending, account masking, pagination va dashboard data that.
- `npx tsc --noEmit`: dat.
- `npm run lint`: 0 errors, 8 warnings anh cu ngoai scope Sprint 06.

## Runtime backend

- Tao customer integration rieng: register 201, login 200.
- `GET /finance/wallet` tra 200 voi balance `0.00`.
- Wallet transaction va withdrawal list tra 200, unified pagination va `total=0`.
- `GET /finance/banks` tra 200 voi mot active bank.
- Deposit `9.999d` tra 422 `VALIDATION_ERROR`, dung minimum 10.000d.
- Withdrawal `50.000d` voi wallet 0 tra 400 `BUSINESS_RULE_VIOLATION`, khong tao lenh.

## Gioi han xac minh

- Khong tao pending deposit/withdrawal that de tranh de lai giao dich integration co the bi xu ly nham.
- Payload thanh cong, QR response, pending withdrawal va refresh wallet duoc bao phu bang automated tests theo contract.
