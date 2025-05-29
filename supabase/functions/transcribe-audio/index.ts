
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache simples para evitar transcrições duplicadas
const transcriptionCache = new Map<string, string>();

// Função para converter WebM para WAV usando Web Audio API no cliente
const convertWebmToWav = (webmData: Uint8Array): Uint8Array => {
  // Para edge functions, vamos retornar os dados como estão
  // A conversão deve ser feita no cliente usando Web Audio API
  return webmData;
};

const generateCacheKey = (audioData: Uint8Array): string => {
  // Gerar hash simples para cache
  let hash = 0;
  for (let i = 0; i < Math.min(audioData.length, 1000); i++) {
    const char = audioData[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
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
    
    // Processar base64 em chunks para evitar problemas de memória
    const processBase64InChunks = (base64String: string, chunkSize = 8192) => {
      const chunks: Uint8Array[] = [];
      let position = 0;
      
      while (position < base64String.length) {
        const chunk = base64String.slice(position, position + chunkSize);
        const binaryChunk = atob(chunk);
        const bytes = new Uint8Array(binaryChunk.length);
        
        for (let i = 0; i < binaryChunk.length; i++) {
          bytes[i] = binaryChunk.charCodeAt(i);
        }
        
        chunks.push(bytes);
        position += chunkSize;
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    };

    const bytes = processBase64InChunks(audio);
    console.log('📦 Áudio processado, tamanho:', bytes.length, 'bytes');

    // Verificar cache
    const cacheKey = generateCacheKey(bytes);
    if (transcriptionCache.has(cacheKey)) {
      console.log('✅ Transcrição encontrada no cache');
      return new Response(
        JSON.stringify({ 
          success: true,
          text: transcriptionCache.get(cacheKey) || '',
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação de tamanho (máximo 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (bytes.length > maxSize) {
      throw new Error('Arquivo de áudio muito grande (máximo 25MB)');
    }
    
    // Preparar form data com múltiplos formatos suportados
    const formData = new FormData();
    
    // Detectar formato baseado nos primeiros bytes
    const isWebM = bytes.length > 4 && 
      bytes[0] === 0x1A && bytes[1] === 0x45 && 
      bytes[2] === 0xDF && bytes[3] === 0xA3;
    
    const isWAV = bytes.length > 12 && 
      bytes[0] === 0x52 && bytes[1] === 0x49 && 
      bytes[2] === 0x46 && bytes[3] === 0x46;

    let mimeType = 'audio/wav';
    let fileName = 'audio.wav';
    
    if (isWebM) {
      mimeType = 'audio/webm';
      fileName = 'audio.webm';
      console.log('🎵 Formato detectado: WebM');
    } else if (isWAV) {
      mimeType = 'audio/wav';
      fileName = 'audio.wav';
      console.log('🎵 Formato detectado: WAV');
    } else {
      console.log('🎵 Formato não detectado, usando WAV como padrão');
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    console.log('🚀 Enviando para OpenAI...');

    // Implementar retry com backoff exponencial
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        if (attempt > 0) {
          console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries} após ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
          body: formData,
          signal: AbortSignal.timeout(30000) // 30 segundos timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro da API OpenAI (tentativa ${attempt + 1}):`, response.status, errorText);
          lastError = new Error(`Erro da API OpenAI: ${response.status} - ${errorText}`);
          
          // Se for erro 4xx, não retentar
          if (response.status >= 400 && response.status < 500) {
            break;
          }
          continue;
        }

        const result = await response.json();
        const transcriptionText = result.text || '';
        
        console.log('✅ Transcrição concluída:', transcriptionText);

        // Salvar no cache
        if (transcriptionText.trim()) {
          transcriptionCache.set(cacheKey, transcriptionText);
          
          // Limitar tamanho do cache
          if (transcriptionCache.size > 100) {
            const firstKey = transcriptionCache.keys().next().value;
            transcriptionCache.delete(firstKey);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            text: transcriptionText,
            confidence: result.confidence || null,
            retries: attempt
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, error);
        lastError = error as Error;
        
        // Se for timeout, tentar novamente
        if (error.name === 'AbortError') {
          continue;
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    throw lastError || new Error('Falha após todas as tentativas');

  } catch (error) {
    console.error('❌ Erro na transcrição:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
