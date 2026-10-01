import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin' | 'operator';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'auth_users.json');
const SESSION_SECRET = process.env.AUTH_SECRET || 'valuecart-secure-auth-secret-key-2026';

function ensureUsersFile(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(content) as StoredUser[];
  } catch (err) {
    console.error('Error reading auth users file:', err);
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving auth users:', err);
  }
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, userSalt, 64).toString('hex');
  return { hash, salt: userSalt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

export function getUserByEmail(email: string): StoredUser | null {
  const users = ensureUsersFile();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export function getUserById(id: string): StoredUser | null {
  const users = ensureUsersFile();
  return users.find((u) => u.id === id) || null;
}

export function createStoredUser(params: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'admin';
}): StoredUser {
  const users = ensureUsersFile();
  const cleanEmail = params.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    // Update password and info
    const { hash, salt } = hashPassword(params.password);
    existing.passwordHash = hash;
    existing.salt = salt;
    if (params.fullName) existing.fullName = params.fullName.trim();
    if (params.phone) existing.phone = params.phone.trim();
    existing.updatedAt = new Date().toISOString();
    saveUsers(users);
    return existing;
  }

  const { hash, salt } = hashPassword(params.password);
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: cleanEmail,
    passwordHash: hash,
    salt,
    fullName: params.fullName.trim() || cleanEmail.split('@')[0],
    phone: (params.phone || '').trim(),
    role: params.role || (cleanEmail.includes('admin') ? 'admin' : 'customer'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function createSessionToken(user: StoredUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): {
  sub: string;
  email: string;
  name: string;
  role: string;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSig) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
