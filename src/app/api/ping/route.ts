import { NextRequest, NextResponse } from 'next/server';
import { GET as keepAliveGET, POST as keepAlivePOST } from '../keep-alive/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return keepAliveGET(req);
}

export async function POST(req: NextRequest) {
  return keepAlivePOST(req);
}
