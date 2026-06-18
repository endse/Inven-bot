import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Make the first user an ADMIN automatically
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';
    const status = userCount === 0 ? 'APPROVED' : 'PENDING';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        status
      }
    });

    return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, email: user.email, role: user.role, status: user.status } });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
