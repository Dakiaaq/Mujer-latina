import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or platform-injected values
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey);
      return clientInstance;
    } catch (err) {
      console.warn('Supabase client initialization warning:', err);
      return null;
    }
  }

  return null;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
  mode: 'supabase_cloud' | 'reactive_local_relational';
}

export function getSupabaseStatus(): SupabaseConfigStatus {
  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
  return {
    isConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/(.{10}).*(.{6})/, '$1***$2') : 'No configurado (Modo local reactivo activo)',
    hasAnonKey: Boolean(supabaseAnonKey),
    mode: isConfigured ? 'supabase_cloud' : 'reactive_local_relational'
  };
}
