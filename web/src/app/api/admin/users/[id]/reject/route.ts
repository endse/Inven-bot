import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ message: 'User rejected successfully', user: { id: user.id, status: user.status } });
  } catch (error: any) {
    console.error('Reject user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
