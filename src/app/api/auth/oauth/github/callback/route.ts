import { NextRequest, NextResponse } from "next/server";
import { getApiKeys, saveApiKeys } from "@/lib/actions/keys";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=${encodeURIComponent(error || "No code provided")}`);
  }

  const keys = await getApiKeys();
  const clientId = keys.githubClientId || process.env.GITHUB_CLIENT_ID;
  const clientSecret = keys.githubClientSecret || process.env.GITHUB_CLIENT_SECRET;

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=${encodeURIComponent(tokenData.error_description || "Invalid token response")}`);
    }

    // Save live GitHub Access Token
    await saveApiKeys({
      githubConnected: true,
      githubAccessToken: tokenData.access_token,
    });

    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_success=github`);
  } catch (e) {
    console.error("GitHub OAuth error:", e);
    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=internal_error`);
  }
}
