// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jngczyuhbktyzhgfzivt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZ2N6eXVoYmt0eXpoZ2Z6aXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODEwNTksImV4cCI6MjA2Mzk1NzA1OX0.5OV9GGvAWFTY3zUdNFutOEZ8vB7yida2x9aSOX0v9DA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);