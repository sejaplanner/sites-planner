
-- Tabela para armazenar os briefings dos clientes
CREATE TABLE client_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  company_name TEXT,
  slogan TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT,
  description TEXT,
  differentials TEXT,
  products_services TEXT,
  target_audience TEXT,
  social_proof TEXT,
  design_preferences TEXT,
  contact_info TEXT,
  website_objective TEXT,
  additional_info TEXT,
  uploaded_files TEXT[], -- Array de URLs dos arquivos
  conversation_log JSONB, -- Log completo da conversa
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_client_briefings_session_id ON client_briefings(session_id);
CREATE INDEX idx_client_briefings_status ON client_briefings(status);
CREATE INDEX idx_client_briefings_created_at ON client_briefings(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE client_briefings ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e atualização de dados
CREATE POLICY "Allow insert and update for briefings" ON client_briefings
  FOR ALL USING (true);

-- Criar bucket para armazenar arquivos dos clientes
INSERT INTO storage.buckets (id, name, public) VALUES ('client-files', 'client-files', true);

-- Política para permitir upload de arquivos
CREATE POLICY "Allow file uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-files');

-- Política para permitir acesso público aos arquivos
CREATE POLICY "Allow public access to files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-files');
