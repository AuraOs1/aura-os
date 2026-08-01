import { NextRequest, NextResponse } from "next/server";
import { getApiKeys, saveApiKeys } from "@/lib/actions/keys";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=${encodeURIComponent(error || "No code provided")}`);
  }

  const keys = await getApiKeys();
  const clientId = keys.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = keys.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${request.nextUrl.origin}/api/auth/oauth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Google token exchange failed:", errBody);
      return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    
    // Save live OAuth tokens to key store
    await saveApiKeys({
      googleConnected: true,
      googleAccessToken: tokenData.access_token,
      googleRefreshToken: tokenData.refresh_token || keys.googleRefreshToken,
    });

    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_success=google`);
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(`${request.nextUrl.origin}/settings?oauth_error=internal_error`);
  }
}
