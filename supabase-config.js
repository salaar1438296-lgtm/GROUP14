/*
  Add your Supabase project details here.
  Supabase Dashboard -> Project Settings -> API
  Use the Project URL and the publishable/anon key only.
  NEVER put the service_role/secret key in this file.
*/

const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE";

let supabaseClient = null;

if (window.supabase && SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_ANON_KEY.includes("PASTE_")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
