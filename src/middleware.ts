import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 1. Pengamanan Rute Admin
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        // Lempar ke beranda jika bukan admin
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 2. Onboarding Enforcer (Mencegah bypass ke dashboard dll)
    const coreRoutes = ["/dashboard", "/explore", "/exchanges", "/proposals"];
    const isCoreRoute = coreRoutes.some(route => pathname.startsWith(route));
    
    if (isCoreRoute && token?.is_onboarded === false) {
      // Lempar secara paksa ke halaman onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Izinkan request diteruskan ke fungsi middleware di atas JIKA user sudah login (token ada)
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Admin Routes
    "/admin/:path*", 
    "/api/admin/:path*",
    // Core User Routes yang butuh Onboarding
    "/dashboard/:path*",
    "/explore/:path*",
    "/exchanges/:path*",
    "/proposals/:path*"
  ],
};
