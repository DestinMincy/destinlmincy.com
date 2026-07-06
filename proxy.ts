import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/portal(.*)", "/admin(.*)"]);

/**
 * Runs Clerk session resolution on every request and requires authentication
 * before the client portal or admin areas render.
 *
 * Named `proxy.ts` (not `middleware.ts`) because Next.js 16 renamed the file
 * convention; `clerkMiddleware()` itself is unchanged.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
