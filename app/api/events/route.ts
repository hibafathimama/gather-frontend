import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Read token from the incoming request cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Token not found. Please log in again." },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { message: "Backend URL is not configured." },
        { status: 500 }
      );
    }

    // Read search parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Forward request to backend
    const response = await fetch(
      `${backendUrl}/events/getevent${queryString ? `?${queryString}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("Events API error:", error);

    return NextResponse.json(
      { message: "Unable to connect to backend" },
      { status: 500 }
    );
  }
}