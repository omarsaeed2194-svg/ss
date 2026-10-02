/* Cloud accounts for the Android app (or any web host outside claude.ai).
   1. Create a free project at https://supabase.com
   2. In the SQL editor, run android/supabase-schema.sql
   3. Paste your Project URL and anon public key below, then rebuild the APK.
   Leave them empty to keep the game local-only. On the claude.ai page, accounts work without this. */
window.CLOUD_CONFIG = window.CLOUD_CONFIG || {
  supabaseUrl: '',
  supabaseKey: '',
};
