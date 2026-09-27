# Sprint 07 - Bao cao thuc thi

Ngay hoan thanh frontend: 2026-09-20

## Ket qua

- Dashboard `/user` lay so du, giao dich gan nhat va `meta.total` cua order/hosting/domain tu API; khong tai toan bo collection.
- Giu `/user/orders` voi filter, pagination, detail va download ma nguon cua don completed.
- Tao `/user/hosting` va `/user/domains` voi filter status, pagination, expiry, domain, plan va pending manual.
- Credential hosting chi duoc goi khi user bam mo; khong doc credential tu list/detail va xoa khoi state khi dong/chuyen panel.
- Doi mat khau hosting ho tro backend tu sinh hoac mat khau 8-50 ky tu; gia tri moi chi hien trong panel ket qua va co copy action.
- Gia han hosting dung chu ky 1/3/6/12/24/36 thang; domain dung 1-10 nam va hien chi phi du kien bang decimal-safe money.
- Quyen thao tac bam hoan toan theo `actions.can_view_credentials`, `actions.can_change_password`, `actions.can_renew`; khong suy dien tu status.
- Hosting/domain renewal giu nguyen idempotency key khi retry, doi key khi user thay doi ky han va thong bao rieng khi `idempotent=true`.
- Tach ro domain renewal `success`, `pending_manual`, `failed`; business/provider error 409 duoc hien qua unified error contract.
- Bo menu `/user/vps` den khi backend co API tuong ung.

## Kiem thu

- `npm test`: 35 files, 93 tests dat.
- Bao phu service list/detail/credential endpoint, owner error propagation, action gating, suspended/expired, pending manual, password mot lan va stable idempotency retry.
- `npx tsc --noEmit`: dat.
- `npm run build`: dat; co route `/user/hosting` va `/user/domains`.
- `npm run lint`: 0 errors, 8 warnings anh cu ngoai pham vi Sprint 07.

## Runtime backend

- Tao customer integration rieng: register 201, login 200.
- Order, active hosting va active domain query tra 200 voi unified pagination, `total=0`.
- Service detail va credential voi ID khong thuoc customer tra 404.
- Hosting mutation voi ID khong hop le bi tu choi 400; domain renew ID khong thuoc customer tra 404.

## Gioi han xac minh

- Customer integration moi khong co active hosting/domain va wallet co so du, nen khong thuc hien change-password/renew thanh cong de tranh tao giao dich ngoai y muon.
- Success, pending manual, provider failure, action gating va idempotent retry da duoc bao phu bang automated tests theo contract.
