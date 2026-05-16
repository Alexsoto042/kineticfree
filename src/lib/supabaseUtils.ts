// Local definition to fix breaking change in older supabase-js version
export interface PostgrestError {
  message: string;
  details: string;
  hint: string;
  code: string;
  name?: string;
}

// Make SupabaseResponse more generic to handle different error types
export interface GenericSupabaseResponse<T, E> {
  data: T; // Data can be null, but the structure is always there
  error: E | null;
}

// Utility to add a timeout to a Promise
export function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject({ data: null, error: { name: 'TimeoutError', message: 'Timeout', code: '408', details: 'Request timed out', hint: '' } }), ms)
  );
  return Promise.race([promise, timeout]);
}
