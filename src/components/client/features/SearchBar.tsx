"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/hooks/client/useCatalog";

export default function SearchBar() {
  const { categories, isLoading } = useCatalog();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (categoryId) params.set("category_id", categoryId);
    if (type) params.set("type", type);
    const query = params.toString();
    router.push(query ? `/source-code?${query}` : "/source-code");
  };

  return (
    <div className="bg-white p-0 -mt-[1px]">
      <div className="max-w-[1350px] mx-auto px-5">
        <form onSubmit={handleSearch} className="bg-white rounded-[10px] md:rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,.12)] flex flex-col lg:flex-row items-stretch p-[16px] lg:p-[16px_8px] gap-0 -mt-[16px] md:-mt-[20px] lg:-mt-[30px] relative z-10 border border-[#e8edf5]">
          
          {/* Tìm từ khóa */}
          <div className="flex-1 px-[4px] lg:px-[18px] py-[8px] lg:py-0 flex flex-col justify-center gap-1">
            <label className="text-[11.5px] font-bold text-[#374151] tracking-[.2px] block">
              Tìm mã nguồn
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập từ khoá..."
                className="w-full border-none outline-none text-[13.5px] text-[#9ca3af] bg-transparent py-1 pr-7 appearance-none cursor-pointer focus:text-gray-700"
              />
              <i className="fas fa-search absolute right-[2px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px] pointer-events-none"></i>
            </div>
          </div>
          <div className="w-full lg:w-[1px] h-[1px] lg:h-auto bg-[#e5e7eb] shrink-0 my-0 lg:my-1"></div>

          {/* Chọn Danh mục từ API */}
          <div className="flex-1 px-[4px] lg:px-[18px] py-[8px] lg:py-0 flex flex-col justify-center gap-1">
            <label className="text-[11.5px] font-bold text-[#374151] tracking-[.2px] block">
              Danh mục
            </label>
            <div className="relative">
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border-none outline-none text-[13.5px] text-[#9ca3af] bg-transparent py-1 pr-7 appearance-none cursor-pointer focus:text-[#374151]"
              >
                <option value="">Tất cả danh mục</option>
                {!isLoading && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-[2px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px] pointer-events-none"></i>
            </div>
          </div>
          <div className="w-full lg:w-[1px] h-[1px] lg:h-auto bg-[#e5e7eb] shrink-0 my-0 lg:my-1"></div>

          {/* Phân loại (Type) dựa trên Enum backend */}
          <div className="flex-1 px-[4px] lg:px-[18px] py-[8px] lg:py-0 flex flex-col justify-center gap-1">
            <label className="text-[11.5px] font-bold text-[#374151] tracking-[.2px] block">
              Phân loại
            </label>
            <div className="relative">
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border-none outline-none text-[13.5px] text-[#9ca3af] bg-transparent py-1 pr-7 appearance-none cursor-pointer focus:text-[#374151]"
              >
                <option value="">Tất cả phân loại</option>
                <option value="source_code">Mã nguồn</option>
                <option value="template">Template</option>
                <option value="script">Script</option>
                <option value="plugin">Plugin</option>
                <option value="other">Khác</option>
              </select>
              <i className="fas fa-chevron-down absolute right-[2px] top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px] pointer-events-none"></i>
            </div>
          </div>
          <button 
            type="submit"
            className="bg-blue-primary hover:bg-[#154ea0] text-white border-none p-[13px] lg:py-[12px] lg:px-[28px] rounded-lg text-[14px] font-bold cursor-pointer whitespace-nowrap transition-colors mt-[4px] lg:mt-0 lg:ml-[12px] self-center w-full lg:w-auto"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  );
}
