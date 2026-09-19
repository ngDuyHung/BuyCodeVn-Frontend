import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/config/env";

interface DownloadRouteContext {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: DownloadRouteContext,
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, message: "ID sản phẩm không hợp lệ." },
      { status: 400 },
    );
  }

  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Vui lòng đăng nhập để tải sản phẩm." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/v1/catalog/products/${id}/download`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/octet-stream, application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(30000),
      },
    );

    const headers = new Headers();
    for (const name of [
      "content-type",
      "content-length",
      "content-disposition",
      "x-request-id",
    ]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("cache-control", "private, no-store");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Không thể kết nối máy chủ tải xuống." },
      { status: 504 },
    );
  }
}
