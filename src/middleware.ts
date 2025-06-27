import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/create(.*)', // Protect the page for creating new posts
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    // If the route is protected, ensure the user is authenticated
    auth().protect();
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except for static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 