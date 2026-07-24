import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
