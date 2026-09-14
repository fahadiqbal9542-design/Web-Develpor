import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseBackupPayload, restoreDatabaseBackup } from './databaseManager';

let supabaseClient: SupabaseClient | null = null;

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.trim() !== '' &&
    SUPABASE_ANON_KEY.trim() !== '' &&
    !SUPABASE_URL.includes('your-supabase-url')
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseClient;
}

export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor:
create table if not exists school_app_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and permit anonymous website sync
alter table school_app_data enable row level security;

drop policy if exists "Allow public access" on school_app_data;
create policy "Allow public access" on school_app_data
  for all
  using (true)
  with check (true);
`;

/**
 * Pushes entire site dataset (cards, founder photo, faculty photos, gallery, student records) to Supabase table
 */
export async function pushToSupabase(payload: DatabaseBackupPayload): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set.' };
  }

  try {
    const { error } = await supabase
      .from('school_app_data')
      .upsert(
        {
          id: 'main_site_data',
          data: payload.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message.includes('relation "school_app_data" does not exist')) {
        return {
          success: false,
          error: 'Table "school_app_data" does not exist in your Supabase database yet. Please run the SQL setup script in your Supabase SQL Editor.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

/**
 * Pulls latest site data from Supabase and applies it to local storage & IndexedDB
 */
export async function pullFromSupabase(): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('school_app_data')
      .select('data, updated_at')
      .eq('id', 'main_site_data')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || !data.data) {
      return { success: false, error: 'No existing data found in Supabase table "school_app_data". Try pushing your data first.' };
    }

    await restoreDatabaseBackup(JSON.stringify({ data: data.data }));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}
