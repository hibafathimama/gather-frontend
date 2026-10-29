import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
try {
const token = request.headers.get("authorization");
const cookie = request.headers.get("cookie");

const response = await fetch(`${BACKEND_URL}/favorites`, {
  method: "GET",
  headers: {
    ...(token ? { Authorization: token } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  },
  cache: "no-store",
});

const data = await response.json();

return NextResponse.json(data, { status: response.status });

} catch (error) {
console.error("Get favorites error:", error);

return NextResponse.json(
  { message: "Failed to fetch favorites" },
  { status: 500 }
);

}
}

export async function POST(request: NextRequest) {
try {
const token = request.headers.get("authorization");
const cookie = request.headers.get("cookie");
const body = await request.json();

const response = await fetch(`${BACKEND_URL}/favorites`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: token } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  },
  body: JSON.stringify(body),
  cache: "no-store",
});

const data = await response.json();

return NextResponse.json(data, { status: response.status });

} catch (error) {
console.error("Add favorite error:", error);

return NextResponse.json(
  { message: "Failed to add favorite" },
  { status: 500 }
);

}
}
