// === SUPABASE CLIENT: Create the shared browser client used by the student and admin pages. ===
// This client makes it possible to authenticate an admin and save visitor check-ins through the Supabase backend.
const SUPABASE_URL = "https://aidugxbvsabspuoyuhkl.supabase.co";
const SUPABASE_KEY = "sb_publishable_765qVFgt5Z4MWCiZas0tTg_l43PTl10";

// The browser loads the Supabase JavaScript SDK before this file, so we can initialize the shared database client here.
const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);