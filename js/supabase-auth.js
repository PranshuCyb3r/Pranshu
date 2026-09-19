/* Create one Supabase client. The anon key is designed for browser use; enable RLS in Supabase. */
const SUPABASE_URL = "https://caoyjwgzoubmajtlgshw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wsFdEb4PGNejNNgMGIBUhQ_fv0k2Awa";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("The Supabase SDK could not be loaded.");
}

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
