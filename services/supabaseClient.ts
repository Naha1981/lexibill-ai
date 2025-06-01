import { createClient } from '@supabase/supabase-js';

// Provided Supabase credentials
const supabaseUrl = 'https://nreugikcknrbphfkdiba.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZXVnaWtja25yYnBoZmtkaWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzI4NjYsImV4cCI6MjA2NDM0ODg2Nn0.UcehxnOm0cfVY0fV78Fk2ON8HRdfh-alwzRCzEQqtPs';

if (!supabaseUrl || !supabaseAnonKey) {
  alert("Supabase URL and Anon Key are required. Please check your configuration.");
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
