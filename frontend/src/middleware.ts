import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = ["/login"];

  // Берём токен только из куки "token"
  const token = request.cookies.get("token")?.value;

  // Если нет токена и путь не публичный → редирект на login
  if (!token && !publicPaths.includes(path)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "vtk#education123123"
      );
      const { payload } = await jwtVerify(token, secret);

      const role = payload.role as string | undefined;

      if (!role) throw new Error("Role not found");

      if (path.startsWith("/teacher") && role !== "teacher") {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/test" : "/student", request.url)
        );
      }

      if (path.startsWith("/test") && role !== "admin") {
        return NextResponse.redirect(
          new URL(role === "teacher" ? "/teacher" : "/student", request.url)
        );
      }

      if (path.startsWith("/student") && role !== "student") {
        return NextResponse.redirect(
          new URL(role === "teacher" ? "/teacher" : "/test", request.url)
        );
      }

      // Admin доступ везде
      return NextResponse.next();
    } catch (err) {
      console.error("[Middleware] Token verification failed:", err);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/test/:path*",
  ],
};
