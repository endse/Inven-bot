import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'PENDING') {
      return NextResponse.json({ error: 'Account pending approval by admin' }, { status: 403 });
    }
    
    if (user.status === 'REJECTED') {
      return NextResponse.json({ error: 'Account registration rejected' }, { status: 403 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    return NextResponse.json({ message: 'Logged in successfully' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
