import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/cadastro"];

function isPublicRoute(pathname: string) {
    return publicRoutes.includes(pathname);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const meUrl = new URL("/api/me", process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(meUrl, {
        headers: {
            cookie: request.headers.get("cookie") ?? "",
        },
    });

    const isAuthenticated = response.ok;

    let user: {
        role?: "ADMIN" | "USER";
    } | null = null;

    if (isAuthenticated) {
        const data = await response.json();
        user = data.user;
    }

    if (!(isAuthenticated || isPublicRoute(pathname))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthenticated && isPublicRoute(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
