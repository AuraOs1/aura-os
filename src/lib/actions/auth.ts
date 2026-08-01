"use server";

import { cookies } from "next/headers";

export async function loginFounder(rawEmail: string, rawPassword: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("aura_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return { success: false, error: message };
  }
}

export async function logoutFounder() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("aura_session");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return { success: false, error: message };
  }
}
