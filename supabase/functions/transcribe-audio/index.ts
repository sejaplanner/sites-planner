
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('Dados de áudio não fornecidos');
    }

    console.log('🎤 Processando áudio para transcrição...');
    
    // Converter base64 para binary de forma mais eficiente
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('📦 Áudio processado, tamanho:', bytes.length, 'bytes');
    
    // Preparar form data
    const formData = new FormData();
    // Usar audio/wav como tipo MIME mais compatível
    const blob = new Blob([bytes], { type: 'audio/wav' });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    console.log('🚀 Enviando para OpenAI...');

    // Enviar para OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API OpenAI:', errorText);
      throw new Error(`Erro da API OpenAI: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Transcrição concluída:', result.text);

    return new Response(
      JSON.stringify({ 
        success: true,
        text: result.text || '',
        confidence: result.confidence || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na transcrição:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
