import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // 1. Get the token (checks cookies)
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    })

    // ==========================================
    // 2. ADMIN ROUTES PROTECTION
    // ==========================================
    if (pathname.startsWith("/admin")) {

        // Allow the admin login page itself to pass through
        if (pathname === "/admin/login") {
            // If already logged in as admin, send to dashboard
            if (token && token.role === "admin") {
                return NextResponse.redirect(new URL("/admin", req.url))
            }
            return NextResponse.next()
        }

        // For all other admin pages...

        // A. Not Logged In? -> Redirect to Admin Login
        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", req.url))
        }

        // B. Logged in but NOT Admin? -> Redirect to Home
        if (token.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // C. Logged in as Admin -> Allow
        return NextResponse.next()
    }

    // ==========================================
    // 3. USER PROTECTED ROUTES (Profile, Checkout)
    // ==========================================
    if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        return NextResponse.next()
    }

    // ==========================================
    // 4. PUBLIC ROUTES
    // ==========================================
    return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
}