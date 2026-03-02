import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    })

    // ==========================================
    // 2. ADMIN ROUTES PROTECTION
    // ==========================================
    if (pathname.startsWith("/admin")) {

        if (pathname === "/admin/login") {
            if (token && token.role === "admin") {
                return NextResponse.redirect(new URL("/admin", req.url))
            }
            return NextResponse.next()
        }

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", req.url))
        }

        if (token.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        return NextResponse.next()
    }

    // ==========================================
    // 3. USER PROTECTED ROUTES
    // ==========================================
    if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
}