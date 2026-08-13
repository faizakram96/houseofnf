import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || 'house_of_nf_super_secret_jwt_key_2026_production_grade';
const SALT_ROUNDS = 12;

export interface AdminJWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'staff';
  iat?: number;
  exp?: number;
}

/**
 * Hashes plain text password using Bcrypt with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares plain text password with stored Bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates signed JWT session token
 */
export function generateAdminToken(payload: { userId: string; email: string; role: 'admin' | 'staff' }): string {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: '7d',
    issuer: 'house-of-nf-atelier',
  });
}

/**
 * Verifies JWT session token and returns decoded payload
 */
export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET, {
      issuer: 'house-of-nf-atelier',
    }) as AdminJWTPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies admin authentication from HTTP-Only cookie or Authorization header
 */
export function verifyAdminSession(request: NextRequest): AdminJWTPayload | null {
  const cookieToken = request.cookies.get('hnf_admin_jwt')?.value || request.cookies.get('hnf_admin_session')?.value;
  if (cookieToken) {
    const payload = verifyAdminToken(cookieToken);
    if (payload) return payload;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }

  return null;
}

/**
 * Brute-Force Protection: Sliding Window IP Rate Limiter
 */
const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 Minutes
const MAX_LOGIN_ATTEMPTS = 15; // Increased threshold to avoid false lockouts during admin setup

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
  const allowedMax = isLocal ? 30 : MAX_LOGIN_ATTEMPTS;

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: allowedMax - 1 };
  }

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: allowedMax - 1 };
  }

  record.count += 1;

  if (record.count > allowedMax) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstAttempt)) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  return { allowed: true, remainingAttempts: allowedMax - record.count };
}

export function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Prevents NoSQL Injection and Regular Expression DoS (ReDoS)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
}
