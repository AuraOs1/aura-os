import { NextRequest, NextResponse } from "next/server";
import { getApiKeys } from "@/lib/actions/keys";

export async function GET(request: NextRequest) {
  const keys = await getApiKeys();
  const clientId = keys.githubClientId || process.env.GITHUB_CLIENT_ID || "Ov23rtAuraPublicApp";

  const redirectUri = `${request.nextUrl.origin}/api/auth/oauth/github/callback`;
  const scope = "user repo workflow";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(githubAuthUrl);
}
