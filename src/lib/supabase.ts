
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jngczyuhbktyzhgfzivt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZ2N6eXVoYmt0eXpoZ2Z6aXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODEwNTksImV4cCI6MjA2Mzk1NzA1OX0.5OV9GGvAWFTY3zUdNFutOEZ8vB7yida2x9aSOX0v9DA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
