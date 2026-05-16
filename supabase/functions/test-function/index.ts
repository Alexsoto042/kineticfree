import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  return new Response('Hello from Test Function!', {
    headers: { 'Content-Type': 'text/plain' },
  });
});