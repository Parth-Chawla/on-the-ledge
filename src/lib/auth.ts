import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

const COOKIE = "otl_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  monthly_income: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET is missing. Set it in .env.local.");
  }
  return value;
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function encodeSession(userId: number) {
  const body = `${userId}.${Date.now() + MAX_AGE_MS}`;
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = sign(body);
  const given = Buffer.from(parts[2]);
  const actual = Buffer.from(expected);
  if (given.length !== actual.length || !timingSafeEqual(given, actual)) {
    return null;
  }
  const userId = Number(parts[0]);
  const exp = Number(parts[1]);
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isFinite(exp)) {
    return null;
  }
  if (Date.now() > exp) return null;
  return userId;
}

export async function readSessionUserId(): Promise<number | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await readSessionUserId();
  if (!userId) return null;
  const rows = await query<SessionUser>(
    `SELECT user_id, first_name, last_name, email, monthly_income
     FROM users
     WHERE user_id = :userId
     LIMIT 1`,
    { userId },
  );
  return rows[0] ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function setSessionCookie(userId: number) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
