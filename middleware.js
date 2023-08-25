import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};

const restrictedRoutes = [
    {
        start: "/me",
        include: ["/me", "/me/dashboard", "/me/settings", "/me/groups"],
        rewrite: "/me",
        redirect: "/login",
    },
    {
        start: "/user",
        redirect: "/login",
    },
    {
        start: "/group",
        redirect: "/login",
    },
    {
        start: "/admin",
        redirect: "/login",
    },
];

const isAuthenticated = async (req) => {
    const token = req.cookies.get("token")?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(
            process.env.REFRESH_TOKEN_SECRET,
        );

        const { payload } = await jwtVerify(token, secret, {
            issuer: "mnemefeast",
            audience: "mnemefeast",
        });

        return !!payload.id;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api")) {
        // Will need to check for Authorization header
        return NextResponse.next();
    }

    restrictedRoutes.forEach(async (route) => {
        if (pathname.startsWith(route.start)) {
            if (!(await isAuthenticated(req))) {
                return NextResponse.redirect(new URL(route.redirect, req.url));
            } else {
                if (route.include) {
                    if (!route.include.includes(pathname)) {
                        return NextResponse.redirect(
                            new URL(route.rewrite, req.url),
                        );
                    }
                }

                return NextResponse.next();
            }
        }
    });

    return NextResponse.next();
}
