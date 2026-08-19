import { NextRequest, NextResponse } from 'next/server';
import { checkStarrer } from '@/lib/starCheckServer';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

// Server-only: exchanges the OAuth code for an access token (using the client
// secret, which never ships to the browser) and derives the username from the
// token. Identity is decided here — the client can never submit a username.
export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();
    const clientId = process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'GitHub OAuth is not configured on this deployment.' },
        { status: 500 }
      );
    }
    if (!code || !redirectUri) {
      return NextResponse.json({ error: 'Missing OAuth code or redirect URI.' }, { status: 400 });
    }

    const tokenRes = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      const desc = tokenData.error_description || tokenData.error || 'OAuth exchange failed.';
      return NextResponse.json({ error: desc }, { status: 400 });
    }

    const userRes = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { error: `GitHub profile fetch failed (${userRes.status}).` },
        { status: 502 }
      );
    }

    const user = await userRes.json();
    const username: string = user.login as string;

    // Identity and star status are both decided server-side. The star check
    // runs as the repo owner (stargazer list lookup), never as the visitor.
    const star = await checkStarrer(username);
    return NextResponse.json({
      username,
      starred: star.starred,
      starMessage: star.message,
    });
  } catch (err: any) {
    console.error('OAuth exchange error:', err);
    return NextResponse.json(
      { error: err.message || 'OAuth exchange failed.' },
      { status: 500 }
    );
  }
}