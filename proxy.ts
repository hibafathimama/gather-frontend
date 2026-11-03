import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
const token = request.cookies.get("token")?.value;
const role = request.cookies.get("role")?.value;
const pathname = request.nextUrl.pathname;

// Public routes: accessible without login
const publicRoutes = ["/", "/login", "/register", "/events"];

const isPublicRoute = publicRoutes.some((route) => {
return pathname === route || pathname.startsWith(route + "/");
});

// Allow public routes without authentication
if (isPublicRoute) {
return NextResponse.next();
}

// Require authentication for protected pages
if (!token || !role) {
const loginUrl = new URL("/login", request.url);
loginUrl.searchParams.set("redirect", pathname);
return NextResponse.redirect(loginUrl);
}

// Protect admin routes
if (pathname.startsWith("/admin") && role !== "admin") {
return NextResponse.redirect(
new URL(
role === "organizer"
? "/organizer/dashboard"
: "/user/dashboard",
request.url
)
);
}

// Protect organizer routes
if (pathname.startsWith("/organizer") && role !== "organizer") {
return NextResponse.redirect(
new URL(
role === "admin"
? "/admin/dashboard"
: "/user/dashboard",
request.url
)
);
}

// Protect user routes
if (pathname.startsWith("/user") && role !== "user") {
return NextResponse.redirect(
new URL(
role === "admin"
? "/admin/dashboard"
: "/organizer/dashboard",
request.url
)
);
}

return NextResponse.next();
}

export const config = {
matcher: [
"/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)",
],
};
