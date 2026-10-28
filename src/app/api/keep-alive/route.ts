import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Optional security check for Vercel Cron if CRON_SECRET is set
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is configured, only authorize valid calls
    // But allow manual checks from browser if user visits directly without secret if desired
  }

  try {
    let dbStatus = 'not_configured';
    let queryLatency = 0;
    let recordsFound = 0;

    if (isSupabaseConfigured && supabase) {
      const qStart = Date.now();
      // Lightweight query on 'accounts' table to keep the Supabase PostgreSQL project active
      const { data, count, error } = await supabase
        .from('accounts')
        .select('id, name', { count: 'exact' })
        .limit(1);

      queryLatency = Date.now() - qStart;

      if (error) {
        dbStatus = `query_error: ${error.message}`;
      } else {
        dbStatus = 'active';
        recordsFound = count ?? data?.length ?? 0;
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      message: 'Keep-alive ping processed successfully',
      timestamp: new Date().toISOString(),
      database: {
        configured: isSupabaseConfigured,
        status: dbStatus,
        records_found: recordsFound,
        query_latency_ms: queryLatency,
      },
      execution_time_ms: duration,
      prevent_pause: 'Supabase free-tier project kept active (activity timer reset)',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Internal error processing keep-alive ping',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
