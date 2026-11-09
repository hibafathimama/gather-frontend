import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Read token from the incoming request cookies
    const token = request.cookies.get("token")?.value;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Backend URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${backendUrl}/events/filter-options`,
      {
        method: "GET",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        cache: "no-store",
      }
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("Filter options API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch filter options",
      },
      { status: 500 }
    );
  }
}