import { NextRequest, NextResponse } from 'next/server';

// GitHub OAuth Apps redirect here after authorization — this path is the one
// registered as the app's callback URL (https://gitdeep.vercel.app/api/auth/callback/github).
// Forward to the real callback page, preserving the query params.
export async function GET(request: NextRequest) {
  const target = new URL('/auth/callback', request.nextUrl.origin);
  for (const key of ['code', 'state', 'error', 'error_description']) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target, 302);
}