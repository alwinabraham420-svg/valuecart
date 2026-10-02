import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return clientInstance;
}

export const getSupabaseBrowserClient = createClient;
