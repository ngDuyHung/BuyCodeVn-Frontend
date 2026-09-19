"use client";

import { useState } from "react";
import { useFinanceLogic } from "@/hooks/client/useFinanceLogic";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan, toMoneyString } from "@/lib/money";

export default function DepositPage() {
  const {
    banks,
    isLoadingBanks,
    isDepositing,
    depositResult,
    handleDeposit,
    resetDeposit,
  } = useFinanceLogic();

  const [amount, setAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<number | "">("");

  const QUICK_AMOUNTS = ["50000", "100000", "200000", "500000", "1000000"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isMoneyLessThan(amount, "10000")) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }
    if (!selectedBank) {
      alert("Vui lòng chọn ngân hàng");
      return;
    }
    handleDeposit({
      bank_account_id: Number(selectedBank),
      amount: toMoneyString(amount),
    });
  };

  // Nếu API đã trả về kết quả thành công, hiển thị màn hình quét QR[cite: 5]
  if (depositResult) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)]">
        <h2 className="text-[18px] font-bold text-blue-nav mb-6 text-center">
          Thanh toán Quét mã QR
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
          {/* Cột QR Code */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-border flex flex-col items-center shrink-0 w-[250px]">
            {/* Sử dụng url QR trả về từ SePay / VietQR[cite: 5] */}
            <img
              src={depositResult.qr_url}
              alt="QR Code Thanh Toán"
              className="w-full h-auto rounded-lg mb-4"
            />
            <p className="text-[12.5px] text-center text-text-muted">
              Sử dụng App ngân hàng để quét mã. Giao dịch sẽ được cập nhật tự
              động.
            </p>
          </div>

          {/* Cột thông tin chuyển khoản thủ công */}
          <div className="flex-1 w-full max-w-md flex flex-col gap-4">
            <div className="bg-[#f0f6ff] border border-blue-primary/20 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-blue-primary/10 pb-2">
                <span className="text-[13px] text-text-muted">Ngân hàng</span>
                <span className="font-bold text-blue-nav">
                  {depositResult.bank_name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-primary/10 pb-2">
                <span className="text-[13px] text-text-muted">
                  Chủ tài khoản
                </span>
                <span className="font-bold text-blue-nav uppercase">
                  {depositResult.account_name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-primary/10 pb-2">
                <span className="text-[13px] text-text-muted">
                  Số tài khoản
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-primary text-[15px]">
                    {depositResult.account_number}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-blue-primary/10 pb-2">
                <span className="text-[13px] text-text-muted">Số tiền</span>
                <span className="font-bold text-orange-main text-[16px]">
                  {formatCurrency(depositResult.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-text-muted">
                  Nội dung (Bắt buộc)
                </span>
                <span className="font-extrabold text-red-500 text-[16px]">
                  {depositResult.transaction_code}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                resetDeposit();
                setAmount("");
                setSelectedBank("");
              }}
              className="mt-2 w-full py-2.5 rounded-lg border border-gray-border text-[14px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
            >
              Tạo lệnh nạp mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình tạo lệnh nạp
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] max-w-2xl mx-auto">
      <div className="mb-6 border-b border-gray-border pb-4">
        <h1 className="text-[20px] font-extrabold text-blue-nav mb-1">
          Nạp tiền vào ví
        </h1>
        <p className="text-[14px] text-text-muted">
          Tạo lệnh nạp tiền tự động qua quét mã QR
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Chọn số tiền */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[14px] font-semibold text-[#374151]">
            1. Chọn hoặc nhập số tiền cần nạp{" "}
            <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2 text-[13px] font-medium rounded-lg border transition-colors ${
                  amount === val
                    ? "bg-[#f0f6ff] border-blue-primary text-blue-primary"
                    : "border-gray-border text-[#475569] hover:border-blue-primary hover:text-blue-primary"
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền khác (Tối thiểu 10.000đ)"
              className="w-full h-[44px] pl-4 pr-12 border border-[#e2e8f0] rounded-lg text-[14px] outline-none transition-all focus:border-blue-primary focus:shadow-[0_0_0_3px_rgba(26,92,184,.1)]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              VNĐ
            </span>
          </div>
        </div>

        {/* Chọn ngân hàng */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[14px] font-semibold text-[#374151]">
            2. Chọn ngân hàng thụ hưởng <span className="text-red-500">*</span>
          </label>

          {isLoadingBanks ? (
            <div className="animate-pulse flex gap-3">
              <div className="h-[60px] bg-gray-200 rounded-lg flex-1"></div>
              <div className="h-[60px] bg-gray-200 rounded-lg flex-1"></div>
            </div>
          ) : banks.length === 0 ? (
            <p className="text-[13px] text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              Hiện chưa có ngân hàng nào khả dụng. Vui lòng liên hệ Admin.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {banks.map((bank) => (
                <label
                  key={bank.id}
                  className={`relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBank === bank.id
                      ? "border-blue-primary bg-[#f0f6ff]"
                      : "border-gray-border hover:border-blue-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name="bank"
                    value={bank.id}
                    checked={selectedBank === bank.id}
                    onChange={(e) => setSelectedBank(Number(e.target.value))}
                    className="mt-1"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-blue-nav leading-tight">
                      {bank.bank_name}
                    </span>
                    <span className="text-[12.5px] text-text-muted mt-0.5">
                      {bank.account_number}
                    </span>
                    <span className="text-[12px] text-gray-500 uppercase mt-0.5">
                      {bank.account_name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isDepositing || isLoadingBanks}
          className="mt-4 w-full bg-blue-primary hover:bg-[#154ea0] text-white font-bold h-[46px] rounded-lg text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDepositing ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            "Tạo Lệnh Nạp Tiền"
          )}
        </button>
      </form>
    </div>
  );
}
