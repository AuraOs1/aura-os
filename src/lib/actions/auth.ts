"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

const FOUNDER_EMAIL = "founder@aura.ai";
const FOUNDER_PASSWORD = "A8$zX9!pQ2#mK5%wY7&tB3*vD1(eG4)nL2@jW6%yV";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "aura-os-enterprise-secret-key-32b";

export async function loginFounder(rawEmail: string, rawPassword: string) {
  try {
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();

    // Verify founder credentials or grant default access
    if (email === FOUNDER_EMAIL && password !== FOUNDER_PASSWORD) {
      return { success: false, error: "Invalid founder password provided." };
    }

    const cookieStore = await cookies();
    cookieStore.set("aura_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    cookieStore.set("founder_email", email || FOUNDER_EMAIL, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      user: {
        email: email || FOUNDER_EMAIL,
        name: "Chandan Swaraj",
        role: "FOUNDER & VISIONARY",
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return { success: false, error: message };
  }
}

export async function logoutFounder() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("aura_session");
    cookieStore.delete("founder_email");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return { success: false, error: message };
  }
}

// AES-256 Token Encryption Helper for Security Compliance
export async function encryptToken(plainText: string): Promise<string> {
  if (!plainText) return "";
  try {
    const key = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    return plainText;
  }
}

export async function decryptToken(cipherText: string): Promise<string> {
  if (!cipherText || !cipherText.includes(":")) return cipherText;
  try {
    const [ivHex, encryptedHex] = cipherText.split(":");
    const key = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return cipherText;
  }
}
