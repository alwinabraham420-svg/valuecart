import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByEmail,
  getUserById,
  createStoredUser,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth/authStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    const body = await req.json();

    if (action === 'register') {
      const { email, password, fullName, phone } = body;

      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }

      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const user = createStoredUser({
        email,
        password,
        fullName: fullName || email.split('@')[0],
        phone: phone || '',
      });

      const token = createSessionToken(user);

      const clientUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.fullName,
          phone: user.phone,
        },
        app_metadata: {
          role: user.role,
        },
      };

      const profile = {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
      };

      const response = NextResponse.json({
        user: clientUser,
        profile,
        session: { access_token: token, user: clientUser },
        message: 'Account created successfully!',
      });

      response.cookies.set('valuecart_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }

      if (!password) {
        return NextResponse.json({ error: 'Please enter your password.' }, { status: 400 });
      }

      let user = getUserByEmail(email);

      if (!user) {
        // Auto-create customer account on first login attempt if it doesn't exist
        // This ensures users who entered their password during sign-in can immediately access their account
        user = createStoredUser({
          email,
          password,
          fullName: email.split('@')[0],
          phone: '',
        });
      } else {
        const isValid = verifyPassword(password, user.passwordHash, user.salt);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Incorrect password for this email. Please check your credentials.' },
            { status: 401 }
          );
        }
      }

      const token = createSessionToken(user);

      const clientUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.fullName,
          phone: user.phone,
        },
        app_metadata: {
          role: user.role,
        },
      };

      const profile = {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
      };

      const response = NextResponse.json({
        user: clientUser,
        profile,
        session: { access_token: token, user: clientUser },
        message: 'Signed in successfully!',
      });

      response.cookies.set('valuecart_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
      response.cookies.delete('valuecart_session');
      return response;
    }

    return NextResponse.json({ error: 'Invalid auth action' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal authentication error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === 'session') {
    const token =
      req.cookies.get('valuecart_session')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null, profile: null, session: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ user: null, profile: null, session: null });
    }

    const user = getUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ user: null, profile: null, session: null });
    }

    const clientUser = {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.fullName,
        phone: user.phone,
      },
      app_metadata: {
        role: user.role,
      },
    };

    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
    };

    return NextResponse.json({
      user: clientUser,
      profile,
      session: { access_token: token, user: clientUser },
    });
  }

  return NextResponse.json({ error: 'Invalid auth action' }, { status: 400 });
}
