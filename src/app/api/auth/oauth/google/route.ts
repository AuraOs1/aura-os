import { NextRequest, NextResponse } from "next/server";
import { getApiKeys } from "@/lib/actions/keys";

export async function GET(request: NextRequest) {
  const keys = await getApiKeys();
  
  // Use custom Client ID if entered, or default public Google App Client ID for 1-click login
  const clientId = keys.googleClientId || process.env.GOOGLE_CLIENT_ID || "1008272973714-aura-public-app.apps.googleusercontent.com";

  const redirectUri = `${request.nextUrl.origin}/api/auth/oauth/google/callback`;
  const scopes = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ].join(" ");

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
