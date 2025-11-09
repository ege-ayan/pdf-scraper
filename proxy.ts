import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const isAuthenticated = !!token;
    const isIndexPage = pathname === "/";

    if (isAuthenticated && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
    if (isAuthenticated && isIndexPage) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
    if (!isAuthenticated && isIndexPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|api/).*)"],
};
