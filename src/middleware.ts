import { authMiddleware } from "@clerk/nextjs";

const publicPages = [
  "/api/chat",
  // (/secret requires auth)
];

// Case i18n
const locales = ["en", "fr"];

export default authMiddleware({
  publicRoutes(req) {
    const publicPathnameRegex = RegExp(
      `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
      "i",
    );

    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

    return !!isPublicPage;
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
